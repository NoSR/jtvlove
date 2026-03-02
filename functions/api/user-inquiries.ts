// functions/api/user-inquiries.ts
type D1Database = any;
interface Env { DB: D1Database; }

export const onRequest: any = async (context: any) => {
    const { env, request } = context;
    const url = new URL(request.url);

    if (request.method === 'GET') {
        const userId = url.searchParams.get('userId');
        const id = url.searchParams.get('id');

        try {
            if (id) {
                const result = await env.DB.prepare("SELECT * FROM user_inquiries WHERE id = ?").bind(id).first();
                return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });
            }

            if (!userId) return new Response("userId required", { status: 400 });

            const { results } = await env.DB.prepare(
                "SELECT * FROM user_inquiries WHERE user_id = ? ORDER BY created_at DESC"
            ).bind(userId).all();

            return new Response(JSON.stringify(results || []), {
                headers: { "Content-Type": "application/json" },
            });
        } catch (error: any) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }
    }

    if (request.method === 'POST') {
        try {
            const data: any = await request.json();
            const { userId, title, content } = data;

            if (!userId || !title || !content) {
                return new Response("Missing required fields", { status: 400 });
            }

            const id = crypto.randomUUID();
            await env.DB.prepare(
                "INSERT INTO user_inquiries (id, user_id, title, content, status, created_at) VALUES (?, ?, ?, ?, ?, ?)"
            ).bind(id, userId, title, content, 'pending', new Date().toISOString()).run();

            return new Response(JSON.stringify({ success: true, id }), {
                headers: { "Content-Type": "application/json" },
            });
        } catch (error: any) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }
    }

    return new Response("Method not allowed", { status: 405 });
};
