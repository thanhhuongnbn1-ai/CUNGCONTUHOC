import { supabase, isSupabaseConfigured } from './supabase';

const DEFAULT_LEADERBOARD = [
  {
    id: 'lead-1',
    student_name: 'Bé Minh Triết',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=minhtriet',
    grade_level: 'Lớp 1A',
    game_name: 'Lật Thẻ Ghi Nhớ',
    score: 100,
    time_spent_seconds: 28,
    played_at: '2026-10-12T14:10:00Z'
  },
  {
    id: 'lead-2',
    student_name: 'Trần Bảo Anh',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=baoanh',
    grade_level: 'Lớp 2B',
    game_name: 'Khung Chữ Kỳ Diệu',
    score: 100,
    time_spent_seconds: 35,
    played_at: '2026-10-12T13:45:00Z'
  },
  {
    id: 'lead-3',
    student_name: 'Nguyễn Tuấn Kiệt',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=tuankiet',
    grade_level: 'Lớp 3A',
    game_name: 'Vòng Quay May Mắn',
    score: 95,
    time_spent_seconds: 42,
    played_at: '2026-10-12T11:20:00Z'
  },
  {
    id: 'lead-4',
    student_name: 'Lê Thảo My',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=thaomy',
    grade_level: 'Lớp 1B',
    game_name: 'Lật Thẻ Ghi Nhớ',
    score: 90,
    time_spent_seconds: 48,
    played_at: '2026-10-12T10:05:00Z'
  },
  {
    id: 'lead-5',
    student_name: 'Phạm Đức Huy',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=duchuy',
    grade_level: 'Lớp 2A',
    game_name: 'Khung Chữ Kỳ Diệu',
    score: 85,
    time_spent_seconds: 52,
    played_at: '2026-10-12T09:30:00Z'
  }
];

const LOCAL_LEADERBOARD_KEY = 'vuihoc_game_leaderboard';

export const getCachedLeaderboard = () => {
  try {
    const raw = localStorage.getItem(LOCAL_LEADERBOARD_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_LEADERBOARD;
};

export const saveScoreToLocalLeaderboard = (entry) => {
  const current = getCachedLeaderboard();
  const updated = [entry, ...current];
  // Sort by score DESC, then time_spent_seconds ASC
  updated.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (a.time_spent_seconds || 999) - (b.time_spent_seconds || 999);
  });
  localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(updated.slice(0, 50)));
  return updated;
};

/**
 * Lấy danh sách Bảng Xếp Hạng Top Học Sinh từ Supabase DB
 * Sắp xếp: Điểm số cao nhất (DESC) -> Thời gian ngắn nhất (ASC)
 */
export const fetchTopGameLeaderboard = async (gameFilter = 'all') => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('game_scores')
        .select(`
          id,
          score,
          max_score,
          time_spent_seconds,
          game_metadata,
          played_at,
          profiles (full_name, avatar_url, grade_level),
          materials (title)
        `)
        .order('score', { ascending: false })
        .order('time_spent_seconds', { ascending: true })
        .limit(30);

      if (!error && data && data.length > 0) {
        const formatted = data.map((item) => ({
          id: item.id,
          student_name: item.profiles?.full_name || 'Học sinh ẩn danh',
          avatar_url: item.profiles?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.id}`,
          grade_level: item.profiles?.grade_level || 'Lớp 1',
          game_name: item.game_metadata?.gameName || item.materials?.title || 'Mini Game',
          score: item.score,
          time_spent_seconds: item.time_spent_seconds || 0,
          played_at: item.played_at
        }));

        if (gameFilter !== 'all') {
          return formatted.filter((f) => f.game_name.toLowerCase().includes(gameFilter.toLowerCase()));
        }
        return formatted;
      }
    } catch (err) {
      console.warn('Leaderboard Supabase query error, fallback to cache:', err);
    }
  }

  // Fallback cache
  const cached = getCachedLeaderboard();
  if (gameFilter !== 'all') {
    return cached.filter((c) => c.game_name.toLowerCase().includes(gameFilter.toLowerCase()));
  }
  return cached;
};
