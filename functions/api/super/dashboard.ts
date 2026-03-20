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

        const stats = {
            venuesCount: 0, venuesToday: 0,
            ccasCount: 0, ccasToday: 0,
            usersCount: 0, usersToday: 0,
            reservationsCount: 0, reservationsToday: 0,
            recentPosts: [], recentUsers: []
        };

        // 1. Venues stats
        try {
            const res = await env.DB.prepare("SELECT COUNT(*) as count FROM venues").first();
            stats.venuesCount = res?.count || 0;
        } catch (e: any) { console.error("Venues Total Error:", e.message); }
        
        try {
            const res = await env.DB.prepare("SELECT COUNT(*) as count FROM venues WHERE created_at LIKE ?").bind(`${todayStr}%`).first();
            stats.venuesToday = res?.count || 0;
        } catch (e: any) { console.error("Venues Today Error:", e.message); }

        // 2. CCAs stats
        try {
            const res = await env.DB.prepare("SELECT COUNT(*) as count FROM ccas WHERE COALESCE(status, 'active') != 'DELETED'").first();
            stats.ccasCount = res?.count || 0;
        } catch (e: any) { console.error("CCAs Total Error:", e.message); }

        try {
            const res = await env.DB.prepare("SELECT COUNT(*) as count FROM ccas WHERE COALESCE(status, 'active') != 'DELETED' AND created_at LIKE ?").bind(`${todayStr}%`).first();
            stats.ccasToday = res?.count || 0;
        } catch (e: any) { console.error("CCAs Today Error:", e.message); }

        // 3. CCAs Active users/signups
        try {
            const res = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE COALESCE(status, 'active') != 'DELETED'").first();
            stats.usersCount = res?.count || 0;
        } catch (e: any) { console.error("Users Total Error:", e.message); }

        try {
            const res = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE COALESCE(status, 'active') != 'DELETED' AND created_at LIKE ?").bind(`${todayStr}%`).first();
            stats.usersToday = res?.count || 0;
        } catch (e: any) { console.error("Users Today Error:", e.message); }

        // 4. Reservations / Booking Activity
        try {
            const res = await env.DB.prepare("SELECT COUNT(*) as count FROM reservations").first();
            stats.reservationsCount = res?.count || 0;
        } catch (e: any) { console.error("Reservations Total Error:", e.message); }

        try {
            const res = await env.DB.prepare("SELECT COUNT(*) as count FROM reservations WHERE created_at LIKE ?").bind(`${todayStr}%`).first();
            stats.reservationsToday = res?.count || 0;
        } catch (e: any) { console.error("Reservations Today Error:", e.message); }

        // 5. Recent Posts (max 6)
        try {
            const res = await env.DB.prepare(
                "SELECT id, board, title, created_at, views, likes FROM posts ORDER BY created_at DESC LIMIT 6"
            ).all();
            stats.recentPosts = res?.results || [];
        } catch (e: any) { console.error("Recent Posts Error:", e.message); }

        // 6. System Health / recent signups (max 5)
        try {
            const res = await env.DB.prepare(
                "SELECT nickname as name, created_at FROM users WHERE COALESCE(status, 'active') != 'DELETED' ORDER BY created_at DESC LIMIT 5"
            ).all();
            stats.recentUsers = res?.results || [];
        } catch (e: any) { console.error("Recent Users Error:", e.message); }

        return new Response(JSON.stringify({
            ...stats,
            status: 'success'
        }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error("Super Dashboard API Error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};
