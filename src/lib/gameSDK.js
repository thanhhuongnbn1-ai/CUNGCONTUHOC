import { supabase, isSupabaseConfigured } from './supabase';
import confetti from 'canvas-confetti';
import { xpLeaderboardService } from './xpLeaderboardService';
import { pwaSyncService } from './pwaSyncService';

/**
 * EDTECH HTML5 GAME SDK
 * Kết nối tự động ghi nhận điểm số từ Game HTML5 (iFrame / Canvas / WebGL) về Database Supabase
 */
class EdTechGameSDKManager {
  constructor() {
    this.studentId = null;
    this.materialId = null;
    this.classId = null;
    this.listeners = new Set();
    this.isListening = false;
  }

  /**
   * Khởi tạo SDK với thông tin học sinh và bài học game
   */
  init({ studentId, materialId, classId }) {
    this.studentId = studentId;
    this.materialId = materialId;
    this.classId = classId;

    if (!this.isListening) {
      this.attachPostMessageListener();
      this.isListening = true;
    }

    console.log(`🎮 [GameSDK] Initialized for Student: ${studentId}, Material: ${materialId}`);
  }

  /**
   * Đăng ký lắng nghe sự kiện ghi nhận điểm
   */
  onScoreSaved(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Lắng nghe tín hiệu postMessage từ iFrame HTML5 Game
   */
  attachPostMessageListener() {
    window.addEventListener('message', async (event) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      // Hỗ trợ các định dạng sự kiện phổ biến từ game HTML5
      const isGameScoreEvent =
        data.type === 'EDTECH_GAME_SCORE' ||
        data.type === 'GAME_SCORE_SUBMIT' ||
        data.type === 'SCORE_SUBMIT' ||
        data.type === 'GAME_OVER' ||
        data.event === 'game_finished';

      if (isGameScoreEvent && (typeof data.score === 'number' || typeof data.score === 'string')) {
        const score = Number(data.score);
        const maxScore = Number(data.maxScore || data.max_score || 100);
        const timeSpent = Number(data.timeSpent || data.time_spent || data.duration || 0);

        console.log(`🎯 [GameSDK] Received game score message: ${score}/${maxScore}`);
        await this.submitScore({
          score,
          maxScore,
          timeSpentSeconds: timeSpent,
          metadata: data.metadata || { gameName: data.gameName || 'HTML5 Game' }
        });
      }
    });
  }

  /**
   * Ghi điểm số tự động vào Database Supabase và đồng bộ tiến độ học sinh
   */
  async submitScore({ score, maxScore = 100, timeSpentSeconds = 0, metadata = {} }) {
    const finalScore = Math.min(Math.max(score, 0), maxScore);
    const percentage = Math.round((finalScore / maxScore) * 100);

    console.log(`💾 [GameSDK] Syncing score ${finalScore}/${maxScore} (${percentage}%) to Database...`);

    const result = {
      score: finalScore,
      maxScore,
      percentage,
      timeSpentSeconds,
      timestamp: new Date().toISOString()
    };

    // Bắn pháo hoa nếu đạt điểm cao (>= 70%)
    if (percentage >= 70) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    // 1. Đồng bộ vào Database Supabase (hoặc xếp vào PWA Offline Queue)
    const scorePayload = {
      student_id: this.studentId,
      material_id: this.materialId,
      score: finalScore,
      max_score: maxScore,
      time_spent_seconds: timeSpentSeconds,
      game_metadata: metadata,
      created_at: new Date().toISOString()
    };

    if (this.studentId && this.materialId && isSupabaseConfigured() && typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        // Ghi vào bảng game_scores (lịch sử chơi game)
        const { error: gameScoreErr } = await supabase
          .from('game_scores')
          .insert([scorePayload]);

        if (gameScoreErr) {
          console.warn('[GameSDK] Supabase game_scores insert warning, queuing to PWA:', gameScoreErr.message);
          pwaSyncService.enqueueOfflineAction({ type: 'sync_game_score', table: 'game_scores', data: scorePayload });
        }

        // Cập nhật bảng student_progress (tiến độ học tập)
        const { error: progressErr } = await supabase
          .from('student_progress')
          .upsert({
            student_id: this.studentId,
            material_id: this.materialId,
            status: 'completed',
            score: percentage,
            time_spent_seconds: timeSpentSeconds,
            completed_at: new Date().toISOString()
          }, { onConflict: 'student_id,material_id' });

        if (!gameScoreErr && !progressErr) {
          console.log('✅ [GameSDK] Successfully synced game score with Supabase DB!');
        }
      } catch (err) {
        console.error('[GameSDK] DB sync error, queuing to PWA:', err);
        pwaSyncService.enqueueOfflineAction({ type: 'sync_game_score', table: 'game_scores', data: scorePayload });
      }
    } else if (this.studentId && this.materialId) {
      // Offline fallback: xếp vào PWA Sync Queue
      pwaSyncService.enqueueOfflineAction({ type: 'sync_game_score', table: 'game_scores', data: scorePayload });
    }

    // 2. Lưu cache local storage
    try {
      const historyKey = `game_scores_${this.studentId || 'demo'}`;
      const existing = JSON.parse(localStorage.getItem(historyKey) || '[]');
      existing.unshift(result);
      localStorage.setItem(historyKey, JSON.stringify(existing.slice(0, 30)));
    } catch (e) {}

    // 3. Tự động cộng điểm XP cho học sinh & đồng bộ Bảng Xếp Hạng
    try {
      const xpEarned = Math.max(15, Math.round(percentage * 0.7));
      xpLeaderboardService.awardXP({
        studentId: this.studentId || 'demo-student-id',
        studentName: 'Học sinh',
        gradeLevel: 'Lớp 1',
        xpAmount: xpEarned,
        activityType: 'game',
        activityTitle: metadata?.gameName || metadata?.title || 'Đấu Trường Game'
      });
    } catch (_) {}

    // 4. Thông báo cho UI listeners
    this.listeners.forEach((callback) => callback(result));
    return result;
  }
}

export const EdTechGameSDK = new EdTechGameSDKManager();

// Gắn vào window để game HTML5 bên trong iFrame có thể gọi trực tiếp
if (typeof window !== 'undefined') {
  window.EdTechGameSDK = EdTechGameSDK;
}

export default EdTechGameSDK;
