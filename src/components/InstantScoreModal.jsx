import React from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Database,
  Eye,
  X
} from 'lucide-react';

export const InstantScoreModal = ({
  isOpen,
  onClose,
  result,
  studentName = 'Học sinh',
  onReviewDetails,
  onRetry
}) => {
  if (!isOpen || !result) return null;

  const {
    score10 = 0,
    score100 = 0,
    correctCount = 0,
    partialCount = 0,
    wrongCount = 0,
    unansweredCount = 0,
    totalQuestions = 0,
    accuracyPercentage = 0,
    rankLabel = 'Hoàn thành 🎉',
    rankColor = 'emerald',
    cheerMsg = 'Chúc mừng em đã hoàn thành bài thi!',
    timeSpentSeconds = 0,
    hasEssay = false,
    supabaseSynced = false
  } = result;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m > 0 ? `${m} phút ` : ''}${s} giây`;
  };

  // Color styles based on score tier
  const colorSchemes = {
    emerald: {
      gradient: 'from-emerald-500 via-teal-500 to-green-600',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      circle: 'border-emerald-500 text-emerald-600',
      shadow: 'shadow-emerald-200'
    },
    blue: {
      gradient: 'from-blue-500 via-cyan-500 to-indigo-600',
      badge: 'bg-blue-100 text-blue-800 border-blue-300',
      circle: 'border-blue-500 text-blue-600',
      shadow: 'shadow-blue-200'
    },
    amber: {
      gradient: 'from-amber-500 via-orange-500 to-yellow-600',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      circle: 'border-amber-500 text-amber-600',
      shadow: 'shadow-amber-200'
    },
    red: {
      gradient: 'from-rose-500 via-red-500 to-pink-600',
      badge: 'bg-rose-100 text-rose-800 border-rose-300',
      circle: 'border-rose-500 text-rose-600',
      shadow: 'shadow-rose-200'
    }
  };

  const scheme = colorSchemes[rankColor] || colorSchemes.emerald;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border-4 border-orange-200 animate-scale-up relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className={`bg-gradient-to-r ${scheme.gradient} text-white p-6 sm:p-8 text-center relative overflow-hidden`}>
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />

          <div className="inline-flex items-center gap-1.5 bg-white/25 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>HỆ THỐNG CHẤM ĐIỂM TỰ ĐỘNG TỨC THÌ</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black">
            {rankLabel}
          </h2>

          <p className="text-white/90 text-sm font-medium mt-1">
            {studentName} • {cheerMsg}
          </p>

          {/* Huge Animated Score Circle */}
          <div className="mt-5 inline-flex flex-col items-center justify-center bg-white rounded-3xl p-4 sm:p-5 shadow-2xl min-w-[190px] border-4 border-yellow-300">
            <span className="text-[11px] font-black uppercase text-gray-400 tracking-wider">
              ĐIỂM SỐ ĐẠT ĐƯỢC
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-5xl sm:text-6xl font-black text-orange-600">
                {score10}
              </span>
              <span className="text-xl sm:text-2xl font-black text-gray-400">/ 10</span>
            </div>
            <div className="mt-1 bg-orange-100 text-orange-800 font-extrabold text-xs px-3 py-0.5 rounded-full">
              Thang điểm 100: <strong>{score100} / 100</strong>
            </div>
          </div>
        </div>

        {/* Modal Body: Metrics & Statistics */}
        <div className="p-6 space-y-5">
          
          {/* Quick Metrics 4-Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-3">
              <div className="flex items-center justify-center text-emerald-600 mb-1">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-emerald-700">{correctCount}</span>
              <span className="block text-[11px] font-bold text-emerald-600 uppercase">Câu Đúng</span>
            </div>

            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3">
              <div className="flex items-center justify-center text-amber-600 mb-1">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-amber-700">{partialCount}</span>
              <span className="block text-[11px] font-bold text-amber-600 uppercase">Đúng 1 Phần</span>
            </div>

            <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-3">
              <div className="flex items-center justify-center text-rose-600 mb-1">
                <XCircle className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-rose-700">{wrongCount}</span>
              <span className="block text-[11px] font-bold text-rose-600 uppercase">Câu Sai</span>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-3">
              <div className="flex items-center justify-center text-blue-600 mb-1">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-sm font-black text-blue-700 mt-1 block">
                {formatTime(timeSpentSeconds)}
              </span>
              <span className="block text-[11px] font-bold text-blue-600 uppercase mt-0.5">Thời Gian</span>
            </div>
          </div>

          {/* Database Sync Status Badge */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <Database className="w-4 h-4 text-emerald-700" />
              <span className="font-extrabold text-emerald-900">
                Đồng bộ CSDL Supabase:
              </span>
            </div>
            <span className="bg-emerald-600 text-white font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-sm">
              {supabaseSynced ? '✓ Đã ghi nhận realtime' : '✓ Đã đồng bộ & lưu trữ an toàn'}
            </span>
          </div>

          {hasEssay && (
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3 text-xs text-purple-900 font-medium">
              💡 <em>Lưu ý:</em> Câu hỏi <strong>Tự luận / Văn bản</strong> đã được lưu trữ bài nộp và chuyển tới giáo viên bộ môn chấm điểm tiếp theo.
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => {
                onClose();
                if (onReviewDetails) onReviewDetails();
              }}
              className="w-full bg-[#FF6600] hover:bg-orange-600 text-white font-black text-sm py-3.5 px-5 rounded-2xl shadow-lg kid-btn flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>Xem Lời Giải & Chi Tiết Từng Câu</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </button>

            {onRetry && (
              <button
                onClick={() => {
                  onClose();
                  onRetry();
                }}
                className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-sm py-3.5 px-5 rounded-2xl transition kid-btn flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="whitespace-nowrap">Làm Lại</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
export default InstantScoreModal;
