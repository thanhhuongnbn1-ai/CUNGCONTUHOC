import React from 'react';
import { PlayCircle, Gamepad2, BookOpen, HelpCircle, ExternalLink, Sparkles, CheckCircle2, Clock } from 'lucide-react';

export const MaterialCard = ({ material, progress, onSelect }) => {
  const getTypeBadge = (type) => {
    switch (type) {
      case 'quiz':
        return { label: 'Bài Trắc Nghiệm', bg: 'bg-purple-100 text-purple-700 border-purple-200', icon: HelpCircle };
      case 'story':
        return { label: 'Truyện Cổ Tích AI', bg: 'bg-amber-100 text-amber-700 border-amber-200', icon: BookOpen };
      case 'game':
        return { label: 'Game Đấu Trường', bg: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Gamepad2 };
      case 'iframe_embed':
        return { label: 'Trò Chơi Nhúng (iFrame)', bg: 'bg-blue-100 text-blue-700 border-blue-200', icon: ExternalLink };
      default:
        return { label: 'Bài Giảng Tương Tác', bg: 'bg-orange-100 text-orange-700 border-orange-200', icon: Sparkles };
    }
  };

  const badgeInfo = getTypeBadge(material.content_type);
  const IconComponent = badgeInfo.icon;

  const isCompleted = progress?.status === 'completed';
  const isInProgress = progress?.status === 'in_progress';

  return (
    <div className="bg-white rounded-3xl border-2 border-orange-100 shadow-md hover:shadow-xl transition transform hover:-translate-y-1 flex flex-col justify-between overflow-hidden group">
      
      {/* Card Header & Badges */}
      <div className="p-5 flex-1">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`text-xs font-black px-3 py-1 rounded-full border flex items-center gap-1.5 ${badgeInfo.bg}`}>
            <IconComponent className="w-3.5 h-3.5" />
            {badgeInfo.label}
          </span>

          <span className="text-xs font-extrabold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
            {material.subject || 'Toán học'}
          </span>
        </div>

        <h3 className="font-extrabold text-lg text-gray-800 group-hover:text-[#FF6600] transition line-clamp-2 mb-2">
          {material.title}
        </h3>

        <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">
          {material.description || 'Bài học tương tác được tối ưu cho học sinh tiểu học.'}
        </p>
      </div>

      {/* Progress Footer Bar */}
      <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs font-bold">
          {isCompleted ? (
            <span className="text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Hoàn thành ({progress?.score || 100} điểm)
            </span>
          ) : isInProgress ? (
            <span className="text-amber-600 flex items-center gap-1">
              <Clock className="w-4 h-4" /> Đang học
            </span>
          ) : (
            <span className="text-gray-400">Chưa bắt đầu</span>
          )}
        </div>

        <button
          onClick={() => onSelect(material)}
          className="bg-[#FF6600] hover:bg-orange-600 text-white text-xs font-black px-4 py-2 rounded-xl shadow flex items-center gap-1.5 kid-btn"
        >
          <span>Học ngay</span>
          <PlayCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MaterialCard;
