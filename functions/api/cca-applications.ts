// Cloudflare worker types
type D1Database = any;
type PagesFunction<T, P = any> = any;

interface Env {
  DB: D1Database;
}

// ═══════════════════════════════════════════════════════
// CCA Applications & Job Offers API
// ═══════════════════════════════════════════════════════

const MAX_PENDING_OFFERS = 5; // 한 지원자에게 동시에 보류 가능한 최대 제안 수

async function ensureTables(db: any) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS cca_applications (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      nickname TEXT,
      real_name TEXT,
      phone TEXT,
      email TEXT,
      age TEXT,
      body_size TEXT,
      languages TEXT,
      experience TEXT,
      introduction TEXT,
      image TEXT,
      pin TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      venue_option TEXT,
      preferred_venue_id TEXT,
      preferred_venue_name TEXT,
      pending_offers_count INTEGER DEFAULT 0,
      hired_venue_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS cca_job_offers (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL,
      venue_id TEXT NOT NULL,
      venue_name TEXT,
      message TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      responded_at DATETIME
    )
  `).run();
}

export const onRequest: PagesFunction<Env> = async (context: any) => {
  const { env, request } = context;
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  const db = env.DB;

  await ensureTables(db);

  // ═══════════════════════════════════════
  // GET: List/Query applications & offers
  // ═══════════════════════════════════════
  if (request.method === 'GET') {
    try {
      // Applicant status check (login with name + pin)
      if (action === 'applicantStatus') {
        const name = url.searchParams.get('name');
        const pin = url.searchParams.get('pin');
        if (!name || !pin) {
          return json({ error: 'Name and PIN are required' }, 400);
        }
        const app = await db.prepare(
          `SELECT * FROM cca_applications WHERE name = ? AND pin = ?`
        ).bind(name, pin).first();

        if (!app) {
          return json({ error: 'No application found. Please check your name and PIN.' }, 404);
        }

        // Get offers for this application
        const { results: offers } = await db.prepare(
          `SELECT * FROM cca_job_offers WHERE application_id = ? ORDER BY created_at DESC`
        ).bind(app.id).all();

        return json({
          application: {
            ...app,
            languages: app.languages ? JSON.parse(app.languages) : []
          },
          offers: offers || []
        });
      }

      // List all applications (for admin/super admin)
      if (action === 'listAll') {
        const statusFilter = url.searchParams.get('status');
        let query = `SELECT * FROM cca_applications`;
        const params: any[] = [];

        if (statusFilter) {
          query += ` WHERE status = ?`;
          params.push(statusFilter);
        }
        query += ` ORDER BY created_at DESC`;

        const { results } = params.length
          ? await db.prepare(query).bind(...params).all()
          : await db.prepare(query).all();

        const formatted = (results || []).map((a: any) => ({
          ...a,
          languages: a.languages ? JSON.parse(a.languages) : []
        }));

        return json(formatted);
      }

      // Get offers for a specific application
      if (action === 'offers') {
        const applicationId = url.searchParams.get('applicationId');
        if (!applicationId) return json({ error: 'applicationId required' }, 400);

        const { results } = await db.prepare(
          `SELECT * FROM cca_job_offers WHERE application_id = ? ORDER BY created_at DESC`
        ).bind(applicationId).all();

        return json(results || []);
      }

      // Get a single application by id
      const appId = url.searchParams.get('id');
      if (appId) {
        const app = await db.prepare(`SELECT * FROM cca_applications WHERE id = ?`).bind(appId).first();
        if (!app) return json({ error: 'Not found' }, 404);
        return json({
          ...app,
          languages: app.languages ? JSON.parse(app.languages) : []
        });
      }

      return json({ error: 'Invalid GET request. Use action parameter.' }, 400);

    } catch (error: any) {
      return json({ error: error.message }, 500);
    }
  }

  // ═══════════════════════════════════════
  // POST: Create application or job offer
  // ═══════════════════════════════════════
  if (request.method === 'POST') {
    try {
      const body = await request.json();

      // Submit a new application
      if (action === 'apply') {
        const {
          name, nickname, realName, phone, email, age, bodySize,
          languages, experience, introduction, image, pin,
          venueOption, preferredVenueId, preferredVenueName
        } = body;

        if (!name || !pin) {
          return json({ error: 'Name and PIN are required' }, 400);
        }

        const id = `app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

        await db.prepare(`
          INSERT INTO cca_applications (
            id, name, nickname, real_name, phone, email, age, body_size,
            languages, experience, introduction, image, pin,
            venue_option, preferred_venue_id, preferred_venue_name, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `).bind(
          id,
          name,
          nickname || name,
          realName || name,
          phone || '',
          email || '',
          age || '',
          bodySize || '',
          JSON.stringify(languages || []),
          experience || '',
          introduction || '',
          image || '',
          pin,
          venueOption || 'unemployed',
          preferredVenueId || null,
          preferredVenueName || null
        ).run();

        return json({ success: true, id });
      }

      // Send a job offer from venue admin
      if (action === 'sendOffer') {
        const { applicationId, venueId, venueName, message } = body;
        if (!applicationId || !venueId) {
          return json({ error: 'applicationId and venueId are required' }, 400);
        }

        // Check for duplicate offer from same venue
        const existingOffer = await db.prepare(
          `SELECT id FROM cca_job_offers WHERE application_id = ? AND venue_id = ? AND status = 'pending'`
        ).bind(applicationId, venueId).first();

        if (existingOffer) {
          return json({ error: 'You have already sent a pending offer to this applicant.' }, 409);
        }

        // Check max pending offers
        const app = await db.prepare(
          `SELECT pending_offers_count, status FROM cca_applications WHERE id = ?`
        ).bind(applicationId).first();

        if (!app) return json({ error: 'Application not found' }, 404);
        if (app.status === 'hired') return json({ error: 'This applicant has already been hired.' }, 409);

        if (app.pending_offers_count >= MAX_PENDING_OFFERS) {
          return json({ error: `This applicant already has ${MAX_PENDING_OFFERS} pending offers. Please wait until some are resolved.` }, 429);
        }

        const offerId = `offer_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

        await db.batch([
          db.prepare(`
            INSERT INTO cca_job_offers (id, application_id, venue_id, venue_name, message, status)
            VALUES (?, ?, ?, ?, ?, 'pending')
          `).bind(offerId, applicationId, venueId, venueName || '', message || ''),
          db.prepare(`
            UPDATE cca_applications SET pending_offers_count = pending_offers_count + 1, status = 'reviewing' WHERE id = ?
          `).bind(applicationId)
        ]);

        return json({ success: true, id: offerId });
      }

      // Accept an offer (applicant action)
      if (action === 'acceptOffer') {
        const { offerId, name: applicantName, pin: applicantPin } = body;
        if (!offerId) return json({ error: 'offerId required' }, 400);

        const offer = await db.prepare(
          `SELECT o.*, a.name, a.pin, a.nickname, a.real_name, a.phone, a.email, a.age, a.image, a.languages, a.experience, a.introduction, a.body_size
           FROM cca_job_offers o
           JOIN cca_applications a ON o.application_id = a.id
           WHERE o.id = ?`
        ).bind(offerId).first();

        if (!offer) return json({ error: 'Offer not found' }, 404);
        if (offer.status !== 'pending') return json({ error: 'This offer is no longer available' }, 409);

        // Verify identity if provided
        if (applicantName && applicantPin) {
          if (offer.name !== applicantName || offer.pin !== applicantPin) {
            return json({ error: 'Identity verification failed' }, 403);
          }
        }

        const ccaId = `cca_${Date.now()}`;
        const now = new Date().toISOString();

        // Create CCA in main table & update statuses
        await db.batch([
          // Insert into ccas table
          db.prepare(`
            INSERT INTO ccas (
              id, name, nickname, real_name_first, phone, venue_id, image, status, grade,
              languages, special_notes, is_new, password, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 'NEW', ?, ?, 1, '1234', ?)
          `).bind(
            ccaId,
            offer.nickname || offer.name,
            offer.nickname || '',
            offer.real_name || offer.name,
            offer.phone || '',
            offer.venue_id,
            offer.image || '',
            offer.languages || '[]',
            `[Job Application] Body Size: ${offer.body_size || 'N/A'}\nExperience: ${offer.experience || 'N/A'}\nIntro: ${offer.introduction || 'N/A'}`,
            now
          ),
          // Mark offer as accepted
          db.prepare(`UPDATE cca_job_offers SET status = 'accepted', responded_at = ? WHERE id = ?`).bind(now, offerId),
          // Reject all other pending offers
          db.prepare(`UPDATE cca_job_offers SET status = 'expired', responded_at = ? WHERE application_id = ? AND id != ? AND status = 'pending'`).bind(now, offer.application_id, offerId),
          // Mark application as hired
          db.prepare(`UPDATE cca_applications SET status = 'hired', hired_venue_id = ?, pending_offers_count = 0 WHERE id = ?`).bind(offer.venue_id, offer.application_id),
          // Create employment history
          db.prepare(`
            INSERT INTO cca_employment_history (id, cca_id, venue_id, join_date, status)
            VALUES (?, ?, ?, ?, 'active')
          `).bind(`eh_${Date.now()}`, ccaId, offer.venue_id, now.split('T')[0])
        ]);

        return json({ success: true, ccaId });
      }

      // Reject an offer (applicant action)
      if (action === 'rejectOffer') {
        const { offerId } = body;
        if (!offerId) return json({ error: 'offerId required' }, 400);

        const offer = await db.prepare(
          `SELECT * FROM cca_job_offers WHERE id = ?`
        ).bind(offerId).first();

        if (!offer) return json({ error: 'Offer not found' }, 404);

        const now = new Date().toISOString();
        await db.batch([
          db.prepare(`UPDATE cca_job_offers SET status = 'rejected', responded_at = ? WHERE id = ?`).bind(now, offerId),
          db.prepare(`UPDATE cca_applications SET pending_offers_count = MAX(0, pending_offers_count - 1) WHERE id = ?`).bind(offer.application_id)
        ]);

        return json({ success: true });
      }

      // Super Admin: Direct assign applicant to venue
      if (action === 'directAssign') {
        const { applicationId, venueId } = body;
        if (!applicationId || !venueId) {
          return json({ error: 'applicationId and venueId are required' }, 400);
        }

        const app = await db.prepare(`SELECT * FROM cca_applications WHERE id = ?`).bind(applicationId).first();
        if (!app) return json({ error: 'Application not found' }, 404);
        if (app.status === 'hired') return json({ error: 'This applicant has already been hired' }, 409);

        const ccaId = `cca_${Date.now()}`;
        const now = new Date().toISOString();

        await db.batch([
          // Insert into ccas table
          db.prepare(`
            INSERT INTO ccas (
              id, name, nickname, real_name_first, phone, venue_id, image, status, grade,
              languages, special_notes, is_new, password, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 'NEW', ?, ?, 1, '1234', ?)
          `).bind(
            ccaId,
            app.nickname || app.name,
            app.nickname || '',
            app.real_name || app.name,
            app.phone || '',
            venueId,
            app.image || '',
            app.languages || '[]',
            `[Direct Assignment] Body Size: ${app.body_size || 'N/A'}\nExperience: ${app.experience || 'N/A'}\nIntro: ${app.introduction || 'N/A'}`,
            now
          ),
          // Mark application as hired
          db.prepare(`UPDATE cca_applications SET status = 'hired', hired_venue_id = ?, pending_offers_count = 0 WHERE id = ?`).bind(venueId, applicationId),
          // Expire all pending offers
          db.prepare(`UPDATE cca_job_offers SET status = 'expired', responded_at = ? WHERE application_id = ? AND status = 'pending'`).bind(now, applicationId),
          // Create employment history
          db.prepare(`
            INSERT INTO cca_employment_history (id, cca_id, venue_id, join_date, status)
            VALUES (?, ?, ?, ?, 'active')
          `).bind(`eh_${Date.now()}`, ccaId, venueId, now.split('T')[0])
        ]);

        return json({ success: true, ccaId });
      }

      return json({ error: 'Invalid POST action' }, 400);

    } catch (error: any) {
      return json({ error: error.message }, 500);
    }
  }

  // ═══════════════════════════════════════
  // DELETE: Delete an application (super admin)
  // ═══════════════════════════════════════
  if (request.method === 'DELETE') {
    try {
      const id = url.searchParams.get('id');
      if (!id) return json({ error: 'id required' }, 400);

      await db.batch([
        db.prepare(`DELETE FROM cca_job_offers WHERE application_id = ?`).bind(id),
        db.prepare(`DELETE FROM cca_applications WHERE id = ?`).bind(id)
      ]);

      return json({ success: true });
    } catch (error: any) {
      return json({ error: error.message }, 500);
    }
  }

  return new Response('Method not allowed', { status: 405 });
};

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
