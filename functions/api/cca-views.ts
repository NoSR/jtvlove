// functions/api/cca-views.ts - CCA Profile View Counter API
interface Env { DB: any; }

export const onRequest: any = async (context: any) => {
    const { env, request } = context;
    const url = new URL(request.url);

    // Ensure table exists
    try {
        await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS cca_profile_views (
        id TEXT PRIMARY KEY,
        cca_id TEXT NOT NULL,
        visitor_id TEXT,
        viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        view_date TEXT
      )
    `).run();
    } catch (e) { /* already exists */ }

    const getBusinessDate = () => {
        const now = new Date();
        const hour = now.getUTCHours() + 8; // Manila/PH Time (UTC+8)
        if (hour < 5) {
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            return yesterday.toISOString().split('T')[0];
        }
        return now.toISOString().split('T')[0];
    };

    // POST: Record a view
    if (request.method === "POST") {
        try {
            const body = await request.json();
            const { cca_id, visitor_id } = body;

            if (!cca_id) {
                return new Response(JSON.stringify({ error: "cca_id is required" }), {
                    status: 400, headers: { "Content-Type": "application/json" },
                });
            }

            const today = getBusinessDate();

            // Dedup: check if this visitor already viewed this CCA within last 30 min
            if (visitor_id) {
                const recent = await env.DB.prepare(
                    `SELECT id FROM cca_profile_views WHERE cca_id = ? AND visitor_id = ? AND viewed_at > datetime('now', '-30 minutes')`
                ).bind(cca_id, visitor_id).first();

                if (recent) {
                    // Already viewed recently, just return counts
                    const todayCount = await env.DB.prepare(
                        "SELECT COUNT(*) as cnt FROM cca_profile_views WHERE cca_id = ? AND view_date = ?"
                    ).bind(cca_id, today).first();

                    const totalCount = await env.DB.prepare(
                        "SELECT COUNT(*) as cnt FROM cca_profile_views WHERE cca_id = ?"
                    ).bind(cca_id).first();

                    return new Response(JSON.stringify({
                        todayViews: todayCount?.cnt || 0,
                        totalViews: totalCount?.cnt || 0,
                        deduplicated: true
                    }), { headers: { "Content-Type": "application/json" } });
                }
            }

            // Insert new view
            const id = `pv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            await env.DB.prepare(
                "INSERT INTO cca_profile_views (id, cca_id, visitor_id, view_date) VALUES (?, ?, ?, ?)"
            ).bind(id, cca_id, visitor_id || null, today).run();

            // Also update ccas.views_count for quick access
            try {
                await env.DB.prepare(
                    "UPDATE ccas SET views_count = COALESCE(views_count, 0) + 1 WHERE id = ?"
                ).bind(cca_id).run();
            } catch (e) { /* column might not exist */ }

            // Return counts
            const todayCount = await env.DB.prepare(
                "SELECT COUNT(*) as cnt FROM cca_profile_views WHERE cca_id = ? AND view_date = ?"
            ).bind(cca_id, today).first();

            const totalCount = await env.DB.prepare(
                "SELECT COUNT(*) as cnt FROM cca_profile_views WHERE cca_id = ?"
            ).bind(cca_id).first();

            return new Response(JSON.stringify({
                todayViews: todayCount?.cnt || 0,
                totalViews: totalCount?.cnt || 0,
                deduplicated: false
            }), { headers: { "Content-Type": "application/json" } });

        } catch (error: any) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500, headers: { "Content-Type": "application/json" },
            });
        }
    }

    // GET: Get view counts
    if (request.method === "GET") {
        const ccaId = url.searchParams.get("ccaId");

        if (!ccaId) {
            return new Response(JSON.stringify({ error: "ccaId is required" }), {
                status: 400, headers: { "Content-Type": "application/json" },
            });
        }

        try {
            const today = getBusinessDate();

            const todayCount = await env.DB.prepare(
                "SELECT COUNT(*) as cnt FROM cca_profile_views WHERE cca_id = ? AND view_date = ?"
            ).bind(ccaId, today).first();

            const totalCount = await env.DB.prepare(
                "SELECT COUNT(*) as cnt FROM cca_profile_views WHERE cca_id = ?"
            ).bind(ccaId).first();

            return new Response(JSON.stringify({
                todayViews: todayCount?.cnt || 0,
                totalViews: totalCount?.cnt || 0,
            }), { headers: { "Content-Type": "application/json" } });
        } catch (error: any) {
            return new Response(JSON.stringify({ todayViews: 0, totalViews: 0 }), {
                headers: { "Content-Type": "application/json" },
            });
        }
    }

    return new Response("Method not allowed", { status: 405 });
};
