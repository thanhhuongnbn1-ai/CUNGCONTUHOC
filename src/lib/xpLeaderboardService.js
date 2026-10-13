import { supabase, isSupabaseConfigured } from './supabase';
import { pwaSyncService } from './pwaSyncService';

const LOCAL_STORAGE_XP_LOGS = 'edtech_student_xp_logs';

// Dữ liệu học sinh tiêu biểu mặc định toàn trường (Pre-seeded Academic Champions)
export const DEFAULT_STUDENT_RANKS = [
  {
    student_id: 'stu_champ_01',
    student_name: 'Nguyễn Hoàng Nam',
    grade_level: 'Lớp 4',
    class_name: 'Lớp 4A',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Nam4A',
    title: 'Đại Sứ Tri Thức 👑',
    streak_days: 14,
    completed_tasks: 48,
    xp_week: 285,
    xp_month: 890,
    xp_semester: 3420
  },
  {
    student_id: 'stu_champ_02',
    student_name: 'Lê Thảo My',
    grade_level: 'Lớp 3',
    class_name: 'Lớp 3B',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=My3B',
    title: 'Kiện Tướng Toán Học 🌟',
    streak_days: 12,
    completed_tasks: 45,
    xp_week: 260,
    xp_month: 830,
    xp_semester: 3180
  },
  {
    student_id: 'demo-student-id', // Trùng với user demo của app
    student_name: 'Bé Minh Triết',
    grade_level: 'Lớp 1',
    class_name: 'Lớp 1A',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=student',
    title: 'Ngôi Sao Chăm Chỉ ⭐',
    streak_days: 10,
    completed_tasks: 42,
    xp_week: 245,
    xp_month: 780,
    xp_semester: 2950
  },
  {
    student_id: 'stu_champ_04',
    student_name: 'Trần Nhật Minh',
    grade_level: 'Lớp 5',
    class_name: 'Lớp 5A',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Minh5A',
    title: 'Thần Đồng Tính Nhanh ⚡',
    streak_days: 9,
    completed_tasks: 39,
    xp_week: 210,
    xp_month: 710,
    xp_semester: 2740
  },
  {
    student_id: 'stu_champ_05',
    student_name: 'Phạm Bảo Châu',
    grade_level: 'Lớp 2',
    class_name: 'Lớp 2C',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Chau2C',
    title: 'Bút Thần Nhí ✍️',
    streak_days: 8,
    completed_tasks: 36,
    xp_week: 195,
    xp_month: 670,
    xp_semester: 2510
  },
  {
    student_id: 'stu_champ_06',
    student_name: 'Đỗ Gia Hưng',
    grade_level: 'Lớp 4',
    class_name: 'Lớp 4B',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Hung4B',
    title: 'Chiến Binh Logic 🛡️',
    streak_days: 7,
    completed_tasks: 33,
    xp_week: 175,
    xp_month: 620,
    xp_semester: 2360
  },
  {
    student_id: 'stu_champ_07',
    student_name: 'Vũ Phương Anh',
    grade_level: 'Lớp 3',
    class_name: 'Lớp 3A',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Anh3A',
    title: 'Nhà Thám Hiểm Khoa Học 🔬',
    streak_days: 7,
    completed_tasks: 31,
    xp_week: 160,
    xp_month: 580,
    xp_semester: 2180
  },
  {
    student_id: 'stu_champ_08',
    student_name: 'Bùi Tuấn Kiệt',
    grade_level: 'Lớp 1',
    class_name: 'Lớp 1B',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Kiet1B',
    title: 'Hạt Giống Tiềm Năng 🌱',
    streak_days: 6,
    completed_tasks: 28,
    xp_week: 145,
    xp_month: 530,
    xp_semester: 1980
  },
  {
    student_id: 'stu_champ_09',
    student_name: 'Hoàng Mai Linh',
    grade_level: 'Lớp 2',
    class_name: 'Lớp 2A',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Linh2A',
    title: 'Ong Vàng Chăm Chỉ 🐝',
    streak_days: 5,
    completed_tasks: 25,
    xp_week: 130,
    xp_month: 490,
    xp_semester: 1820
  },
  {
    student_id: 'stu_champ_10',
    student_name: 'Trịnh Đức Anh',
    grade_level: 'Lớp 5',
    class_name: 'Lớp 5B',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=DucAnh5B',
    title: 'Tay Đua Điểm Số 🏎️',
    streak_days: 5,
    completed_tasks: 23,
    xp_week: 120,
    xp_month: 450,
    xp_semester: 1710
  }
];

// Danh sách mẫu khen thưởng của giáo viên (Quick Presets)
export const TEACHER_AWARD_PRESETS = [
  {
    id: 'speech',
    title: 'Phát biểu hay',
    desc: 'Hăng hái giơ tay, trả lời bài rõ ràng, tự tin',
    xp: 20,
    icon: '🙋‍♂️',
    badge: 'Phát biểu hay'
  },
  {
    id: 'help_friend',
    title: 'Giúp đỡ bạn bè',
    desc: 'Hỗ trợ bạn cùng bàn, chia sẻ đồ dùng, đoàn kết',
    xp: 30,
    icon: '🤝',
    badge: 'Giúp đỡ bạn'
  },
  {
    id: 'handwriting',
    title: 'Vở sạch chữ đẹp',
    desc: 'Trình bày cẩn thận, nét chữ nắn nót, sạch sẽ',
    xp: 25,
    icon: '📝',
    badge: 'Chữ đẹp & Ngăn nắp'
  },
  {
    id: 'creative',
    title: 'Tư duy sáng tạo',
    desc: 'Cách giải độc đáo, câu hỏi bất ngờ thú vị',
    xp: 40,
    icon: '💡',
    badge: 'Sáng tạo xuất sắc'
  },
  {
    id: 'progress',
    title: 'Tiến bộ vượt bậc',
    desc: 'Cải thiện điểm số, nỗ lực tự giác học tập',
    xp: 35,
    icon: '🌟',
    badge: 'Nỗ lực tiến bộ'
  },
  {
    id: 'discipline',
    title: 'Kỷ luật & Trực nhật tốt',
    desc: 'Giữ vệ sinh lớp học, đúng giờ, gương mẫu',
    xp: 15,
    icon: '🧹',
    badge: 'Gương mẫu kỷ luật'
  }
];

export const xpLeaderboardService = {
  /**
   * Cộng điểm XP cho học sinh khi hoàn thành bài tập, đề thi, game, hoặc giáo viên tặng thưởng
   */
  async awardXP({
    studentId = 'demo-student-id',
    studentName = 'Bé Minh Triết',
    gradeLevel = 'Lớp 1',
    avatarUrl = 'https://api.dicebear.com/7.x/bottts/svg?seed=student',
    xpAmount = 50,
    activityType = 'exam', // 'exam' | 'quiz' | 'game' | 'lesson' | 'assignment' | 'focus_bonus' | 'teacher_bonus'
    activityTitle = 'Hoàn thành bài tập',
    teacherId = null,
    teacherName = null,
    reason = null,
    isTeacherBonus = false,
    note = ''
  }) {
    const xpLog = {
      id: `xp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      student_id: studentId,
      student_name: studentName,
      grade_level: gradeLevel,
      avatar_url: avatarUrl,
      xp_amount: Number(xpAmount),
      activity_type: activityType,
      activity_title: activityTitle,
      teacher_id: teacherId,
      teacher_name: teacherName,
      reason: reason || activityTitle,
      created_at: new Date().toISOString()
    };

    // 1. Lưu vào LocalStorage
    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_XP_LOGS) || '[]');
      existing.unshift(xpLog);
      localStorage.setItem(LOCAL_STORAGE_XP_LOGS, JSON.stringify(existing.slice(0, 300)));
    } catch (e) {
      console.warn('LocalStorage save XP error:', e);
    }

    // 2. Đồng bộ vào Supabase nếu cấu hình (hoặc xếp vào PWA Offline Queue)
    const isRealUser = studentId && studentId !== 'demo-student' && !studentId.startsWith('demo-');
    const isRealTeacher = teacherId && teacherId !== 'demo-teacher' && !teacherId.startsWith('demo-');
    const dbPayload = {
      student_id: isRealUser ? studentId : null,
      student_name: studentName,
      grade_level: gradeLevel,
      avatar_url: avatarUrl,
      xp_amount: Number(xpAmount),
      activity_type: activityType,
      activity_title: activityTitle,
      teacher_id: isRealTeacher ? teacherId : null,
      teacher_name: teacherName,
      reason: reason || activityTitle,
      created_at: xpLog.created_at
    };

    if (isSupabaseConfigured() && typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const { error } = await supabase.from('student_xp_logs').insert([dbPayload]);
        if (error) {
          console.warn('Sync XP to Supabase failed, queuing to PWA Offline Queue:', error.message);
          pwaSyncService.enqueueOfflineAction({ type: 'sync_xp', table: 'student_xp_logs', data: dbPayload });
        }
      } catch (err) {
        console.warn('Sync XP to Supabase network error, queuing to PWA Offline Queue:', err);
        pwaSyncService.enqueueOfflineAction({ type: 'sync_xp', table: 'student_xp_logs', data: dbPayload });
      }
    } else {
      // Offline mode: automatically enqueue for background sync
      pwaSyncService.enqueueOfflineAction({ type: 'sync_xp', table: 'student_xp_logs', data: dbPayload });
    }

    // 3. Bắn event trình duyệt để hiện Toast thông báo nhận XP
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('edtech_xp_awarded', {
        detail: {
          xpAmount: Number(xpAmount),
          activityTitle,
          studentName,
          activityType,
          isTeacherBonus: isTeacherBonus || activityType === 'teacher_bonus',
          teacherName,
          reason: reason || activityTitle,
          note
        }
      });
      window.dispatchEvent(event);
    }

    return xpLog;
  },

  /**
   * Lấy Bảng Xếp Hạng học sinh theo Tuần / Tháng / Học kỳ và Khối lớp
   * @param {Object} options
   * @param {string} options.timeframe - 'week' | 'month' | 'semester'
   * @param {string} options.gradeLevel - 'all' | 'Lớp 1' | 'Lớp 2' | 'Lớp 3' | 'Lớp 4' | 'Lớp 5'
   */
  async getLeaderboard({ timeframe = 'week', gradeLevel = 'all' } = {}) {
    let combinedRanks = [...DEFAULT_STUDENT_RANKS];

    // Lấy các điểm XP vừa được cộng thêm từ LocalStorage để cập nhật realtime
    try {
      const logs = JSON.parse(localStorage.getItem(LOCAL_STORAGE_XP_LOGS) || '[]');
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Nhóm điểm cộng thêm cho từng student_id
      const extraXpByStudent = {};
      logs.forEach(log => {
        const sId = log.student_id;
        const logDate = new Date(log.created_at);
        const amount = Number(log.xp_amount) || 0;

        if (!extraXpByStudent[sId]) {
          extraXpByStudent[sId] = { week: 0, month: 0, semester: 0, count: 0 };
        }

        extraXpByStudent[sId].semester += amount;
        extraXpByStudent[sId].count += 1;
        if (logDate >= oneMonthAgo) extraXpByStudent[sId].month += amount;
        if (logDate >= oneWeekAgo) extraXpByStudent[sId].week += amount;
      });

      // Cập nhật điểm cho danh sách
      combinedRanks = combinedRanks.map(stu => {
        const extra = extraXpByStudent[stu.student_id];
        if (extra) {
          return {
            ...stu,
            xp_week: stu.xp_week + extra.week,
            xp_month: stu.xp_month + extra.month,
            xp_semester: stu.xp_semester + extra.semester,
            completed_tasks: stu.completed_tasks + extra.count
          };
        }
        return stu;
      });
    } catch (e) {
      console.warn('Leaderboard local update error:', e);
    }

    // Lấy dữ liệu Supabase nếu có
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('student_xp_logs').select('*');
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          // Có thể bổ sung tổng hợp từ remote CSDL
        }
      } catch (err) {
        console.warn('Fetch remote XP error:', err);
      }
    }

    // Lọc theo Khối lớp (Grade Level)
    let filtered = combinedRanks;
    if (gradeLevel && gradeLevel !== 'all') {
      filtered = filtered.filter(s => s.grade_level === gradeLevel);
    }

    // Chọn trường XP theo timeframe để sắp xếp
    const xpKey = timeframe === 'week' ? 'xp_week' : timeframe === 'month' ? 'xp_month' : 'xp_semester';

    // Sắp xếp giảm dần theo XP
    filtered.sort((a, b) => b[xpKey] - a[xpKey]);

    // Gán rank thứ tự, level và danh hiệu
    return filtered.map((item, index) => {
      const currentXP = item[xpKey];
      const level = Math.floor(item.xp_semester / 250) + 1;
      const progressPercent = Math.round(((item.xp_semester % 250) / 250) * 100);

      return {
        ...item,
        rank: index + 1,
        current_xp: currentXP,
        level,
        progress_percent: progressPercent
      };
    });
  },

  /**
   * Lấy vị trí thứ hạng của học sinh hiện tại
   */
  async getMyRank({ studentId = 'demo-student-id', timeframe = 'week', gradeLevel = 'all' } = {}) {
    const list = await this.getLeaderboard({ timeframe, gradeLevel });
    const myIndex = list.findIndex(s => s.student_id === studentId);
    if (myIndex !== -1) {
      const myItem = list[myIndex];
      const prevItem = myIndex > 0 ? list[myIndex - 1] : null;
      const xpNeeded = prevItem ? (prevItem.current_xp - myItem.current_xp + 10) : 0;

      return {
        ...myItem,
        xp_needed_to_pass: Math.max(0, xpNeeded),
        next_rank: myIndex > 0 ? myIndex : 1
      };
    }

    return null;
  },

  /**
   * Giáo viên cộng điểm thưởng trực tiếp cho học sinh kèm lý do (ví dụ: "Phát biểu hay", "Giúp đỡ bạn")
   */
  async awardTeacherBonus({
    studentId,
    studentName,
    gradeLevel = 'Lớp 1',
    className = '',
    avatarUrl,
    xpAmount = 20,
    reason = 'Phát biểu hay',
    teacherId = null,
    teacherName = 'Cô Giáo',
    note = ''
  }) {
    const cleanAmount = Math.max(5, Math.min(500, parseInt(xpAmount, 10) || 20));
    const titleText = `[Thầy/Cô ${teacherName || 'Giáo viên'} khen thưởng]: ${reason}`;

    return await this.awardXP({
      studentId: studentId || 'demo-student-id',
      studentName: studentName || 'Học sinh',
      gradeLevel: gradeLevel || 'Lớp 1',
      avatarUrl: avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=student',
      xpAmount: cleanAmount,
      activityType: 'teacher_bonus',
      activityTitle: titleText,
      teacherId,
      teacherName,
      reason,
      isTeacherBonus: true,
      note
    });
  },

  /**
   * Lấy lịch sử giáo viên tặng thưởng điểm
   */
  async getTeacherBonusHistory({ studentId = null, limit = 50 } = {}) {
    let logs = [];
    try {
      const all = JSON.parse(localStorage.getItem(LOCAL_STORAGE_XP_LOGS) || '[]');
      logs = all.filter(l => l.activity_type === 'teacher_bonus');
      if (studentId) {
        logs = logs.filter(l => l.student_id === studentId);
      }
    } catch (e) {
      console.warn('Error reading local bonus logs:', e);
    }

    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('student_xp_logs')
          .select('*')
          .eq('activity_type', 'teacher_bonus')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (studentId) {
          query = query.eq('student_id', studentId);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const map = new Map();
          [...data, ...logs].forEach(item => {
            if (item.id && !map.has(item.id)) {
              map.set(item.id, item);
            }
          });
          logs = Array.from(map.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
      } catch (err) {
        console.warn('Error fetching Supabase bonus logs:', err);
      }
    }

    return logs.slice(0, limit);
  },

  /**
   * Lấy danh sách tất cả học sinh (để giáo viên chọn khen thưởng nhanh)
   */
  async getAllStudentsList() {
    const baseList = DEFAULT_STUDENT_RANKS.map(s => ({
      id: s.student_id,
      name: s.student_name,
      grade_level: s.grade_level,
      class_name: s.class_name,
      avatar_url: s.avatar_url,
      title: s.title
    }));

    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, role, avatar_url')
          .eq('role', 'student');
        
        if (data && data.length > 0) {
          const remoteList = data.map(p => ({
            id: p.id,
            name: p.full_name || 'Học sinh',
            grade_level: 'Lớp 1',
            class_name: 'Lớp 1A',
            avatar_url: p.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.id}`,
            title: 'Học Sinh Chăm Chỉ ⭐'
          }));
          const map = new Map();
          [...baseList, ...remoteList].forEach(s => map.set(s.id, s));
          return Array.from(map.values());
        }
      } catch (e) {}
    }

    return baseList;
  }
};

export default xpLeaderboardService;
