// functions/api/cca-score/recalculate.ts - 점수 계산 및 등급 산정 엔진
interface Env { DB: any; }

const SCORE_BASE = 50;

const GRADE_THRESHOLDS = [
  { min: 900, grade: 'STAR' },
  { min: 700, grade: 'ACE' },
  { min: 450, grade: 'PRO' },
  { min: 200, grade: 'RISING' },
  { min: 0, grade: 'NEW' }
];

export const onRequest: any = async (context: any) => {
    const { env, request } = context;
    
    // Only accept POST
    if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    try {
        // Create necessary table for logs if absent
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS cca_score_logs (
            id TEXT PRIMARY KEY,
            cca_id TEXT NOT NULL,
            category TEXT NOT NULL,
            item TEXT NOT NULL,
            points INTEGER NOT NULL,
            description TEXT,
            log_date TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `).run();
        
        // Ensure ccas table has score and score_updated_at
        try { await env.DB.prepare("ALTER TABLE ccas ADD COLUMN score INTEGER DEFAULT 50").run(); } catch(e) {}
        try { await env.DB.prepare("ALTER TABLE ccas ADD COLUMN score_updated_at TEXT").run(); } catch(e) {}

        const now = new Date();
        const runDate = new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString().split('T')[0]; // PH Time
        
        // 1. Get all active CCAs
        const { results: ccas } = await env.DB.prepare("SELECT id, grade, created_at, mbti, zodiac, height, description, image FROM ccas WHERE status != 'inactive' AND status != 'resigned'").all();
        
        let processedCount = 0;

        // Note: For a production ready cron with 1000s of CCAs, we'd use batch updates or queue.
        // For MVP, sequentially calculating line by line.
        for (const cca of ccas) {
            let score = SCORE_BASE;
            
            // Collect points
            // 1. Profile Completeness (+30 max)
            let profileFieldsCount = 0;
            if (cca.image) profileFieldsCount++;
            if (cca.description) profileFieldsCount++;
            if (cca.mbti) profileFieldsCount++;
            if (cca.zodiac) profileFieldsCount++;
            if (cca.height) profileFieldsCount++;
            
            if (profileFieldsCount >= 4) score += 30; // +30 complete profile bonus
            
            // 2. Attendance (Check-ins in last 30 days)
            const attendanceRs = await env.DB.prepare("SELECT COUNT(*) as count FROM cca_attendance WHERE cca_id = ? AND status = 'checked_in' AND check_in_at > datetime('now', '-30 days')").bind(cca.id).first();
            const attendanceCount = attendanceRs?.count || 0;
            score += (attendanceCount * 5); // +5 per check in

            // 3. Gallery Uploads (last 30 days)
            const galleryRs = await env.DB.prepare("SELECT COUNT(*) as count FROM gallery WHERE cca_id = ? AND created_at > datetime('now', '-30 days')").bind(cca.id).first();
            const galleryCount = galleryRs?.count || 0;
            score += Math.min(galleryCount * 3, 50); // +3 per photo, max 50 points per 30d

            // 4. Messages (Replies vs No Replies)
            const msgReplies = await env.DB.prepare("SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND receiver_type = 'cca' AND replied = 1 AND created_at > datetime('now', '-30 days')").bind(cca.id).first();
            const msgNoReplies = await env.DB.prepare("SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND receiver_type = 'cca' AND replied = 0 AND created_at > datetime('now', '-30 days')").bind(cca.id).first();
            
            score += (msgReplies?.count || 0) * 2; // +2 per reply
            score -= (msgNoReplies?.count || 0) * 5; // -5 per unreplied message
            
            // 5. Customer Reaction (Likes/Dislikes)
            const likesCount = await env.DB.prepare("SELECT COUNT(*) as count FROM cca_likes WHERE cca_id = ?").bind(cca.id).first();
            const dislikesCount = await env.DB.prepare("SELECT COUNT(*) as count FROM cca_dislikes WHERE cca_id = ?").bind(cca.id).first();
            
            score += (likesCount?.count || 0) * 1;
            score -= (dislikesCount?.count || 0) * 3;

            // 6. View Counts
            const viewsCount = await env.DB.prepare("SELECT COUNT(*) as count FROM cca_profile_views WHERE cca_id = ? AND viewed_at > datetime('now', '-30 days')").bind(cca.id).first();
            score += Math.min(Math.floor((viewsCount?.count || 0) / 10), 100); // +0.1 per view, max 100

            // 7. Penalty for no uploads recently (-10 if 0 uploads in 28 days)
            if (galleryCount === 0) {
                score -= 10;
            }

            // Ensure score doesn't go below 0
            if (score < 0) score = 0;

            // Determine Grade
            let newGrade = 'NEW';
            for (const t of GRADE_THRESHOLDS) {
                if (score >= t.min) {
                    newGrade = t.grade;
                    break;
                }
            }

            // Update CCA Data
            await env.DB.prepare(
                "UPDATE ccas SET score = ?, grade = ?, score_updated_at = ? WHERE id = ?"
            ).bind(score, newGrade, new Date().toISOString(), cca.id).run();
            
            processedCount++;
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Scores recalculated for ${processedCount} CCAs`,
            run_date: runDate
        }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500, headers: { "Content-Type": "application/json" },
        });
    }
};
