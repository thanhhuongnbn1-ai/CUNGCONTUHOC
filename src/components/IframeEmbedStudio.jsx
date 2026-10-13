import React, { useState, useEffect } from 'react';
import {
  EMBED_PROVIDERS,
  CURATED_EMBED_GAMES,
  detectEmbedProvider,
  convertToEmbedUrl,
  getStoredEmbeddedGames,
  saveEmbeddedGameToDB,
  deleteEmbeddedGame
} from '../lib/embedGameService';
import {
  ExternalLink,
  Sparkles,
  Gamepad2,
  CheckCircle2,
  Trash2,
  Play,
  Maximize2,
  RefreshCw,
  HelpCircle,
  Eye,
  PlusCircle,
  Layers,
  Award,
  Clock,
  BookOpen,
  X
} from 'lucide-react';
import { IframeGamePlayer } from './IframeGamePlayer';

export const IframeEmbedStudio = ({ userProfile, onSaved = null }) => {
  // Active Provider Selection
  const [activeProvider, setActiveProvider] = useState('wordwall');

  // Form State
  const [rawInputUrl, setRawInputUrl] = useState('');
  const [embedTitle, setEmbedTitle] = useState('');
  const [embedDescription, setEmbedDescription] = useState('');
  const [gradeSlug, setGradeSlug] = useState('lop-1');
  const [subject, setSubject] = useState('Toán học');
  const [xpReward, setXpReward] = useState(50);
  const [durationMinutes, setDurationMinutes] = useState(10);

  // Preview & Processing State
  const [previewUrl, setPreviewUrl] = useState('');
  const [detectedProvider, setDetectedProvider] = useState('wordwall');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Stored Games List
  const [storedGames, setStoredGames] = useState([]);
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterProvider, setFilterProvider] = useState('all');
  const [selectedGameForPlay, setSelectedGameForPlay] = useState(null);

  useEffect(() => {
    loadStoredGames();
  }, []);

  // Khi người dùng nhập URL hoặc mã nhúng iFrame
  useEffect(() => {
    if (rawInputUrl.trim()) {
      const detected = detectEmbedProvider(rawInputUrl);
      setDetectedProvider(detected);
      const converted = convertToEmbedUrl(rawInputUrl);
      setPreviewUrl(converted);
    } else {
      setPreviewUrl('');
    }
  }, [rawInputUrl]);

  const loadStoredGames = async () => {
    const list = await getStoredEmbeddedGames();
    setStoredGames(list);
  };

  // Nạp bài học mẫu 1-click
  const handleLoadSample = (sample) => {
    setActiveProvider(sample.provider);
    setDetectedProvider(sample.provider);
    setRawInputUrl(sample.original_url || sample.embed_url);
    setEmbedTitle(sample.title);
    setEmbedDescription(sample.description);
    setGradeSlug(sample.grade_slug || 'lop-1');
    setSubject(sample.subject || 'Toán học');
    setXpReward(sample.xp_reward || 50);
    setDurationMinutes(sample.duration_minutes || 10);
    setPreviewUrl(sample.embed_url);
    setSaveSuccess(false);
    setErrorMessage('');
  };

  const handleSaveGame = async (e) => {
    e.preventDefault();
    if (!embedTitle.trim() || !previewUrl) {
      setErrorMessage('Vui lòng nhập đầy đủ tiêu đề và đường dẫn nhúng hợp lệ!');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    setSaveSuccess(false);

    try {
      await saveEmbeddedGameToDB({
        gradeSlug,
        subject,
        title: embedTitle,
        description: embedDescription,
        rawUrlOrHtml: rawInputUrl || previewUrl,
        xpReward,
        durationMinutes,
        userProfile,
        tags: [subject, EMBED_PROVIDERS[detectedProvider]?.name || 'iFrame']
      });

      setSaveSuccess(true);
      await loadStoredGames();
      if (onSaved) onSaved();

      // Reset form một phần
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'Lỗi khi lưu trò chơi vào CSDL!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGame = async (gameId) => {
    if (window.confirm('Thầy/Cô có chắc chắn muốn gỡ trò chơi nhúng này khỏi hệ thống?')) {
      await deleteEmbeddedGame(gameId);
      await loadStoredGames();
    }
  };

  // Lọc danh sách game đã lưu
  const filteredGames = storedGames.filter((g) => {
    const matchGrade = filterGrade === 'all' || g.grade_slug === filterGrade;
    const matchProvider = filterProvider === 'all' || g.provider === filterProvider;
    return matchGrade && matchProvider;
  });

  return (
    <div className="space-y-10 font-sans animate-fade-in">

      {/* Top Banner Tiện Ích */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-7 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="bg-white/20 px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2 inline-block">
            CÔNG CỤ GIÁO VIÊN & ADMIN • W3C IFRAME INTEGRATION
          </span>
          <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
            Nhúng Game & Bài Học Ngoại Bằng 🎮
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm font-medium mt-1 max-w-xl">
            Tự động tích hợp mượt mà các bài tập và trò chơi từ <strong>Wordwall, Quizizz, Kahoot, Canva, Genially, YouTube</strong>. Chuẩn hóa link embed, chống giật lag và đồng bộ tiến độ vào Supabase DB!
          </p>
        </div>

        {/* Nền Tảng Hỗ Trợ Badges */}
        <div className="flex flex-wrap items-center gap-1.5 max-w-sm">
          {Object.entries(EMBED_PROVIDERS).map(([key, p]) => (
            <span
              key={key}
              className="px-2.5 py-1 rounded-xl text-[11px] font-extrabold bg-white/15 backdrop-blur-sm border border-white/20"
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>

      {/* CHỌN NHANH NỀN TẢNG ĐỂ NẠP BÀI HỌC MẪU */}
      <div className="bg-white p-6 rounded-3xl border-2 border-orange-100 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-gray-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Nạp Mẫu Game Đã Kiểm Định 1-Click (Wordwall, Quizizz, Kahoot, Canva, Genially):</span>
          </h3>
          <span className="text-xs text-gray-400 font-bold hidden sm:inline">Nhấp vào để thử ngay</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CURATED_EMBED_GAMES.map((sample) => {
            const providerInfo = EMBED_PROVIDERS[sample.provider] || EMBED_PROVIDERS.custom;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleLoadSample(sample)}
                className="text-left p-3.5 rounded-2xl border-2 border-gray-100 hover:border-orange-400 hover:bg-orange-50/40 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${providerInfo.bgLight}`}
                    >
                      {providerInfo.name}
                    </span>
                    <span className="text-[11px] font-black text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                      +{sample.xp_reward} XP
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-gray-800 group-hover:text-orange-600 transition line-clamp-1">
                    {sample.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">
                    {sample.description}
                  </p>
                </div>
                <div className="mt-2 text-[10px] font-extrabold text-gray-400 flex items-center gap-2">
                  <span>{sample.grade_name}</span>
                  <span>•</span>
                  <span>{sample.subject}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* FORM SOẠN THẢO & TRÌNH XEM TRƯỚC TỨC THÌ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Cột Trái: Form Nhập Liệu */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border-2 border-orange-100 shadow-md space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-gray-800 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-orange-500" />
              <span>Cấu Hình Bài Tập Nhúng</span>
            </h3>
            
            {/* Live Detected Provider Pill */}
            {detectedProvider && (
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                  EMBED_PROVIDERS[detectedProvider]?.bgLight || 'bg-gray-100 text-gray-700'
                }`}
              >
                ✔️ {EMBED_PROVIDERS[detectedProvider]?.name || 'iFrame'}
              </span>
            )}
          </div>

          <form onSubmit={handleSaveGame} className="space-y-4">
            
            {/* Input URL hoặc Đoạn mã iFrame */}
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1">
                Đường Dẫn URL hoặc Đoạn Mã HTML iFrame
              </label>
              <textarea
                rows={3}
                value={rawInputUrl}
                onChange={(e) => setRawInputUrl(e.target.value)}
                placeholder="Dán link Wordwall (resource/embed), Quizizz, Kahoot, Canva (?embed) hoặc thẻ <iframe src='...'></iframe>"
                className="w-full bg-gray-50 border-2 border-gray-200 focus:border-orange-500 rounded-2xl p-3 text-xs font-medium focus:outline-none transition font-mono"
                required
              />
              <p className="text-[11px] text-gray-400 mt-1">
                * Tự động chuẩn hóa link chia sẻ sang Embed URL chuẩn W3C mượt mà.
              </p>
            </div>

            {/* Tiêu đề & Mô tả */}
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1">
                Tiêu Đề Trò Chơi / Bài Học
              </label>
              <input
                type="text"
                value={embedTitle}
                onChange={(e) => setEmbedTitle(e.target.value)}
                placeholder="Ví dụ: Đấu trường ghép từ vựng Tiếng Anh Lớp 2"
                className="w-full bg-gray-50 border-2 border-gray-200 focus:border-orange-500 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-700 mb-1">
                Mô Tả & Hướng Dẫn Nhiệm Vụ Cho Bé
              </label>
              <textarea
                rows={2}
                value={embedDescription}
                onChange={(e) => setEmbedDescription(e.target.value)}
                placeholder="Hướng dẫn học sinh cách chơi và hoàn thành mục tiêu..."
                className="w-full bg-gray-50 border-2 border-gray-200 focus:border-orange-500 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none transition"
              />
            </div>

            {/* Chọn Khối Lớp & Môn Học */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-gray-700 mb-1">Khối Lớp</label>
                <select
                  value={gradeSlug}
                  onChange={(e) => setGradeSlug(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-orange-500"
                >
                  <option value="tien-lop-1">Tiền Lớp 1</option>
                  <option value="lop-1">Lớp 1</option>
                  <option value="lop-2">Lớp 2</option>
                  <option value="lop-3">Lớp 3</option>
                  <option value="lop-4">Lớp 4</option>
                  <option value="lop-5">Lớp 5</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 mb-1">Môn Học</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-orange-500"
                >
                  <option value="Toán học">Toán học 🔢</option>
                  <option value="Tiếng Việt">Tiếng Việt 📖</option>
                  <option value="Tiếng Anh">Tiếng Anh 🔤</option>
                  <option value="Khoa học">Khoa học 🧪</option>
                  <option value="Đạo đức">Đạo đức 💖</option>
                  <option value="Tự nhiên & Xã hội">Tự nhiên & Xã hội 🌿</option>
                </select>
              </div>
            </div>

            {/* Thưởng XP & Thời lượng */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-gray-700 mb-1">
                  Điểm Thưởng XP 🎁
                </label>
                <input
                  type="number"
                  min="10"
                  max="200"
                  step="10"
                  value={xpReward}
                  onChange={(e) => setXpReward(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-2 text-xs font-black text-orange-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 mb-1">
                  Thời Lượng Dự Kiến (Phút)
                </label>
                <input
                  type="number"
                  min="3"
                  max="60"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-2 text-xs font-bold focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Thông báo lỗi / thành công */}
            {errorMessage && (
              <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                ⚠️ {errorMessage}
              </p>
            )}

            {saveSuccess && (
              <p className="text-xs font-black text-emerald-600 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-bounce-slow">
                <CheckCircle2 className="w-4 h-4" />
                <span>Đã lưu & đồng bộ game nhúng vào CSDL Supabase thành công!</span>
              </p>
            )}

            {/* Nút Submit */}
            <button
              type="submit"
              disabled={isSaving || !embedTitle.trim() || !previewUrl}
              className="w-full bg-gradient-to-r from-[#FF6600] to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 text-white font-black text-sm py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 kid-btn transition"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{isSaving ? 'Đang lưu vào CSDL...' : 'Lưu Game Vào Thư Mục Lớp & CSDL'}</span>
            </button>
          </form>
        </div>

        {/* Cột Phải: Trình Xem Trước Trực Tiếp (Live Interactive Preview) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border-2 border-orange-100 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-gray-800 flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-600" />
              <span>Trình Xem Trước Trực Tiếp (Live Preview)</span>
            </h3>

            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1"
              >
                <span>Mở tab mới</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {previewUrl ? (
            <div className="space-y-3">
              <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border-4 border-orange-200 shadow-inner relative">
                <iframe
                  src={previewUrl}
                  title="Live Preview"
                  className="w-full h-full border-0 select-none"
                  allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-2xl text-[11px] text-gray-600 font-medium flex items-center justify-between">
                <span className="truncate max-w-md font-mono">
                  URL Embed: {previewUrl}
                </span>
                <span className="text-emerald-700 font-bold whitespace-nowrap">
                  Khung hình 16:9 Mượt Mà
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full aspect-video rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-6 text-center text-gray-400 space-y-2">
              <Gamepad2 className="w-12 h-12 text-gray-300" />
              <p className="text-xs font-bold text-gray-500">
                Chưa có đường dẫn nhúng hợp lệ
              </p>
              <p className="text-[11px] max-w-xs">
                Hãy dán URL Wordwall, Quizizz, Kahoot, Canva, Genially hoặc nhấp vào một bài học mẫu ở trên để xem trước tại đây.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* KHO QUẢN LÝ TẤT CẢ GAME ĐÃ NHÚNG TRONG HỆ THỐNG */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-orange-100 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-xl text-gray-800 flex items-center gap-2">
              <Layers className="w-6 h-6 text-purple-600" />
              <span>Kho Trò Chơi & Bài Học iFrame Đã Nhúng ({filteredGames.length})</span>
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Toàn bộ bài tập nhúng được đồng bộ trên CSDL Supabase và tự động hiển thị trong Thư Mục Lớp của học sinh.
            </p>
          </div>

          {/* Bộ lọc Khối Lớp & Nền Tảng */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold"
            >
              <option value="all">Tất cả Khối Lớp</option>
              <option value="tien-lop-1">Tiền Lớp 1</option>
              <option value="lop-1">Lớp 1</option>
              <option value="lop-2">Lớp 2</option>
              <option value="lop-3">Lớp 3</option>
              <option value="lop-4">Lớp 4</option>
              <option value="lop-5">Lớp 5</option>
            </select>

            <select
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold"
            >
              <option value="all">Tất cả Nền Tảng</option>
              <option value="wordwall">Wordwall</option>
              <option value="quizizz">Quizizz</option>
              <option value="kahoot">Kahoot!</option>
              <option value="canva">Canva</option>
              <option value="genially">Genially</option>
              <option value="youtube">YouTube</option>
            </select>
          </div>
        </div>

        {/* Danh sách Cards */}
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGames.map((game) => {
              const prov = EMBED_PROVIDERS[game.provider] || EMBED_PROVIDERS.custom;
              return (
                <div
                  key={game.id}
                  className="bg-gray-50 rounded-2xl border-2 border-gray-200 p-5 flex flex-col justify-between hover:border-orange-400 hover:shadow-md transition space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${prov.bgLight}`}>
                        {prov.name}
                      </span>
                      <span className="text-xs font-black text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded-full">
                        +{game.xp_reward || 50} XP
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-gray-800 line-clamp-2">
                      {game.title}
                    </h4>

                    <p className="text-xs text-gray-500 line-clamp-2">
                      {game.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-400">
                      {game.grade_slug?.toUpperCase()} • {game.subject}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedGameForPlay(game)}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1 kid-btn"
                        title="Chơi thử ngay trong popup"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Chơi thử</span>
                      </button>

                      <button
                        onClick={() => handleDeleteGame(game.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                        title="Gỡ game này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400 font-bold text-xs">
            Chưa có trò chơi nhúng nào khớp với bộ lọc. Hãy thêm trò chơi mới ở trên!
          </div>
        )}
      </div>

      {/* POPUP MODAL CHƠI THỬ TRÒ CHƠI NHÚNG (QUICK TEST PLAYER) */}
      {selectedGameForPlay && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-5xl w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-lg font-black text-gray-800">
                🎮 Trải Nghiệm Thử: {selectedGameForPlay.title}
              </h3>
              <button
                onClick={() => setSelectedGameForPlay(null)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <IframeGamePlayer
              material={selectedGameForPlay}
              studentId={userProfile?.id || 'demo-teacher'}
              studentName={userProfile?.full_name || 'Thầy/Cô Giáo'}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default IframeEmbedStudio;
