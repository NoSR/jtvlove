
// Cloudflare worker types
type D1Database = any;
interface Env {
  DB: D1Database;
}

// GET: 설정 불러오기
export const onRequestGet = async (context: { env: Env }) => {
  const { env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "D1 Database binding 'DB' is missing in Cloudflare Dashboard." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // 1. Ensure columns exist before reading (for simple automatic migrations)
    try {
      await env.DB.prepare("ALTER TABLE site_settings ADD COLUMN venues_hero_image TEXT").run();
      await env.DB.prepare("ALTER TABLE site_settings ADD COLUMN venues_hero_title TEXT").run();
      await env.DB.prepare("ALTER TABLE site_settings ADD COLUMN venues_hero_subtitle TEXT").run();
    } catch (e: any) {
      // Columns probably already exist; ignore error
    }

    const result = await env.DB.prepare(
      "SELECT * FROM site_settings WHERE id = 'global'"
    ).first();

    return new Response(JSON.stringify(result || {}), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message, details: "Check if 'site_settings' table exists." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// POST: 설정 저장하기 (UPSERT)
export const onRequestPost = async (context: { env: Env, request: Request }) => {
  const { env, request } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "D1 Database binding 'DB' is missing." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // 1. Ensure columns exist before saving
    try {
      await env.DB.prepare("ALTER TABLE site_settings ADD COLUMN venues_hero_image TEXT").run();
      await env.DB.prepare("ALTER TABLE site_settings ADD COLUMN venues_hero_title TEXT").run();
      await env.DB.prepare("ALTER TABLE site_settings ADD COLUMN venues_hero_subtitle TEXT").run();
    } catch (e: any) {
      // Columns probably already exist; ignore error
    }

    const body = await request.json();
    const {
      site_name, admin_phone, admin_email, admin_sns, hq_address, logo_url, favicon_url,
      venues_hero_image, venues_hero_title, venues_hero_subtitle
    } = body;

    // D1 (SQLite) UPSERT syntax
    await env.DB.prepare(`
      INSERT INTO site_settings (
        id, site_name, admin_phone, admin_email, admin_sns, hq_address, logo_url, favicon_url, 
        venues_hero_image, venues_hero_title, venues_hero_subtitle, updated_at
      )
      VALUES ('global', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        site_name = excluded.site_name,
        admin_phone = excluded.admin_phone,
        admin_email = excluded.admin_email,
        admin_sns = excluded.admin_sns,
        hq_address = excluded.hq_address,
        logo_url = excluded.logo_url,
        favicon_url = excluded.favicon_url,
        venues_hero_image = excluded.venues_hero_image,
        venues_hero_title = excluded.venues_hero_title,
        venues_hero_subtitle = excluded.venues_hero_subtitle,
        updated_at = CURRENT_TIMESTAMP
    `).bind(
      site_name || '',
      admin_phone || '',
      admin_email || '',
      admin_sns || '',
      hq_address || '',
      logo_url || '',
      favicon_url || '',
      venues_hero_image || '',
      venues_hero_title || '',
      venues_hero_subtitle || ''
    ).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
