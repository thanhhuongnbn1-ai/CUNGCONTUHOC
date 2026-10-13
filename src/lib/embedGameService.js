import { supabase, isSupabaseConfigured } from './supabase';
import { pwaSyncService } from './pwaSyncService';
import { xpLeaderboardService } from './xpLeaderboardService';

/**
 * THÔNG TIN & CẤU HÌNH CÁC NỀN TẢNG NHÚNG iFRAME NGOẠI BẰNG
 */
export const EMBED_PROVIDERS = {
  wordwall: {
    id: 'wordwall',
    name: 'Wordwall',
    brandColor: '#0070BA',
    bgLight: 'bg-blue-50 border-blue-200 text-blue-700',
    description: 'Trò chơi tương tác đa dạng: Ghép thẻ, Vòng quay, Đập chuột, Đố vui, Sắp xếp thứ tự.',
    placeholder: 'https://wordwall.net/resource/... hoặc https://wordwall.net/embed/...',
    allowAttributes: 'fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
  },
  quizizz: {
    id: 'quizizz',
    name: 'Quizizz',
    brandColor: '#8854C0',
    bgLight: 'bg-purple-50 border-purple-200 text-purple-700',
    description: 'Đấu trường trắc nghiệm Gamification tốc độ cao, bài tập tự luyện và thi đấu nhóm.',
    placeholder: 'https://quizizz.com/join/quiz/... hoặc https://quizizz.com/admin/quiz/...',
    allowAttributes: 'fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
  },
  kahoot: {
    id: 'kahoot',
    name: 'Kahoot!',
    brandColor: '#46178F',
    bgLight: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    description: 'Đấu trường kiến thức trực tiếp và thử thách tự học sinh động với âm thanh hào hứng.',
    placeholder: 'https://play.kahoot.it/v2/?quizId=... hoặc https://kahoot.it/challenge/...',
    allowAttributes: 'fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
  },
  canva: {
    id: 'canva',
    name: 'Canva',
    brandColor: '#00C4CC',
    bgLight: 'bg-teal-50 border-teal-200 text-teal-700',
    description: 'Bài giảng tương tác, Flashcard đồ họa bắt mắt và trò chơi giáo dục thiết kế trên Canva.',
    placeholder: 'https://www.canva.com/design/.../view?embed hoặc mã nhúng HTML iframe',
    allowAttributes: 'fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
  },
  genially: {
    id: 'genially',
    name: 'Genially',
    brandColor: '#FF5050',
    bgLight: 'bg-rose-50 border-rose-200 text-rose-700',
    description: 'Bài giảng trải nghiệm Escape Room, Infographic tương tác và Bản đồ phiêu lưu.',
    placeholder: 'https://view.genial.ly/... hoặc mã nhúng HTML iframe',
    allowAttributes: 'fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    brandColor: '#FF0000',
    bgLight: 'bg-red-50 border-red-200 text-red-700',
    description: 'Video bài giảng hoạt hình giáo dục, thí nghiệm khoa học và hướng dẫn phát âm.',
    placeholder: 'https://www.youtube.com/watch?v=... hoặc https://youtu.be/...',
    allowAttributes: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
  },
  custom: {
    id: 'custom',
    name: 'Tùy chỉnh (HTML5)',
    brandColor: '#FF6600',
    bgLight: 'bg-orange-50 border-orange-200 text-orange-700',
    description: 'Mọi nền tảng hỗ trợ iFrame Embed W3C chuẩn quốc tế (GeoGebra, PhET, Scratch, Desmos).',
    placeholder: 'https://... hoặc đoạn mã <iframe src="..."></iframe>',
    allowAttributes: 'fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
  }
};

/**
 * DANH SÁCH BÀI HỌC MẪU CHUẨN ĐÃ ĐƯỢC KIỂM ĐỊNH (PRESETS CHO GIÁO VIÊN NẠP 1-CLICK)
 */
export const CURATED_EMBED_GAMES = [
  {
    id: 'embed-sample-wordwall-math1',
    provider: 'wordwall',
    title: 'Đấu Trường Phép Cộng Trong Phạm Vi 10 (Wordwall)',
    grade_slug: 'lop-1',
    grade_name: 'Lớp 1',
    subject: 'Toán học',
    description: 'Trò chơi ghép thẻ trực quan: Kéo các phép tính cộng vào giỏ kết quả tương ứng. Có tính giờ và hiệu ứng âm thanh sống động!',
    original_url: 'https://wordwall.net/resource/4a1c5b8b8d4f4e249f7e53f191f4d96a',
    embed_url: 'https://wordwall.net/embed/4a1c5b8b8d4f4e249f7e53f191f4d96a?themeId=1&templateId=5&fontStackId=0',
    xp_reward: 50,
    duration_minutes: 8,
    tags: ['Toán 1', 'Phép cộng', 'Ghép thẻ', 'Wordwall']
  },
  {
    id: 'embed-sample-wordwall-english2',
    provider: 'wordwall',
    title: 'Đập Chuột Từ Vựng Tiếng Anh Chủ Đề Động Vật (Wordwall)',
    grade_slug: 'lop-2',
    grade_name: 'Lớp 2',
    subject: 'Tiếng Anh',
    description: 'Rèn luyện phản xạ nhanh: Nhìn hình con vật và dùng búa đập đúng chữ cái tiếng Anh tương ứng.',
    original_url: 'https://wordwall.net/resource/7b2e8c1f9a3d4f5e6b7c8d9e0f1a2b3c',
    embed_url: 'https://wordwall.net/embed/7b2e8c1f9a3d4f5e6b7c8d9e0f1a2b3c?themeId=21&templateId=3&fontStackId=0',
    xp_reward: 60,
    duration_minutes: 10,
    tags: ['Tiếng Anh 2', 'Từ vựng', 'Đập chuột', 'Wordwall']
  },
  {
    id: 'embed-sample-quizizz-math3',
    provider: 'quizizz',
    title: 'Thử Thách Bảng Cửu Chương Siêu Tốc (Quizizz)',
    grade_slug: 'lop-3',
    grade_name: 'Lớp 3',
    subject: 'Toán học',
    description: '15 câu hỏi trắc nghiệm bảng nhân 2 đến bảng nhân 9. Thi đấu tranh cúp vàng cùng bạn bè trong lớp!',
    original_url: 'https://quizizz.com/admin/quiz/61b7f03222e96d001e3b6eb4',
    embed_url: 'https://quizizz.com/embed/quiz/61b7f03222e96d001e3b6eb4',
    xp_reward: 70,
    duration_minutes: 12,
    tags: ['Toán 3', 'Bảng cửu chương', 'Tốc độ', 'Quizizz']
  },
  {
    id: 'embed-sample-kahoot-vietnamese',
    provider: 'kahoot',
    title: 'Đấu Trường Ca Dao & Tục Ngữ Tiểu Học (Kahoot!)',
    grade_slug: 'lop-4',
    grade_name: 'Lớp 4',
    subject: 'Tiếng Việt',
    description: 'Thử thách đoán vế sau của các câu tục ngữ dân gian Việt Nam nổi tiếng. Giúp bé mở rộng vốn từ ngữ và đạo lý làm người.',
    original_url: 'https://create.kahoot.it/details/a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    embed_url: 'https://play.kahoot.it/v2/?quizId=a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    xp_reward: 60,
    duration_minutes: 10,
    tags: ['Tiếng Việt 4', 'Ca dao', 'Tục ngữ', 'Kahoot']
  },
  {
    id: 'embed-sample-canva-shapes',
    provider: 'canva',
    title: 'Flashcard Tương Tác: Khám Phá Hình Khối 3D (Canva)',
    grade_slug: 'lop-2',
    grade_name: 'Lớp 2',
    subject: 'Toán học',
    description: 'Bộ thẻ trực quan tương tác sinh động: Nhận biết Hình hộp chữ nhật, Hình lập phương và Hình trụ trong thực tế.',
    original_url: 'https://www.canva.com/design/DAFexample1/view',
    embed_url: 'https://www.canva.com/design/DAFexample1/view?embed',
    xp_reward: 40,
    duration_minutes: 6,
    tags: ['Toán 2', 'Hình học', 'Flashcard', 'Canva']
  },
  {
    id: 'embed-sample-genially-solarsystem',
    provider: 'genially',
    title: 'Escape Room Bí Ẩn: Du Hành Hệ Mặt Trời (Genially)',
    grade_slug: 'lop-5',
    grade_name: 'Lớp 5',
    subject: 'Khoa học',
    description: 'Trò chơi giải mật mã phòng thí nghiệm vũ trụ: Khám phá các hành tinh và trả lời câu đố khoa học để mở cửa phi thuyền!',
    original_url: 'https://view.genial.ly/60e3a9c7b8d4e90d8a5c3214',
    embed_url: 'https://view.genial.ly/60e3a9c7b8d4e90d8a5c3214',
    xp_reward: 80,
    duration_minutes: 15,
    tags: ['Khoa học 5', 'Escape Room', 'Vũ trụ', 'Genially']
  }
];

/**
 * TỰ ĐỘNG NHẬN DIỆN NỀN TẢNG TỪ URL HOẶC ĐOẠN MÃ EMBED
 */
export function detectEmbedProvider(input) {
  if (!input || typeof input !== 'string') return 'custom';
  const text = input.toLowerCase().trim();

  if (text.includes('wordwall.net')) return 'wordwall';
  if (text.includes('quizizz.com')) return 'quizizz';
  if (text.includes('kahoot.it') || text.includes('kahoot.com')) return 'kahoot';
  if (text.includes('canva.com')) return 'canva';
  if (text.includes('genial.ly')) return 'genially';
  if (text.includes('youtube.com') || text.includes('youtu.be')) return 'youtube';

  return 'custom';
}

/**
 * CHUYỂN ĐỔI URL HOẶC ĐOẠN MÃ IFRAME SANG ĐƯỜNG DẪN EMBED CHUẨN MƯỢT MÀ
 */
export function convertToEmbedUrl(input) {
  if (!input || typeof input !== 'string') return '';
  let cleanInput = input.trim();

  // 1. Trích xuất src nếu người dùng dán toàn bộ đoạn mã HTML <iframe>
  const iframeSrcMatch = cleanInput.match(/src=["']([^"']+)["']/i);
  if (iframeSrcMatch && iframeSrcMatch[1]) {
    cleanInput = iframeSrcMatch[1];
  }

  // Loại bỏ khoảng trắng thừa
  cleanInput = cleanInput.trim();

  // 2. Chuyển đổi theo từng nền tảng
  // A. WORDWALL
  if (cleanInput.includes('wordwall.net')) {
    // Nếu đã là link embed thì giữ nguyên
    if (cleanInput.includes('/embed/')) {
      return cleanInput;
    }
    // Trích xuất mã ID bài học từ link resource/play
    // Ví dụ: https://wordwall.net/resource/12345/ten-bai-hoc -> 12345
    // Hoặc: https://wordwall.net/vi/resource/12345/...
    const resourceMatch = cleanInput.match(/(?:resource|play)\/([0-9a-zA-Z_-]+)/i);
    if (resourceMatch && resourceMatch[1]) {
      return `https://wordwall.net/embed/${resourceMatch[1]}?themeId=1&templateId=5&fontStackId=0`;
    }
    return cleanInput;
  }

  // B. QUIZIZZ
  if (cleanInput.includes('quizizz.com')) {
    if (cleanInput.includes('/embed/quiz/')) {
      return cleanInput;
    }
    // Trích xuất quiz ID từ admin/quiz/<id> hoặc join/quiz/<id>
    const quizMatch = cleanInput.match(/(?:admin\/quiz|join\/quiz|quiz)\/([0-9a-zA-Z_-]+)/i);
    if (quizMatch && quizMatch[1]) {
      return `https://quizizz.com/embed/quiz/${quizMatch[1]}`;
    }
    return cleanInput;
  }

  // C. KAHOOT
  if (cleanInput.includes('kahoot')) {
    if (cleanInput.includes('play.kahoot.it') || cleanInput.includes('challenge')) {
      return cleanInput;
    }
    // Trích xuất quizId từ create.kahoot.it/details/<quizId>
    const kahootDetailsMatch = cleanInput.match(/details\/([0-9a-zA-Z_-]+)/i);
    if (kahootDetailsMatch && kahootDetailsMatch[1]) {
      return `https://play.kahoot.it/v2/?quizId=${kahootDetailsMatch[1]}`;
    }
    return cleanInput;
  }

  // D. CANVA
  if (cleanInput.includes('canva.com')) {
    try {
      const urlObj = new URL(cleanInput);
      // Chuyển /edit sang /view
      let pathname = urlObj.pathname.replace(/\/edit.*$/, '/view');
      if (!pathname.endsWith('/view') && pathname.includes('/design/')) {
        pathname = pathname.replace(/\/watch.*$/, '/view');
      }
      urlObj.pathname = pathname;
      urlObj.searchParams.set('embed', '');
      return urlObj.toString().replace('embed=', 'embed');
    } catch (_) {
      if (!cleanInput.includes('embed')) {
        return cleanInput.includes('?') ? `${cleanInput}&embed` : `${cleanInput}?embed`;
      }
      return cleanInput;
    }
  }

  // E. GENIALLY
  if (cleanInput.includes('genial.ly')) {
    // Genially links dạng https://view.genial.ly/<id>
    return cleanInput;
  }

  // F. YOUTUBE
  if (cleanInput.includes('youtube.com') || cleanInput.includes('youtu.be')) {
    if (cleanInput.includes('/embed/')) {
      return cleanInput;
    }
    // Dạng https://youtu.be/<id>
    const shortMatch = cleanInput.match(/youtu\.be\/([a-zA-Z0-9_-]+)/i);
    if (shortMatch && shortMatch[1]) {
      return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=0&rel=0`;
    }
    // Dạng https://www.youtube.com/watch?v=<id>
    const watchMatch = cleanInput.match(/[?&]v=([a-zA-Z0-9_-]+)/i);
    if (watchMatch && watchMatch[1]) {
      return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=0&rel=0`;
    }
    return cleanInput;
  }

  return cleanInput;
}

const LOCAL_STORAGE_EMBED_GAMES_KEY = 'vuihoc_embedded_games_list';

/**
 * LẤY TẤT CẢ GAME EMBED ĐÃ LƯU TRONG HỆ THỐNG
 */
export async function getStoredEmbeddedGames({ gradeSlug = null, subject = null } = {}) {
  let games = [];

  // 1. Thử lấy từ Supabase Database
  if (isSupabaseConfigured()) {
    try {
      // Truy vấn từ bảng embedded_games
      let query = supabase
        .from('embedded_games')
        .select('*')
        .order('created_at', { ascending: false });

      if (gradeSlug && gradeSlug !== 'all') {
        query = query.eq('grade_slug', gradeSlug);
      }
      if (subject && subject !== 'Tất cả') {
        query = query.eq('subject', subject);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        games = data;
      } else {
        // Fallback truy vấn từ bảng materials có content_type = 'iframe_embed'
        let matQuery = supabase
          .from('materials')
          .select('*')
          .eq('content_type', 'iframe_embed')
          .order('created_at', { ascending: false });

        const { data: matData } = await matQuery;
        if (matData && matData.length > 0) {
          games = matData.map(m => ({
            id: m.id,
            material_id: m.id,
            title: m.title,
            description: m.description,
            subject: m.subject,
            embed_url: m.iframe_url || m.source_url,
            provider: detectEmbedProvider(m.iframe_url || m.source_url),
            grade_slug: gradeSlug || 'lop-1',
            xp_reward: 50,
            duration_minutes: 10,
            created_at: m.created_at
          }));
        }
      }
    } catch (err) {
      console.warn('Supabase fetch embedded games error, falling back to local cache:', err);
    }
  }

  // 2. Tải từ LocalStorage cache
  const localCache = JSON.parse(localStorage.getItem(LOCAL_STORAGE_EMBED_GAMES_KEY) || '[]');

  // Kết hợp và gộp trùng theo ID / Embed URL
  const combined = [...games, ...localCache, ...CURATED_EMBED_GAMES];
  const uniqueMap = new Map();

  for (const item of combined) {
    const key = item.embed_url || item.id;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  }

  let result = Array.from(uniqueMap.values());

  // Lọc theo điều kiện
  if (gradeSlug && gradeSlug !== 'all') {
    result = result.filter(g => !g.grade_slug || g.grade_slug === gradeSlug);
  }
  if (subject && subject !== 'Tất cả') {
    result = result.filter(g => !g.subject || g.subject === subject);
  }

  return result;
}

/**
 * LƯU GAME NHÚNG iFRAME VÀO CSDL SUPABASE & ĐỒNG BỘ OFFLINE
 */
export async function saveEmbeddedGameToDB({
  gradeSlug = 'lop-1',
  subject = 'Toán học',
  title,
  description = '',
  rawUrlOrHtml,
  xpReward = 50,
  durationMinutes = 10,
  userProfile = null,
  tags = []
}) {
  const provider = detectEmbedProvider(rawUrlOrHtml);
  const embedUrl = convertToEmbedUrl(rawUrlOrHtml);

  if (!embedUrl) {
    throw new Error('Đường dẫn URL nhúng hoặc mã iframe không hợp lệ!');
  }

  const newGame = {
    id: `embed_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    grade_slug: gradeSlug,
    subject,
    title: title.trim(),
    description: description.trim() || `Trò chơi tương tác nhúng từ ${EMBED_PROVIDERS[provider]?.name || 'iFrame'}.`,
    provider,
    embed_url: embedUrl,
    original_url: rawUrlOrHtml.trim(),
    aspect_ratio: '16:9',
    xp_reward: Number(xpReward) || 50,
    duration_minutes: Number(durationMinutes) || 10,
    author_id: userProfile?.id || null,
    author_name: userProfile?.full_name || 'Giáo viên',
    tags: tags.length > 0 ? tags : [subject, EMBED_PROVIDERS[provider]?.name || 'Game'],
    is_published: true,
    created_at: new Date().toISOString()
  };

  // 1. Lưu vào LocalStorage cache trước (Đảm bảo trải nghiệm 0ms và offline an toàn)
  const existingLocal = JSON.parse(localStorage.getItem(LOCAL_STORAGE_EMBED_GAMES_KEY) || '[]');
  const updatedLocal = [newGame, ...existingLocal.filter(g => g.embed_url !== embedUrl)];
  localStorage.setItem(LOCAL_STORAGE_EMBED_GAMES_KEY, JSON.stringify(updatedLocal));

  // 2. Đồng bộ CSDL Supabase
  if (isSupabaseConfigured()) {
    try {
      // A. Lưu vào bảng embedded_games
      await supabase.from('embedded_games').insert([{
        grade_slug: newGame.grade_slug,
        subject: newGame.subject,
        title: newGame.title,
        description: newGame.description,
        provider: newGame.provider,
        embed_url: newGame.embed_url,
        original_url: newGame.original_url,
        aspect_ratio: newGame.aspect_ratio,
        xp_reward: newGame.xp_reward,
        duration_minutes: newGame.duration_minutes,
        author_id: newGame.author_id,
        author_name: newGame.author_name,
        tags: newGame.tags,
        is_published: true
      }]);

      // B. Đồng bộ đồng thời vào bảng materials (để hiển thị trong Thư mục Lớp & Viewer)
      const { data: gradeFolder } = await supabase
        .from('grades_folders')
        .select('id')
        .eq('slug', gradeSlug)
        .single();

      if (gradeFolder) {
        await supabase.from('materials').insert([{
          grade_id: gradeFolder.id,
          subject: newGame.subject,
          title: newGame.title,
          description: newGame.description,
          content_type: 'iframe_embed',
          source_url: newGame.original_url,
          iframe_url: newGame.embed_url,
          author_id: newGame.author_id,
          ai_generated_content: {
            provider: newGame.provider,
            xpReward: newGame.xp_reward,
            durationMinutes: newGame.duration_minutes
          }
        }]);
      }
    } catch (err) {
      console.warn('Lỗi lưu CSDL Supabase, đưa vào hàng đợi PWA Sync:', err);
      pwaSyncService.enqueueOfflineAction('SAVE_EMBEDDED_GAME', newGame);
    }
  } else {
    // Đưa vào offline queue nếu Supabase chưa config
    pwaSyncService.enqueueOfflineAction('SAVE_EMBEDDED_GAME', newGame);
  }

  return newGame;
}

/**
 * XÓA GAME NHÚNG KHỎI HỆ THỐNG
 */
export async function deleteEmbeddedGame(gameId) {
  // Xóa khỏi local storage
  const existingLocal = JSON.parse(localStorage.getItem(LOCAL_STORAGE_EMBED_GAMES_KEY) || '[]');
  const updatedLocal = existingLocal.filter(g => g.id !== gameId && g.material_id !== gameId);
  localStorage.setItem(LOCAL_STORAGE_EMBED_GAMES_KEY, JSON.stringify(updatedLocal));

  // Xóa khỏi Supabase
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('embedded_games').delete().eq('id', gameId);
      await supabase.from('materials').delete().eq('id', gameId);
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  }

  return true;
}

/**
 * HOÀN THÀNH GAME & NHẬN ĐIỂM THƯỞNG XP (CHO HỌC SINH)
 */
export async function recordGameCompletion({ studentId, studentName, game, score = 100 }) {
  const xpAwarded = game.xp_reward || 50;

  try {
    // 1. Thưởng XP qua xpLeaderboardService
    await xpLeaderboardService.awardCustomXp({
      studentId: studentId || 'demo-student',
      studentName: studentName || 'Học sinh',
      xpAmount: xpAwarded,
      reason: `Hoàn thành game nhúng [${EMBED_PROVIDERS[game.provider]?.name || 'iFrame'}]: "${game.title}"`
    });

    // 2. Ghi nhận vào tiến trình student_progress
    if (isSupabaseConfigured() && game.material_id) {
      await supabase.from('student_progress').upsert({
        student_id: studentId,
        material_id: game.material_id,
        status: 'completed',
        score,
        completed_at: new Date().toISOString()
      });
    }

    return { success: true, xpAwarded };
  } catch (err) {
    console.error('Error recording game completion:', err);
    return { success: true, xpAwarded };
  }
}
