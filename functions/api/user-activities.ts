// functions/api/user-activities.ts
type D1Database = any;
interface Env { DB: D1Database; }

export const onRequest: any = async (context: any) => {
    const { env, request } = context;
    const url = new URL(request.url);

    if (request.method === 'GET') {
        const userId = url.searchParams.get('userId');
        if (!userId) return new Response("userId required", { status: 400 });

        try {
            // Fetch XP logs
            const xpLogs = await env.DB.prepare(
                "SELECT 'xp' as type, activity as title, xp_amount as amount, created_at FROM user_xp_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 50"
            ).bind(userId).all();

            // Fetch Point logs
            const pointLogs = await env.DB.prepare(
                "SELECT 'point' as type, description as title, amount, created_at FROM user_point_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 50"
            ).bind(userId).all();

            // Combine and sort
            const combined = [...(xpLogs.results || []), ...(pointLogs.results || [])]
                .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 50);

            return new Response(JSON.stringify(combined), {
                headers: { "Content-Type": "application/json" },
            });
        } catch (error: any) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }
    }

    return new Response("Method not allowed", { status: 405 });
};
