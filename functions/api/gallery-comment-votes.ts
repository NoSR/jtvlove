type D1Database = any;
type PagesFunction<T, P = any> = any;

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context: any) => {
  const { env, request } = context;
  const url = new URL(request.url);
  const headers = { 'Content-Type': 'application/json' };

  // GET: Get user vote statuses for a list of comments
  if (request.method === 'GET') {
    try {
      const getGalleryId = url.searchParams.get('galleryId');
      const userId = url.searchParams.get('userId');

      if (!getGalleryId || !userId) {
        return new Response(JSON.stringify({ error: 'galleryId and userId required' }), { status: 400, headers });
      }

      // Fetch all votes by this user for the comments in this gallery item
      const { results } = await env.DB.prepare(`
        SELECT v.comment_id, v.vote_type 
        FROM gallery_comment_votes v
        JOIN gallery_comments c ON v.comment_id = c.id
        WHERE c.gallery_id = ? AND v.user_id = ?
      `).bind(getGalleryId, userId).all();

      return new Response(JSON.stringify(results), { headers });

    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
  }

  // POST: Toggle comment vote
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const { commentId, userId, voteType } = body;

      if (!commentId || !userId || !['like', 'dislike'].includes(voteType)) {
        return new Response(JSON.stringify({ error: 'Valid commentId, userId, and voteType (like/dislike) required' }), { status: 400, headers });
      }

      const existing = await env.DB.prepare(
        'SELECT id, vote_type FROM gallery_comment_votes WHERE comment_id = ? AND user_id = ?'
      ).bind(commentId, userId).first();

      let deltaLike = 0;
      let deltaDislike = 0;

      if (existing) {
        if (existing.vote_type === voteType) {
          // Toggle off
          await env.DB.prepare('DELETE FROM gallery_comment_votes WHERE id = ?').bind(existing.id).run();
          if (voteType === 'like') deltaLike = -1;
          else deltaDislike = -1;
        } else {
          // Switch vote
          await env.DB.prepare('UPDATE gallery_comment_votes SET vote_type = ? WHERE id = ?').bind(voteType, existing.id).run();
          if (voteType === 'like') { deltaLike = 1; deltaDislike = -1; }
          else { deltaLike = -1; deltaDislike = 1; }
        }
      } else {
        // New vote
        const newId = crypto.randomUUID();
        await env.DB.prepare(
          'INSERT INTO gallery_comment_votes (id, comment_id, user_id, vote_type) VALUES (?, ?, ?, ?)'
        ).bind(newId, commentId, userId, voteType).run();
        if (voteType === 'like') deltaLike = 1;
        else deltaDislike = 1;
      }

      // Update comment counts
      if (deltaLike !== 0 || deltaDislike !== 0) {
        await env.DB.prepare(`
          UPDATE gallery_comments 
          SET likes_count = MAX(0, likes_count + ?), dislikes_count = MAX(0, dislikes_count + ?)
          WHERE id = ?
        `).bind(deltaLike, deltaDislike, commentId).run();
      }

      // Return new counts
      const updated = await env.DB.prepare('SELECT likes_count, dislikes_count FROM gallery_comments WHERE id = ?').bind(commentId).first();

      return new Response(JSON.stringify({ 
        success: true, 
        currentVote: existing && existing.vote_type === voteType ? null : voteType,
        likesCount: updated?.likes_count || 0,
        dislikesCount: updated?.dislikes_count || 0
      }), { headers });

    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
  }

  return new Response('Method not allowed', { status: 405 });
};
