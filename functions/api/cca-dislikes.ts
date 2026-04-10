// functions/api/cca-dislikes.ts - CCA 싫어요 API
interface Env { DB: any; }

export const onRequest: any = async (context: any) => {
    const { env, request } = context;
    const url = new URL(request.url);

    // Ensure table exists
    try {
        await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS cca_dislikes (
        id TEXT PRIMARY KEY,
        cca_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(cca_id, user_id)
      )
    `).run();
    } catch (e) { /* already exists */ }

    // GET: 싫어요 수 + 현재 유저의 싫어요 여부
    if (request.method === "GET") {
        const ccaId = url.searchParams.get("ccaId");
        const userId = url.searchParams.get("userId");

        if (!ccaId) {
            return new Response(JSON.stringify({ error: "ccaId is required" }), {
                status: 400, headers: { "Content-Type": "application/json" },
            });
        }

        try {
            const countResult = await env.DB.prepare(
                "SELECT COUNT(*) as count FROM cca_dislikes WHERE cca_id = ?"
            ).bind(ccaId).first();

            let disliked = false;
            if (userId) {
                const dislikeResult = await env.DB.prepare(
                    "SELECT id FROM cca_dislikes WHERE cca_id = ? AND user_id = ?"
                ).bind(ccaId, userId).first();
                disliked = !!dislikeResult;
            }

            return new Response(JSON.stringify({
                count: countResult?.count || 0,
                disliked
            }), {
                headers: { "Content-Type": "application/json" },
            });
        } catch (error: any) {
            return new Response(JSON.stringify({ count: 0, disliked: false }), {
                headers: { "Content-Type": "application/json" },
            });
        }
    }

    // POST: 싫어요 토글
    if (request.method === "POST") {
        try {
            const body = await request.json();
            const { cca_id, user_id, reason } = body;

            if (!cca_id || !user_id) {
                return new Response(JSON.stringify({ error: "cca_id and user_id are required" }), {
                    status: 400, headers: { "Content-Type": "application/json" },
                });
            }

            // Check if user is banned
            const userCheck = await env.DB.prepare("SELECT COALESCE(status, 'active') as status FROM users WHERE id = ?").bind(user_id).first();
            if (userCheck && userCheck.status === 'banned') {
                return new Response(JSON.stringify({ error: "활동이 정지된 계정입니다." }), {
                    status: 403, headers: { "Content-Type": "application/json" },
                });
            }

            // Check if already disliked
            const existing = await env.DB.prepare(
                "SELECT id FROM cca_dislikes WHERE cca_id = ? AND user_id = ?"
            ).bind(cca_id, user_id).first();

            if (existing) {
                // Remove dislike
                await env.DB.prepare("DELETE FROM cca_dislikes WHERE id = ?").bind(existing.id).run();
                const countResult = await env.DB.prepare(
                    "SELECT COUNT(*) as count FROM cca_dislikes WHERE cca_id = ?"
                ).bind(cca_id).first();
                return new Response(JSON.stringify({ disliked: false, count: countResult?.count || 0 }), {
                    headers: { "Content-Type": "application/json" },
                });
            } else {
                // Add dislike
                const id = `cd_${Date.now()}`;
                await env.DB.prepare(
                    "INSERT INTO cca_dislikes (id, cca_id, user_id, reason) VALUES (?, ?, ?, ?)"
                ).bind(id, cca_id, user_id, reason || null).run();
                
                // If the user previously liked this CCA, remove the like automatically
                try {
                    await env.DB.prepare("DELETE FROM cca_likes WHERE cca_id = ? AND user_id = ?").bind(cca_id, user_id).run();
                } catch(e) {}

                const countResult = await env.DB.prepare(
                    "SELECT COUNT(*) as count FROM cca_dislikes WHERE cca_id = ?"
                ).bind(cca_id).first();
                
                return new Response(JSON.stringify({ disliked: true, count: countResult?.count || 0 }), {
                    headers: { "Content-Type": "application/json" },
                });
            }
        } catch (error: any) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500, headers: { "Content-Type": "application/json" },
            });
        }
    }

    return new Response("Method not allowed", { status: 405 });
};
