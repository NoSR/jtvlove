
// Gallery Likes API — Toggle like on a gallery item
type D1Database = any;
type PagesFunction<T, P = any> = any;

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context: any) => {
  const { env, request } = context;
  const url = new URL(request.url);

  const headers = { 'Content-Type': 'application/json' };

  // GET: Get like status for a gallery item
  if (request.method === 'GET') {
    try {
      const galleryId = url.searchParams.get('galleryId');
      const visitorId = url.searchParams.get('visitorId');

      if (!galleryId) {
        return new Response(JSON.stringify({ error: 'galleryId required' }), { status: 400, headers });
      }

      // Get total count
      const countResult = await env.DB.prepare(
        'SELECT COUNT(*) as count FROM gallery_likes WHERE gallery_id = ?'
      ).bind(galleryId).first();

      // Check if visitor liked
      let liked = false;
      if (visitorId) {
        const likeCheck = await env.DB.prepare(
          'SELECT id FROM gallery_likes WHERE gallery_id = ? AND visitor_id = ?'
        ).bind(galleryId, visitorId).first();
        liked = !!likeCheck;
      }

      return new Response(JSON.stringify({
        count: countResult?.count || 0,
        liked
      }), { headers });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
  }

  // POST: Toggle like
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const { galleryId, visitorId } = body;

      if (!galleryId || !visitorId) {
        return new Response(JSON.stringify({ error: 'galleryId and visitorId required' }), { status: 400, headers });
      }

      // Check if already liked
      const existing = await env.DB.prepare(
        'SELECT id FROM gallery_likes WHERE gallery_id = ? AND visitor_id = ?'
      ).bind(galleryId, visitorId).first();

      if (existing) {
        // Unlike
        await env.DB.prepare(
          'DELETE FROM gallery_likes WHERE gallery_id = ? AND visitor_id = ?'
        ).bind(galleryId, visitorId).run();
      } else {
        // Like
        const newId = crypto.randomUUID();
        await env.DB.prepare(
          'INSERT INTO gallery_likes (id, gallery_id, visitor_id) VALUES (?, ?, ?)'
        ).bind(newId, galleryId, visitorId).run();
      }

      // Update gallery table likes count
      const countResult = await env.DB.prepare(
        'SELECT COUNT(*) as count FROM gallery_likes WHERE gallery_id = ?'
      ).bind(galleryId).first();
      const newCount = countResult?.count || 0;

      await env.DB.prepare(
        'UPDATE gallery SET likes = ? WHERE id = ?'
      ).bind(newCount, galleryId).run();

      return new Response(JSON.stringify({
        liked: !existing,
        count: newCount
      }), { headers });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
  }

  return new Response('Method not allowed', { status: 405 });
};
