import React, { useState, useEffect } from 'react';
import { DAYS_OF_WEEK, POPULAR_SUBJECTS, createSchedule, updateSchedule } from '../lib/scheduleService';
import { X, Clock, Calendar, BookOpen, Bell, Check, Sparkles, AlertCircle } from 'lucide-react';

export const ScheduleFormModal = ({ isOpen, onClose, onSaved, editingSchedule, classList = [], defaultClassId = 'default' }) => {
  const [classId, setClassId] = useState(defaultClassId);
  const [subjectName, setSubjectName] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState(2);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('08:45');
  const [reminderMinutes, setReminderMinutes] = useState(30);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingSchedule) {
      setClassId(editingSchedule.class_id || defaultClassId);
      setSubjectName(editingSchedule.subject_name || '');
      setDayOfWeek(editingSchedule.day_of_week || 2);
      setStartTime(editingSchedule.start_time || '08:00');
      setEndTime(editingSchedule.end_time || '08:45');
      setReminderMinutes(editingSchedule.reminder_minutes ?? 30);
      setIsActive(editingSchedule.is_active ?? true);
    } else {
      setClassId(defaultClassId);
      setSubjectName('');
      setDayOfWeek(2);
      setStartTime('08:00');
      setEndTime('08:45');
      setReminderMinutes(30);
      setIsActive(true);
    }
    setErrorMsg('');
  }, [editingSchedule, isOpen, defaultClassId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subjectName.trim()) {
      setErrorMsg('Vui lòng nhập tên môn học!');
      return;
    }

    if (startTime >= endTime) {
      setErrorMsg('Giờ bắt đầu phải trước giờ kết thúc!');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const scheduleData = {
      class_id: classId,
      subject_name: subjectName.trim(),
      day_of_week: Number(dayOfWeek),
      start_time: startTime,
      end_time: endTime,
      reminder_minutes: Number(reminderMinutes),
      is_active: isActive
    };

    let res;
    if (editingSchedule) {
      res = await updateSchedule(editingSchedule.id, scheduleData);
    } else {
      res = await createSchedule(scheduleData);
    }

    setLoading(false);
    if (res.success) {
      onSaved(res.data);
      onClose();
    } else {
      setErrorMsg('Không thể lưu lịch học. Vui lòng thử lại!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full border-4 border-orange-300 shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FF6600] to-amber-500 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 rounded-full p-1 transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <span className="text-3xl">📅</span>
          <h3 className="text-2xl font-black mt-1">
            {editingSchedule ? 'Chỉnh Sửa Lịch Học' : 'Thêm Tiết Học Mới'}
          </h3>
          <p className="text-orange-100 text-xs font-bold mt-1">
            Lịch được cấu hình sẽ cố định lặp lại hàng tuần và tự động gửi nhắc lịch!
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl text-center flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Chọn Lớp Học */}
          {classList.length > 0 && (
            <div>
              <label className="block text-xs font-extrabold text-gray-700 mb-1">Áp dụng cho Lớp</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-orange-500"
              >
                {classList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.grade_level})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tên Môn Học */}
          <div>
            <label className="block text-xs font-extrabold text-gray-700 mb-1">Tên Môn Học</label>
            <input
              type="text"
              required
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="VD: Toán học, Tiếng Việt, Tiếng Anh..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-orange-500"
            />
            {/* Quick Suggestions Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {POPULAR_SUBJECTS.slice(0, 5).map((subj) => (
                <button
                  type="button"
                  key={subj}
                  onClick={() => setSubjectName(subj)}
                  className="bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-[11px] font-bold px-2 py-0.5 rounded-lg transition"
                >
                  {subj}
                </button>
              ))}
            </div>
          </div>

          {/* Chọn Ngày trong tuần */}
          <div>
            <label className="block text-xs font-extrabold text-gray-700 mb-1">Chọn Ngày Học Trong Tuần</label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-black text-gray-800 focus:outline-none focus:border-orange-500"
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Giờ Bắt Đầu & Giờ Kết Thúc */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-gray-700 mb-1">Giờ Bắt Đầu</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-700 mb-1">Giờ Kết Thúc</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Cấu hình Nhắc lịch tự động */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-extrabold text-gray-700 mb-1">Nhắc Trước Giờ Học</label>
              <select
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-orange-500"
              >
                <option value={15}>15 phút</option>
                <option value={30}>30 phút (Mặc định)</option>
                <option value={45}>45 phút</option>
                <option value={60}>60 phút (1 tiếng)</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-gray-700">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500 cursor-pointer"
                />
                <span>Kích hoạt nhắc lịch</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF6600] hover:bg-orange-600 disabled:opacity-50 text-white font-black text-base py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 kid-btn mt-4"
          >
            <Check className="w-5 h-5" />
            <span>{loading ? 'Đang lưu...' : (editingSchedule ? 'Cập Nhật Lịch Học' : 'Lưu Lịch Học Mới')}</span>
          </button>

        </form>

      </div>
    </div>
  );
};

export default ScheduleFormModal;
