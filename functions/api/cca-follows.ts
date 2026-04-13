type D1Database = any;
type PagesFunction<T, P = any> = any;

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context: any) => {
  const { env, request } = context;
  const url = new URL(request.url);
  const headers = { 'Content-Type': 'application/json' };

  // GET: Check follow status or list follows
  if (request.method === 'GET') {
    try {
      const userId = url.searchParams.get('userId');
      const ccaId = url.searchParams.get('ccaId');

      if (!userId) {
        return new Response(JSON.stringify({ error: 'userId is required' }), { status: 400, headers });
      }

      // Check specific follow
      if (ccaId) {
        const followCheck = await env.DB.prepare(
          'SELECT id FROM cca_follows WHERE user_id = ? AND cca_id = ?'
        ).bind(userId, ccaId).first();
        
        return new Response(JSON.stringify({ isFollowing: !!followCheck }), { headers });
      }

      // List all followed CCAs
      const { results } = await env.DB.prepare(
        'SELECT cca_id FROM cca_follows WHERE user_id = ?'
      ).bind(userId).all();

      return new Response(JSON.stringify({ followedIds: results.map((r: any) => r.cca_id) }), { headers });

    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
  }

  // POST: Toggle follow
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const { userId, ccaId } = body;

      if (!userId || !ccaId) {
        return new Response(JSON.stringify({ error: 'userId and ccaId required' }), { status: 400, headers });
      }

      const existing = await env.DB.prepare(
        'SELECT id FROM cca_follows WHERE user_id = ? AND cca_id = ?'
      ).bind(userId, ccaId).first();

      if (existing) {
        // Unfollow
        await env.DB.prepare(
          'DELETE FROM cca_follows WHERE user_id = ? AND cca_id = ?'
        ).bind(userId, ccaId).run();
        return new Response(JSON.stringify({ isFollowing: false }), { headers });
      } else {
        // Follow
        const newId = crypto.randomUUID();
        await env.DB.prepare(
          'INSERT INTO cca_follows (id, user_id, cca_id) VALUES (?, ?, ?)'
        ).bind(newId, userId, ccaId).run();
        return new Response(JSON.stringify({ isFollowing: true }), { headers });
      }

    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
  }

  return new Response('Method not allowed', { status: 405 });
};
