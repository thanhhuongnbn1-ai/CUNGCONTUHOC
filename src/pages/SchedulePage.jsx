import React, { useState, useEffect } from 'react';
import {
  DAYS_OF_WEEK,
  fetchClassSchedules,
  deleteSchedule,
  updateSchedule,
  getSubjectTheme,
  getOngoingAndUpcoming
} from '../lib/scheduleService';
import { getStoredClasses } from '../lib/classService';
import ScheduleFormModal from '../components/ScheduleFormModal';
import ScheduleReminderToast from '../components/ScheduleReminderToast';
import {
  Calendar,
  Clock,
  PlusCircle,
  Edit2,
  Trash2,
  Bell,
  BellOff,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Users,
  AlertCircle,
  Eye,
  Volume2
} from 'lucide-react';

export const SchedulePage = ({ userProfile }) => {
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('default');
  const [selectedDayTab, setSelectedDayTab] = useState(2); // For Student view
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [loading, setLoading] = useState(false);

  const isTeacherOrAdmin = userProfile?.role === 'teacher' || userProfile?.role === 'admin';

  useEffect(() => {
    const classList = getStoredClasses();
    setClasses(classList);
    if (classList.length > 0) {
      setSelectedClassId(classList[0].id);
    }
    // Set active day tab to today's day of week
    const jsDay = new Date().getDay();
    const todayNum = jsDay === 0 ? 8 : jsDay + 1;
    setSelectedDayTab(todayNum);
  }, []);

  useEffect(() => {
    loadSchedules();
  }, [selectedClassId]);

  const loadSchedules = async () => {
    setLoading(true);
    const data = await fetchClassSchedules(selectedClassId);
    setSchedules(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tiết học này khỏi thời khóa biểu?')) {
      await deleteSchedule(id);
      loadSchedules();
    }
  };

  const handleToggleActive = async (schedule) => {
    await updateSchedule(schedule.id, { is_active: !schedule.is_active });
    loadSchedules();
  };

  const handleOpenAdd = () => {
    setEditingSchedule(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sch) => {
    setEditingSchedule(sch);
    setIsModalOpen(true);
  };

  // Tính toán môn học đang diễn ra hôm nay
  const { currentDayOfWeek, todaySchedules, ongoing, upcoming } = getOngoingAndUpcoming(schedules);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 font-sans">
      
      {/* Background Audio / In-app alert notification toast */}
      <ScheduleReminderToast schedules={schedules} />

      {/* Add / Edit Schedule Modal */}
      <ScheduleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={loadSchedules}
        editingSchedule={editingSchedule}
        classList={classes}
        defaultClassId={selectedClassId}
      />

      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#FF6600] via-amber-500 to-yellow-500 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 inline-block">
            {isTeacherOrAdmin ? 'QUẢN TRỊ VIÊN & GIÁO VIÊN' : 'HỌC SINH & PHỤ HUYNH'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-2">
            Thời Khóa Biểu & Nhắc Lịch Tự Động 📅
          </h1>
          <p className="text-orange-100 font-medium text-sm mt-1 max-w-xl">
            {isTeacherOrAdmin
              ? 'Tạo mới, chỉnh sửa, xóa tiết học và cấu hình gửi thông báo nhắc lịch tự động trước 15 - 30 phút.'
              : 'Thời khóa biểu thông minh tự động tô sáng môn học đang diễn ra trong ngày và nhắc nhở vào lớp!'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Class Selector Dropdown */}
          <div className="bg-white/20 p-1.5 rounded-2xl flex items-center gap-2 border border-white/30">
            <span className="text-xs font-bold text-white px-2">Lớp:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-white text-gray-800 rounded-xl px-3 py-1.5 text-xs font-black outline-none shadow-sm cursor-pointer"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.grade_level})
                </option>
              ))}
              <option value="default">Lớp 1A Mẫu</option>
            </select>
          </div>

          {/* Teacher Add Schedule Button (RBAC: Only Teacher & Admin) */}
          {isTeacherOrAdmin && (
            <button
              onClick={handleOpenAdd}
              className="bg-white text-[#FF6600] hover:bg-orange-50 font-black text-sm px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 kid-btn whitespace-nowrap"
            >
              <PlusCircle className="w-5 h-5 text-[#FF6600]" />
              <span>Thêm Lịch Học</span>
            </button>
          )}
        </div>
      </div>

      {/* Ongoing / Today Live Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Môn đang diễn ra Card */}
        <div className={`p-6 rounded-3xl border-2 shadow-md flex items-center gap-4 ${
          ongoing ? 'bg-emerald-50 border-emerald-300 animate-pulse-subtle' : 'bg-white border-gray-100'
        }`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black ${
            ongoing ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
          }`}>
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-gray-400 uppercase">TIẾT HỌC HIỆN TẠI</span>
            {ongoing ? (
              <>
                <h3 className="text-xl font-black text-emerald-800">{ongoing.subject_name}</h3>
                <span className="text-xs font-bold text-emerald-600">
                  {ongoing.start_time} - {ongoing.end_time} (Đang diễn ra)
                </span>
              </>
            ) : (
              <p className="text-sm font-bold text-gray-500">Hiện không có tiết học nào</p>
            )}
          </div>
        </div>

        {/* Tiết sắp bắt đầu Card */}
        <div className={`p-6 rounded-3xl border-2 shadow-md flex items-center gap-4 ${
          upcoming ? 'bg-amber-50 border-amber-300' : 'bg-white border-gray-100'
        }`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black ${
            upcoming ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400'
          }`}>
            <Bell className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-gray-400 uppercase">SẮP DIỄN RA TRONG 30 PHÚT</span>
            {upcoming ? (
              <>
                <h3 className="text-xl font-black text-amber-800">{upcoming.subject_name}</h3>
                <span className="text-xs font-bold text-amber-600">
                  Bắt đầu lúc {upcoming.start_time} (Nhắc tự động)
                </span>
              </>
            ) : (
              <p className="text-sm font-bold text-gray-500">Chưa có tiết sắp tới gần</p>
            )}
          </div>
        </div>

        {/* Tổng số tiết học trong tuần */}
        <div className="bg-white p-6 rounded-3xl border-2 border-orange-100 shadow-md flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center font-black">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-gray-400 uppercase">TỔNG TIẾT TRONG TUẦN</span>
            <h3 className="text-2xl font-black text-gray-800">{schedules.length} tiết học</h3>
            <span className="text-xs font-bold text-orange-600">Lặp lại cố định hàng tuần</span>
          </div>
        </div>

      </div>

      {/* VIEW SELECTION ACCORDING TO ROLE */}

      {/* 1. GIAO DIEN GIÁO VIÊN & ADMIN: BẢNG LƯỚI TUẦN TRỰC QUAN (WEEKLY GRID) CÓ CRUD */}
      {isTeacherOrAdmin ? (
        <div className="bg-white rounded-3xl border-2 border-orange-100 shadow-xl overflow-hidden p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-[#FF6600]" />
                Lịch Lưới Tuần (Weekly Grid Table) - Quản Trị Giáo Viên
              </h3>
              <p className="text-xs text-gray-500 font-bold mt-0.5">
                Bấm nút "Chỉnh sửa" hoặc "Xóa" trên từng tiết để cập nhật giờ hoặc bật/tắt nhắc lịch tự động.
              </p>
            </div>

            <button
              onClick={handleOpenAdd}
              className="bg-[#FF6600] hover:bg-orange-600 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow flex items-center gap-1.5 kid-btn"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Thêm tiết học</span>
            </button>
          </div>

          {/* Weekly Grid Columns (Thứ 2 đến Thứ 7 & CN) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {DAYS_OF_WEEK.slice(0, 6).map((day) => {
              const daySchedules = schedules
                .filter(s => s.day_of_week === day.value)
                .sort((a, b) => a.start_time.localeCompare(b.start_time));

              const isToday = currentDayOfWeek === day.value;

              return (
                <div
                  key={day.value}
                  className={`rounded-2xl border-2 overflow-hidden flex flex-col ${
                    isToday ? 'border-orange-500 shadow-md bg-orange-50/20' : 'border-gray-200 bg-gray-50/40'
                  }`}
                >
                  {/* Column Header */}
                  <div className={`p-3 text-center font-black text-sm flex items-center justify-center gap-1.5 ${
                    isToday ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'
                  }`}>
                    <span>{day.label}</span>
                    {isToday && <span className="bg-white text-orange-600 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">Hôm nay</span>}
                  </div>

                  {/* Schedule items in day */}
                  <div className="p-2 space-y-2.5 flex-1 min-h-[220px]">
                    {daySchedules.length > 0 ? (
                      daySchedules.map((sch) => {
                        const theme = getSubjectTheme(sch.subject_name);
                        const isThisOngoing = ongoing?.id === sch.id;

                        return (
                          <div
                            key={sch.id}
                            className={`p-3 rounded-xl border-2 transition shadow-sm relative group ${theme.bg} ${
                              isThisOngoing ? 'ring-2 ring-emerald-500 border-emerald-500 animate-pulse-subtle' : theme.border
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs font-black mb-1">
                              <span className="flex items-center gap-1">
                                <span>{theme.icon}</span>
                                <span className={theme.text}>{sch.subject_name}</span>
                              </span>
                              
                              {/* Toggle Active Reminder Button */}
                              <button
                                onClick={() => handleToggleActive(sch)}
                                title={sch.is_active ? 'Đang bật nhắc lịch (bấm để tắt)' : 'Đã ngưng nhắc lịch (bấm để bật)'}
                                className={`p-1 rounded-full ${sch.is_active ? 'text-emerald-600 hover:bg-emerald-200' : 'text-gray-400 hover:bg-gray-200'}`}
                              >
                                {sch.is_active ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                              </button>
                            </div>

                            <div className="flex items-center gap-1 text-[11px] font-bold text-gray-600 mb-2">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span>{sch.start_time} - {sch.end_time}</span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] pt-1 border-t border-black/5">
                              <span className="text-gray-500 font-bold">
                                Nhắc: {sch.reminder_minutes || 30}p
                              </span>

                              {/* Action buttons (Edit & Delete) */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenEdit(sch)}
                                  className="p-1 hover:bg-white/80 rounded text-blue-600 transition"
                                  title="Chỉnh sửa giờ/môn"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDelete(sch.id)}
                                  className="p-1 hover:bg-white/80 rounded text-red-600 transition"
                                  title="Xóa môn học"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-full flex items-center justify-center p-4 text-center text-gray-400 text-xs font-bold">
                        Không có tiết
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 2. GIAO DIỆN HỌC SINH & PHỤ HUYNH: READ-ONLY, THÂN THIỆN, CARD VIEW CÓ TÔ SÁNG MÔN ĐANG HỌC */
        <div className="space-y-6">
          
          {/* Day Navigation Tabs for Kids */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {DAYS_OF_WEEK.map((day) => {
              const isToday = currentDayOfWeek === day.value;
              const isSelected = selectedDayTab === day.value;

              return (
                <button
                  key={day.value}
                  onClick={() => setSelectedDayTab(day.value)}
                  className={`px-5 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition whitespace-nowrap shadow-sm ${
                    isSelected
                      ? 'bg-[#FF6600] text-white shadow-orange-200 shadow-md scale-105'
                      : 'bg-white text-gray-700 hover:bg-orange-50 border border-gray-200'
                  }`}
                >
                  <span>{day.label}</span>
                  {isToday && (
                    <span className="bg-yellow-400 text-orange-900 text-[10px] px-2 py-0.5 rounded-full font-black">
                      Hôm Nay 🌟
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Cards List for Selected Day */}
          <div className="bg-white rounded-3xl border-2 border-orange-100 p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-[#FF6600]" />
                Lịch Học {DAYS_OF_WEEK.find(d => d.value === selectedDayTab)?.label}
              </h3>
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                Chế độ xem học sinh (Read-only)
              </span>
            </div>

            {/* List of Subjects */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {schedules.filter(s => s.day_of_week === selectedDayTab).length > 0 ? (
                schedules
                  .filter(s => s.day_of_week === selectedDayTab)
                  .sort((a, b) => a.start_time.localeCompare(b.start_time))
                  .map((sch, idx) => {
                    const theme = getSubjectTheme(sch.subject_name);
                    const isToday = currentDayOfWeek === selectedDayTab;
                    const isThisOngoing = isToday && ongoing?.id === sch.id;

                    return (
                      <div
                        key={sch.id}
                        className={`p-5 rounded-3xl border-3 transition-all relative overflow-hidden ${
                          isThisOngoing
                            ? 'bg-gradient-to-br from-emerald-100 to-green-50 border-emerald-500 shadow-lg ring-4 ring-emerald-300 scale-102 animate-pulse-subtle'
                            : `${theme.bg} ${theme.border} hover:shadow-md`
                        }`}
                      >
                        {/* Highlight Badge if ongoing right now */}
                        {isThisOngoing && (
                          <div className="bg-emerald-600 text-white text-[11px] font-black px-3 py-1 rounded-full w-fit mb-2 flex items-center gap-1.5 shadow">
                            <Sparkles className="w-3.5 h-3.5 animate-bounce" />
                            <span>ĐANG DIỄN RA NGAY BÂY GIỜ</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-3">
                          <span className="text-3xl">{theme.icon}</span>
                          <span className={`text-xs font-black px-3 py-1 rounded-full shadow-sm ${theme.badge}`}>
                            Tiết {idx + 1}
                          </span>
                        </div>

                        <h4 className={`text-2xl font-black mb-2 ${isThisOngoing ? 'text-emerald-900' : theme.text}`}>
                          {sch.subject_name}
                        </h4>

                        <div className="flex items-center gap-2 text-sm font-extrabold text-gray-600 bg-white/70 p-2.5 rounded-xl border border-black/5">
                          <Clock className="w-4 h-4 text-orange-500" />
                          <span>{sch.start_time} - {sch.end_time}</span>
                        </div>

                        {sch.is_active && (
                          <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-gray-500">
                            <Bell className="w-3.5 h-3.5 text-amber-500" />
                            <span>Tự động nhắc trước {sch.reminder_minutes || 30} phút</span>
                          </div>
                        )}
                      </div>
                    );
                  })
              ) : (
                <div className="col-span-full py-16 text-center text-gray-400">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="font-extrabold text-base">Hôm nay không có tiết học nào!</p>
                  <p className="text-xs font-bold mt-1">Chúc em có một ngày vui vẻ và rèn luyện kỹ năng tự học nhé! 🌟</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default SchedulePage;
