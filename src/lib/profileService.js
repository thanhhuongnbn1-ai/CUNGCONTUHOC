import { supabase, isSupabaseConfigured } from './supabase';
import { pwaSyncService } from './pwaSyncService';

export const LOCAL_STORAGE_PROFILE_KEY = 'vuihoc_user_profile';

/**
 * BỘ SƯU TẬP AVATAR ĐÁNG YÊU CHO HỌC SINH TIỂU HỌC & THẦY CÔ
 */
export const AVATAR_PRESETS = [
  // Nhóm 1: Robot Công Nghệ Vui Nhộn
  {
    id: 'robot-1',
    category: 'Robot Vui Nhộn 🤖',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=student',
    label: 'Robot Vàng Cam'
  },
  {
    id: 'robot-2',
    category: 'Robot Vui Nhộn 🤖',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
    label: 'Robot Xanh Lam'
  },
  {
    id: 'robot-3',
    category: 'Robot Vui Nhộn 🤖',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sparky',
    label: 'Robot Tia Chớp'
  },
  {
    id: 'robot-4',
    category: 'Robot Vui Nhộn 🤖',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Gizmo',
    label: 'Robot Thông Thái'
  },

  // Nhóm 2: Thú Cưng Đáng Yêu
  {
    id: 'pet-1',
    category: 'Thú Cưng Đáng Yêu 🐱',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Bella',
    label: 'Mèo Con Mắt Biếc'
  },
  {
    id: 'pet-2',
    category: 'Thú Cưng Đáng Yêu 🐱',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Oliver',
    label: 'Cún Con Tinh Nghịch'
  },
  {
    id: 'pet-3',
    category: 'Thú Cưng Đáng Yêu 🐱',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Chloe',
    label: 'Thỏ Con Trắng Tinh'
  },
  {
    id: 'pet-4',
    category: 'Thú Cưng Đáng Yêu 🐱',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Milo',
    label: 'Gấu Nâu Chăm Chỉ'
  },

  // Nhóm 3: Bé Chăm Học
  {
    id: 'kid-1',
    category: 'Bé Chăm Học 🎒',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=MinhTriet',
    label: 'Bé Trai Đeo Kính'
  },
  {
    id: 'kid-2',
    category: 'Bé Chăm Học 🎒',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=AnNhien',
    label: 'Bé Gái Tóc Bím'
  },
  {
    id: 'kid-3',
    category: 'Bé Chăm Học 🎒',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=BaoNgoc',
    label: 'Bé Gái Nơ Đỏ'
  },
  {
    id: 'kid-4',
    category: 'Bé Chăm Học 🎒',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=DucAnh',
    label: 'Bé Trai Năng Động'
  },

  // Nhóm 4: Thầy Cô Giáo & Quản Trị Viên
  {
    id: 'teacher-1',
    category: 'Thầy Cô Giáo 👩‍🏫',
    url: 'https://api.dicebear.com/7.x/micah/svg?seed=TeacherHoa',
    label: 'Cô Giáo Dịu Dàng'
  },
  {
    id: 'teacher-2',
    category: 'Thầy Cô Giáo 👩‍🏫',
    url: 'https://api.dicebear.com/7.x/micah/svg?seed=MasterMinh',
    label: 'Thầy Giáo Thông Thái'
  },
  {
    id: 'admin-1',
    category: 'Thầy Cô Giáo 👩‍🏫',
    url: 'https://api.dicebear.com/7.x/micah/svg?seed=AdminBoss',
    label: 'Quản Trị Viên Hệ Thống'
  }
];

export const GRADE_OPTIONS = [
  'Tiền Lớp 1',
  'Lớp 1',
  'Lớp 2',
  'Lớp 3',
  'Lớp 4',
  'Lớp 5'
];

export const POPULAR_SCHOOLS = [
  'Tiểu học Chu Văn An',
  'Tiểu học Kim Đồng',
  'Tiểu học Lê Quý Đôn',
  'Tiểu học Đoàn Thị Điểm',
  'Tiểu học Vinschool',
  'Tiểu học Archimedes Academy',
  'Tiểu học Nguyễn Siêu',
  'Tiểu học Thăng Long',
  'Tiểu học Trưng Vương'
];

export const DEFAULT_USER_PROFILE = {
  id: 'demo-student-id',
  email: 'hocsinh@vuihoc.vn',
  full_name: 'Bé Minh Triết',
  role: 'student',
  avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=student',
  phone_number: '0987654321',
  school_name: 'Tiểu học Chu Văn An',
  class_name: '1A1',
  grade_level: 'Lớp 1',
  bio: 'Em yêu thích môn Toán tư duy, khám phá vũ trụ và chơi game giải đố!',
  date_of_birth: '2019-09-05',
  parent_name: 'Nguyễn Văn Hùng',
  parent_phone: '0912345678'
};

/**
 * TẢI PROFILE HIỆN TẠI TỪ LOCALSTORAGE HOẶC DEFAULT
 */
export function getInitialUserProfile() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_USER_PROFILE, ...parsed };
    }
  } catch (err) {
    console.warn('Lỗi đọc cache profile:', err);
  }
  return DEFAULT_USER_PROFILE;
}

/**
 * CẬP NHẬT PROFILE NGƯỜI DÙNG & ĐỒNG BỘ CSDL SUPABASE + PWA OFFLINE
 */
export async function updateUserProfile(profileData) {
  const current = getInitialUserProfile();
  const merged = {
    ...current,
    ...profileData,
    updated_at: new Date().toISOString()
  };

  // 1. Lưu tức thì vào LocalStorage (Đảm bảo trải nghiệm 0ms và giữ phiên khi F5)
  localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(merged));

  // 2. Phát sự kiện toàn cục để mọi Component (Navbar, Leaderboard, AI Chatbot) tự cập nhật
  window.dispatchEvent(new CustomEvent('user_profile_updated', { detail: { profile: merged } }));

  // 3. Đồng bộ vào CSDL Supabase
  if (isSupabaseConfigured() && merged.id) {
    try {
      const updatePayload = {
        full_name: merged.full_name?.trim() || null,
        avatar_url: merged.avatar_url,
        phone_number: merged.phone_number?.trim() || null,
        school_name: merged.school_name?.trim() || null,
        class_name: merged.class_name?.trim() || null,
        grade_level: merged.grade_level || 'Lớp 1',
        bio: merged.bio?.trim() || null,
        parent_name: merged.parent_name?.trim() || null,
        parent_phone: merged.parent_phone?.trim() || null,
        updated_at: merged.updated_at
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', merged.id)
        .select()
        .single();

      if (error) {
        console.warn('Supabase profile update warning:', error);
        pwaSyncService.enqueueOfflineAction('UPDATE_PROFILE', merged);
      } else if (data) {
        // Cập nhật lại với dữ liệu mới từ database
        const finalized = { ...merged, ...data };
        localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(finalized));
        return finalized;
      }
    } catch (err) {
      console.warn('Lỗi kết nối Supabase khi cập nhật profile, đưa vào offline queue:', err);
      pwaSyncService.enqueueOfflineAction('UPDATE_PROFILE', merged);
    }
  } else {
    // Nếu chưa config Supabase hoặc đang offline
    pwaSyncService.enqueueOfflineAction('UPDATE_PROFILE', merged);
  }

  return merged;
}

/**
 * TÍNH TOÁN THỐNG KÊ HỌC TẬP CỦA NGƯỜI DÙNG (XP, STREAK, HOÀN THÀNH)
 */
export async function getUserProfileStats(userId) {
  let stats = {
    totalXp: 450,
    rank: 1,
    streakDays: 7,
    completedLessons: 12,
    gamesPlayed: 18,
    badgesCount: 5,
    rankTitle: 'Chiến Binh Trí Tuệ Vàng 🏆'
  };

  if (isSupabaseConfigured() && userId) {
    try {
      // 1. Tổng điểm XP
      const { data: xpData } = await supabase
        .from('student_xp_logs')
        .select('xp_amount')
        .eq('student_id', userId);

      if (xpData && xpData.length > 0) {
        const sumXp = xpData.reduce((acc, row) => acc + (row.xp_amount || 0), 0);
        stats.totalXp = sumXp;
      }

      // 2. Số bài học hoàn thành
      const { count: completedCount } = await supabase
        .from('student_progress')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', userId)
        .eq('status', 'completed');

      if (typeof completedCount === 'number') {
        stats.completedLessons = completedCount;
      }

      // 3. Số game đã chơi
      const { count: gameCount } = await supabase
        .from('game_scores')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', userId);

      if (typeof gameCount === 'number') {
        stats.gamesPlayed = gameCount;
      }
    } catch (err) {
      console.warn('Lỗi lấy thống kê profile từ Supabase:', err);
    }
  }

  // Xác định danh hiệu dựa trên XP
  if (stats.totalXp >= 1000) {
    stats.rankTitle = 'Đại Kiện Tướng Tri Thức 🌟';
  } else if (stats.totalXp >= 500) {
    stats.rankTitle = 'Chiến Binh Trí Tuệ Cấp Cao 🛡️';
  } else {
    stats.rankTitle = 'Ngôi Sao Sáng Tri Thức ⭐';
  }

  return stats;
}
