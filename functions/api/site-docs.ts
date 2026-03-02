// functions/api/site-docs.ts
type D1Database = any;
interface Env { DB: D1Database; }

export const onRequest: any = async (context: any) => {
    const { env, request } = context;
    const url = new URL(request.url);

    if (request.method === 'GET') {
        const type = url.searchParams.get('type'); // 'guidelines', 'terms'
        if (!type) return new Response("type required", { status: 400 });

        try {
            const result = await env.DB.prepare("SELECT * FROM site_docs WHERE type = ?").bind(type).first();
            return new Response(JSON.stringify(result || { content: "Content not found." }), {
                headers: { "Content-Type": "application/json" },
            });
        } catch (error: any) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }
    }

    return new Response("Method not allowed", { status: 405 });
};
