// Cloudflare worker types
type D1Database = any;
type PagesFunction<Env> = any;

interface Env {
    DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context: any) => {
    const { env, request } = context;

    if (request.method !== 'GET') {
        return new Response("Method not allowed", { status: 405 });
    }

    try {
        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Venues stats
        const venuesRes = await env.DB.prepare("SELECT COUNT(*) as count FROM venues").first();
        const pendingVenuesRes = await env.DB.prepare("SELECT COUNT(*) as count FROM venues WHERE created_at LIKE ?").bind(`${todayStr}%`).first();

        // 2. CCAs stats
        const ccasRes = await env.DB.prepare("SELECT COUNT(*) as count FROM ccas").first();
        const pendingCcasRes = await env.DB.prepare("SELECT COUNT(*) as count FROM ccas WHERE created_at LIKE ?").bind(`${todayStr}%`).first();

        // 3. CCAs Active users/signups
        const usersRes = await env.DB.prepare("SELECT COUNT(*) as count FROM users").first();
        // Since we don't have last_login logic reliably set in all places, we will query today's signups
        const activeUsersRes = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE created_at LIKE ?").bind(`${todayStr}%`).first();

        // 4. Reservations / Booking Activity
        const reservationsRes = await env.DB.prepare("SELECT COUNT(*) as count FROM reservations").first();
        const todayReservationsRes = await env.DB.prepare("SELECT COUNT(*) as count FROM reservations WHERE created_at LIKE ?").bind(`${todayStr}%`).first();

        // 5. Recent Posts (max 6)
        const { results: recentPosts } = await env.DB.prepare(
            "SELECT id, board, title, created_at, views, likes FROM posts ORDER BY created_at DESC LIMIT 6"
        ).all();

        // 6. System Health / recent signups (max 5)
        const { results: recentUsers } = await env.DB.prepare(
            "SELECT nickname as name, created_at FROM users ORDER BY created_at DESC LIMIT 5"
        ).all();

        return new Response(JSON.stringify({
            venuesCount: venuesRes?.count || 0,
            venuesToday: pendingVenuesRes?.count || 0,
            ccasCount: ccasRes?.count || 0,
            ccasToday: pendingCcasRes?.count || 0,
            usersCount: usersRes?.count || 0,
            usersToday: activeUsersRes?.count || 0,
            reservationsCount: reservationsRes?.count || 0,
            reservationsToday: todayReservationsRes?.count || 0,
            recentPosts: recentPosts || [],
            recentUsers: recentUsers || [],
            status: 'success'
        }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error("Super Dashboard API Error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};
