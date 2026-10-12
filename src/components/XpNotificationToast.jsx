import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, X } from 'lucide-react';

export const XpNotificationToast = () => {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const handleXpAwarded = (e) => {
      const data = e.detail;
      setNotification({
        id: Date.now(),
        xpAmount: data.xpAmount || 50,
        activityTitle: data.activityTitle || 'Hoạt động học tập',
        studentName: data.studentName || 'Học sinh',
        isTeacherBonus: Boolean(data.isTeacherBonus),
        teacherName: data.teacherName,
        reason: data.reason,
        note: data.note
      });

      // Tự động ẩn sau 4 giây
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4500);

      return () => clearTimeout(timer);
    };

    window.addEventListener('edtech_xp_awarded', handleXpAwarded);
    return () => window.removeEventListener('edtech_xp_awarded', handleXpAwarded);
  }, []);

  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div
        className={`text-white p-4 rounded-3xl shadow-2xl border-2 border-white flex items-center gap-3 max-w-sm ${
          notification.isTeacherBonus
            ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500 ring-4 ring-yellow-300/60'
            : 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500'
        }`}
      >
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl shadow-inner">
          {notification.isTeacherBonus ? '🎁' : '🌟'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="bg-white/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
              {notification.isTeacherBonus ? '🎓 LỜI KHEN THẦY CÔ' : 'BẢNG XẾP HẠNG XP'}
            </span>
            <span className="text-yellow-200 text-xs font-black">
              +{notification.xpAmount} XP
            </span>
          </div>
          <p className="text-xs font-black text-white truncate mt-0.5">
            {notification.studentName} đã nhận được {notification.xpAmount} XP!
          </p>
          <p className="text-[10px] text-white/90 truncate font-semibold">
            {notification.isTeacherBonus && notification.teacherName
              ? `${notification.teacherName} khen: "${notification.reason || notification.activityTitle}"`
              : notification.activityTitle}
          </p>
        </div>
        <button
          onClick={() => setNotification(null)}
          className="p-1 rounded-full hover:bg-white/20 text-white transition flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default XpNotificationToast;
