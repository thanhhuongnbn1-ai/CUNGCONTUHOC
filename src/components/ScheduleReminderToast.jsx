import React, { useState, useEffect } from 'react';
import { Bell, X, Sparkles, Clock, Volume2 } from 'lucide-react';
import { getOngoingAndUpcoming } from '../lib/scheduleService';

export const ScheduleReminderToast = ({ schedules = [] }) => {
  const [activeAlert, setActiveAlert] = useState(null);
  const [dismissedId, setDismissedId] = useState(null);

  useEffect(() => {
    const checkUpcoming = () => {
      if (!schedules || schedules.length === 0) return;
      const { upcoming, ongoing } = getOngoingAndUpcoming(schedules);

      if (upcoming && upcoming.id !== dismissedId) {
        setActiveAlert({
          type: 'upcoming',
          schedule: upcoming,
          message: `Sắp đến giờ học môn ${upcoming.subject_name}, lớp bắt đầu lúc ${upcoming.start_time}. Hãy chuẩn bị nhé!`
        });
      } else if (ongoing && ongoing.id !== dismissedId && !activeAlert) {
        setActiveAlert({
          type: 'ongoing',
          schedule: ongoing,
          message: `Môn ${ongoing.subject_name} đang diễn ra ngay bây giờ (${ongoing.start_time} - ${ongoing.end_time})!`
        });
      }
    };

    checkUpcoming();
    const timer = setInterval(checkUpcoming, 30000); // Check every 30s
    return () => clearInterval(timer);
  }, [schedules, dismissedId]);

  const speakNotification = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  if (!activeAlert) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-md w-[90vw] bg-white rounded-3xl border-4 border-amber-400 shadow-2xl p-4 animate-bounce-slow overflow-hidden">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center flex-shrink-0 font-black shadow-inner">
          <Bell className="w-6 h-6 animate-pulse" />
        </div>

        <div className="flex-1 pr-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-700 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>{activeAlert.type === 'ongoing' ? 'TIẾT HỌC ĐANG DIỄN RA' : 'NHẮC LỊCH HỌC TỰ ĐỘNG'}</span>
          </div>

          <h4 className="font-black text-sm text-gray-800 leading-tight">
            {activeAlert.schedule.subject_name} ({activeAlert.schedule.start_time} - {activeAlert.schedule.end_time})
          </h4>

          <p className="text-xs text-gray-600 font-medium mt-1 leading-relaxed">
            {activeAlert.message}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => speakNotification(activeAlert.message)}
              className="text-[11px] bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 transition"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Nghe nhắc</span>
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            setDismissedId(activeAlert.schedule.id);
            setActiveAlert(null);
          }}
          className="text-gray-400 hover:text-gray-700 p-1 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ScheduleReminderToast;
