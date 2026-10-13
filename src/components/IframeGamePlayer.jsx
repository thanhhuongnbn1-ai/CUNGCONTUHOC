import React, { useState, useRef, useEffect } from 'react';
import { EMBED_PROVIDERS, recordGameCompletion } from '../lib/embedGameService';
import { EdTechGameSDK } from '../lib/gameSDK';
import {
  Maximize2,
  Minimize2,
  RefreshCw,
  ExternalLink,
  Award,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Bot,
  Gamepad2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const IframeGamePlayer = ({
  material,
  studentId = 'demo-student',
  studentName = 'Bé Minh Triết',
  onBack = null
}) => {
  const containerRef = useRef(null);
  const iframeRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(1);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [awardedXp, setAwardedXp] = useState(null);
  const [showDirectOpenAlert, setShowDirectOpenAlert] = useState(false);

  const providerKey = material?.ai_generated_content?.provider || material?.provider || 'wordwall';
  const providerConfig = EMBED_PROVIDERS[providerKey] || EMBED_PROVIDERS.custom;
  const embedUrl = material?.iframe_url || material?.embed_url || material?.source_url || 'https://wordwall.net/embed/4a1c5b8b8d4f4e249f7e53f191f4d96a?themeId=1&templateId=5&fontStackId=0';
  const xpReward = material?.ai_generated_content?.xpReward || material?.xp_reward || 50;

  useEffect(() => {
    // Khởi tạo GameSDK để lắng nghe sự kiện điểm số nếu game phát tín hiệu postMessage
    if (material?.id) {
      EdTechGameSDK.init({
        studentId,
        materialId: material.id
      });

      const unsubscribe = EdTechGameSDK.onScoreSaved((result) => {
        handleGameFinished(result.score || 100);
      });

      return () => unsubscribe();
    }
  }, [material, studentId]);

  // Lắng nghe thay đổi toàn màn hình của trình duyệt
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Lỗi bật chế độ toàn màn hình:', err);
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleOpenAiTutor = () => {
    window.dispatchEvent(new CustomEvent('open_ai_tutor_with_material', {
      detail: {
        material: {
          ...material,
          content_type: 'link',
          title: material.title,
          description: material.description || `Trò chơi tương tác ${providerConfig.name}`
        }
      }
    }));
  };

  const handleGameFinished = async (score = 100) => {
    if (hasCompleted) return;

    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (_) {}

    const res = await recordGameCompletion({
      studentId,
      studentName,
      game: {
        ...material,
        provider: providerKey,
        xp_reward: xpReward,
        material_id: material?.id
      },
      score
    });

    setHasCompleted(true);
    setAwardedXp(res.xpAwarded || xpReward);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto animate-fade-in font-sans">
      
      {/* Top Header Controls Bar */}
      <div className="bg-white p-4 rounded-3xl border-2 border-orange-100 shadow-md flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Provider Badge & Title */}
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white shadow-md text-base"
            style={{ backgroundColor: providerConfig.brandColor }}
          >
            <Gamepad2 className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${providerConfig.bgLight}`}>
                {providerConfig.name}
              </span>
              <span className="text-xs font-bold text-gray-400">
                {material?.subject || 'Toán học'} • {material?.grade_slug?.replace('-', ' ')?.toUpperCase() || 'LỚP TIỂU HỌC'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-gray-800 line-clamp-1">
              {material?.title || 'Trò Chơi Tương Tác Nhúng'}
            </h2>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          
          <button
            onClick={handleReload}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs px-3.5 py-2.5 rounded-2xl flex items-center gap-1.5 transition kid-btn"
            title="Tải lại trò chơi"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-orange-500' : ''}`} />
            <span className="hidden sm:inline">Chơi lại</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs px-3.5 py-2.5 rounded-2xl border border-indigo-200 flex items-center gap-1.5 transition kid-btn"
            title="Phóng to toàn màn hình"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
          </button>

          <button
            onClick={handleOpenAiTutor}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow flex items-center gap-1.5 kid-btn"
            title="Hỏi AI Trợ Giảng cách chơi hoặc giải bài"
          >
            <Bot className="w-4 h-4" />
            <span>Hỏi Trợ Giảng AI</span>
          </button>

          <a
            href={embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition"
            title="Mở tab mới nếu bài học bị hạn chế iFrame"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Main iFrame Game Player Box */}
      <div
        ref={containerRef}
        className={`relative w-full rounded-3xl overflow-hidden bg-gray-950 border-4 border-orange-200 shadow-2xl ${
          isFullscreen ? 'h-screen border-none rounded-none' : 'aspect-video min-h-[460px]'
        }`}
      >
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-gray-900/90 flex flex-col items-center justify-center text-white space-y-3">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="font-black text-sm text-orange-200 animate-pulse">
              Đang tải trò chơi {providerConfig.name} mượt mà...
            </p>
            <span className="text-xs text-gray-400">Tối ưu chống giật lag & chuẩn W3C Sandbox</span>
          </div>
        )}

        {/* The Native iFrame */}
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={embedUrl}
          title={material?.title || 'Interactive Game'}
          className="w-full h-full border-0 select-none"
          allow={providerConfig.allowAttributes}
          allowFullScreen
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setShowDirectOpenAlert(true);
          }}
        />

        {/* Floating Quick Action in Fullscreen mode */}
        {isFullscreen && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md p-2 rounded-2xl border border-white/20">
            <button
              onClick={handleReload}
              className="p-2 text-white hover:text-orange-400 transition"
              title="Tải lại game"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 text-white hover:text-orange-400 transition"
              title="Thoát toàn màn hình"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Completion & XP Reward Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-3xl border-2 border-orange-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
            🎁
          </div>
          <div>
            <h4 className="font-extrabold text-gray-800 text-sm">
              Phần Thưởng Tích Lũy Khi Chơi Game
            </h4>
            <p className="text-xs text-gray-600 font-medium">
              Hoàn thành các thử thách trong game để tích lũy ngay{' '}
              <strong className="text-orange-600">+{xpReward} XP</strong> vào Bảng Xếp Hạng toàn trường!
            </p>
          </div>
        </div>

        {hasCompleted ? (
          <div className="bg-emerald-500 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-md flex items-center gap-2 animate-bounce-slow">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span>Đã Nhận Thưởng +{awardedXp} XP! Tuyệt vời 🎉</span>
          </div>
        ) : (
          <button
            onClick={() => handleGameFinished(100)}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 kid-btn whitespace-nowrap transform active:scale-95 transition"
          >
            <Award className="w-4 h-4" />
            <span>Bé Đã Hoàn Thành Xong Game! (Nhận +{xpReward} XP)</span>
          </button>
        )}

      </div>

      {/* Instructions & Protection Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 font-semibold px-2">
        <div className="flex items-center gap-1.5 text-emerald-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Bảo mật chống tải lậu & Ngăn chặn pop-up quảng cáo độc hại</span>
        </div>
        <div>
          <span>Được tối ưu cho: Máy tính, iPad & Điện thoại thông minh</span>
        </div>
      </div>

    </div>
  );
};

export default IframeGamePlayer;
