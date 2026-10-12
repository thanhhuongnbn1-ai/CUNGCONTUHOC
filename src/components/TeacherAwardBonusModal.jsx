import React, { useState, useEffect } from 'react';
import {
  X,
  Gift,
  Award,
  Sparkles,
  Heart,
  CheckCircle2,
  Clock,
  User,
  Star,
  ChevronDown,
  Search,
  MessageCircle,
  History
} from 'lucide-react';
import { xpLeaderboardService, TEACHER_AWARD_PRESETS } from '../lib/xpLeaderboardService';

export const TeacherAwardBonusModal = ({
  isOpen,
  onClose,
  initialStudent = null,
  userProfile = null,
  onBonusAwarded = () => {}
}) => {
  const [activeTab, setActiveTab] = useState('award'); // 'award' | 'history'
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Form State
  const [teacherName, setTeacherName] = useState(
    userProfile?.full_name || 'Cô Giáo Chủ Nhiệm'
  );
  const [selectedPresetId, setSelectedPresetId] = useState('speech');
  const [reason, setReason] = useState('Phát biểu hay');
  const [xpAmount, setXpAmount] = useState(20);
  const [teacherNote, setTeacherNote] = useState('');

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadStudents();
      loadHistory();
      setSuccessMessage(null);

      if (initialStudent) {
        setSelectedStudent(initialStudent);
      }
    }
  }, [isOpen, initialStudent]);

  const loadStudents = async () => {
    const list = await xpLeaderboardService.getAllStudentsList();
    setStudents(list);
    if (!initialStudent && list.length > 0 && !selectedStudent) {
      setSelectedStudent(list[0]);
    }
  };

  const loadHistory = async () => {
    const history = await xpLeaderboardService.getTeacherBonusHistory({ limit: 30 });
    setHistoryLogs(history);
  };

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setReason(preset.title);
    setXpAmount(preset.xp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      alert('Vui lòng chọn học sinh nhận điểm thưởng!');
      return;
    }
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do khen thưởng!');
      return;
    }

    setIsSubmitting(true);
    try {
      const awardResult = await xpLeaderboardService.awardTeacherBonus({
        studentId: selectedStudent.id || selectedStudent.student_id,
        studentName: selectedStudent.name || selectedStudent.student_name,
        gradeLevel: selectedStudent.grade_level || 'Lớp 1',
        className: selectedStudent.class_name || 'Lớp 1A',
        avatarUrl: selectedStudent.avatar_url,
        xpAmount: Number(xpAmount),
        reason: reason.trim(),
        teacherId: userProfile?.id || 'teacher-demo',
        teacherName: teacherName.trim() || 'Cô Giáo',
        note: teacherNote.trim()
      });

      setSuccessMessage({
        studentName: selectedStudent.name || selectedStudent.student_name,
        xp: Number(xpAmount),
        reason: reason.trim()
      });

      // Reload history and trigger callback
      await loadHistory();
      if (onBonusAwarded) onBonusAwarded(awardResult);

      // Auto clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3500);

    } catch (err) {
      console.error('Error awarding bonus XP:', err);
      alert('Có lỗi xảy ra khi cộng điểm. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const filteredStudents = students.filter(s =>
    (s.name || s.student_name || '').toLowerCase().includes(searchKeyword.toLowerCase()) ||
    (s.class_name || s.grade_level || '').toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* 1. MODAL HEADER */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white p-6 relative overflow-hidden flex items-center justify-between">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/30">
              🎁
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/25 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                <Award className="w-3.5 h-3.5 text-yellow-200" />
                <span>DÀNH CHO GIÁO VIÊN & QUẢN TRỊ VIÊN</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-sm">
                Khen Thưởng & Tặng Điểm XP Trực Tiếp
              </h2>
              <p className="text-orange-100 text-xs font-medium">
                Ghi nhận nỗ lực của học sinh và cập nhật Bảng Xếp Hạng tức thì!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition flex-shrink-0 relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. TAB CONTROLS */}
        <div className="flex border-b border-gray-100 bg-orange-50/50 px-6 pt-3">
          <button
            onClick={() => setActiveTab('award')}
            className={`pb-3 px-4 font-black text-xs flex items-center gap-2 border-b-2 transition ${
              activeTab === 'award'
                ? 'border-[#FF6600] text-[#FF6600]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Tặng Thưởng Điểm XP</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-4 font-black text-xs flex items-center gap-2 border-b-2 transition ${
              activeTab === 'history'
                ? 'border-[#FF6600] text-[#FF6600]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Lịch Sử Đã Khen Thưởng ({historyLogs.length})</span>
          </button>
        </div>

        {/* SUCCESS ALERT TOAST INSIDE MODAL */}
        {successMessage && (
          <div className="mx-6 mt-4 p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-800 animate-slide-in">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-black text-sm text-emerald-900">
                🎉 Đã tặng thành công +{successMessage.xp} XP cho bé {successMessage.studentName}!
              </p>
              <p className="font-semibold text-emerald-700 mt-0.5">
                Lý do: "{successMessage.reason}". Bảng Xếp Hạng đã được tự động cộng điểm!
              </p>
            </div>
          </div>
        )}

        {/* 3. MODAL BODY */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'award' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* STUDENT SELECTOR */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase text-gray-700 tracking-wider">
                  1. Chọn Học Sinh Được Khen Thưởng:
                </label>
                
                {/* Selected Student Pill / Dropdown Button */}
                <div className="relative">
                  <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl flex items-center justify-between cursor-pointer hover:border-orange-400 transition"
                  >
                    {selectedStudent ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedStudent.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=student'}
                          alt={selectedStudent.name || selectedStudent.student_name}
                          className="w-10 h-10 rounded-full border border-orange-300 bg-white"
                        />
                        <div>
                          <p className="text-sm font-black text-gray-900">
                            {selectedStudent.name || selectedStudent.student_name}
                          </p>
                          <p className="text-[11px] font-bold text-orange-600">
                            {selectedStudent.class_name || selectedStudent.grade_level || 'Lớp 1'} • {selectedStudent.title || 'Học Sinh Chăm Chỉ'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500 font-bold">Bấm vào đây để chọn học sinh...</span>
                    )}

                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border-2 border-orange-200 shadow-xl z-30 p-3 space-y-2 max-h-60 overflow-y-auto">
                      <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Tìm học sinh theo tên hoặc lớp..."
                          value={searchKeyword}
                          onChange={(e) => setSearchKeyword(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div className="divide-y divide-gray-100">
                        {filteredStudents.map((s) => (
                          <div
                            key={s.id || s.student_id}
                            onClick={() => {
                              setSelectedStudent(s);
                              setIsDropdownOpen(false);
                            }}
                            className="p-2 hover:bg-orange-50 rounded-xl cursor-pointer flex items-center gap-2.5 transition"
                          >
                            <img
                              src={s.avatar_url}
                              alt={s.name || s.student_name}
                              className="w-8 h-8 rounded-full border border-gray-200"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-gray-800 truncate">
                                {s.name || s.student_name}
                              </p>
                              <p className="text-[10px] text-gray-500">
                                {s.class_name || s.grade_level}
                              </p>
                            </div>
                            <span className="text-[10px] font-black text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                              Chọn
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* TEACHER NAME */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase text-gray-700 tracking-wider">
                  2. Giáo Viên / Người Khen Thưởng:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="VD: Cô Mai (Chủ nhiệm Lớp 1A)..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-2xl text-xs font-black focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              {/* QUICK PRESETS CARDS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black uppercase text-gray-700 tracking-wider">
                    3. Chọn Nhanh Lý Do Khen Thưởng & Điểm Thưởng XP:
                  </label>
                  <span className="text-[11px] text-orange-600 font-bold">1 Click để chọn</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {TEACHER_AWARD_PRESETS.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-3 rounded-2xl border-2 text-left transition transform active:scale-95 flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
                            : 'bg-white hover:bg-orange-50/60 border-orange-100 text-gray-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xl">{preset.icon}</span>
                            <span
                              className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                                isSelected
                                  ? 'bg-white text-amber-700'
                                  : 'bg-orange-100 text-orange-700'
                              }`}
                            >
                              +{preset.xp} XP
                            </span>
                          </div>
                          <p className={`font-black text-xs ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                            {preset.title}
                          </p>
                        </div>
                        <p
                          className={`text-[10px] mt-1.5 line-clamp-2 ${
                            isSelected ? 'text-yellow-100' : 'text-gray-500 font-medium'
                          }`}
                        >
                          {preset.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CUSTOM XP AMOUNT & REASON */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-gray-700">
                    Số Điểm XP Thưởng:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="5"
                      max="500"
                      step="5"
                      value={xpAmount}
                      onChange={(e) => {
                        setXpAmount(e.target.value);
                        setSelectedPresetId(null);
                      }}
                      className="w-full px-3 py-2 bg-white border-2 border-orange-300 rounded-xl text-xs font-black text-orange-600 focus:outline-none"
                    />
                    <span className="text-xs font-black text-gray-500">XP</span>
                  </div>
                  {/* Quick pills */}
                  <div className="flex items-center gap-1 pt-1">
                    {[10, 20, 30, 50, 100].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setXpAmount(amt);
                          setSelectedPresetId(null);
                        }}
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-black ${
                          Number(xpAmount) === amt ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-black text-gray-700">
                    Nội Dung / Lý Do Khen Thưởng:
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => {
                      setReason(e.target.value);
                      setSelectedPresetId(null);
                    }}
                    placeholder="VD: Phát biểu hay, Giúp đỡ bạn cùng tiến bộ..."
                    className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-xl text-xs font-black focus:outline-none focus:border-orange-500"
                  />
                  <p className="text-[10px] text-gray-400">
                    Lý do sẽ hiển thị trên thông báo vinh danh của bé và nhật ký học tập.
                  </p>
                </div>
              </div>

              {/* OPTIONAL NOTE */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase text-gray-700 tracking-wider flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-orange-500" />
                  <span>Lời Nhắn Nhủ Yêu Thương Gửi Tới Bé (Tùy Chọn):</span>
                </label>
                <textarea
                  rows="2"
                  value={teacherNote}
                  onChange={(e) => setTeacherNote(e.target.value)}
                  placeholder="VD: Cô khen con hôm nay rất hăng hái và tập trung. Hãy tiếp tục phát huy ở các tiết học sau nhé!"
                  className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* ACTION SUBMIT BUTTON */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-2xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition"
                >
                  Đóng
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !selectedStudent || !reason.trim()}
                  className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs px-8 py-3.5 rounded-2xl shadow-lg flex items-center gap-2 kid-btn disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span>Đang ghi nhận...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-yellow-200" />
                      <span>
                        Tặng +{xpAmount} XP Cho {selectedStudent ? (selectedStudent.name || selectedStudent.student_name) : 'Bé'} Ngay
                      </span>
                    </>
                  )}
                </button>
              </div>

            </form>
          ) : (
            /* TAB 2: BONUS HISTORY LIST */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black text-gray-700">
                  Danh sách những lần thầy cô đã thưởng điểm khích lệ:
                </p>
                <button
                  onClick={loadHistory}
                  className="text-xs text-orange-600 font-bold hover:underline"
                >
                  Làm mới
                </button>
              </div>

              {historyLogs.length === 0 ? (
                <div className="text-center py-12 text-gray-400 space-y-2">
                  <Gift className="w-12 h-12 mx-auto text-gray-300" />
                  <p className="text-xs font-bold">Chưa có lượt tặng điểm thưởng nào.</p>
                  <p className="text-[11px]">Hãy chuyển qua tab "Tặng Thưởng Điểm XP" để khen ngợi học sinh đầu tiên nhé!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 flex items-start justify-between gap-3 hover:bg-orange-50 transition"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={log.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=student'}
                          alt={log.student_name}
                          className="w-10 h-10 rounded-full border border-orange-300 bg-white flex-shrink-0"
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-gray-900">
                              {log.student_name}
                            </span>
                            <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.2 rounded-full font-bold">
                              {log.grade_level || 'Lớp 1'}
                            </span>
                          </div>

                          <p className="text-xs font-bold text-gray-700 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                            <span>Lý do: {log.reason || log.activity_title}</span>
                          </p>

                          <div className="flex items-center gap-2 text-[10px] text-gray-500 pt-0.5">
                            <span>Giáo viên: <strong>{log.teacher_name || 'Cô Giáo'}</strong></span>
                            <span>•</span>
                            <span>
                              {new Date(log.created_at).toLocaleString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: '2-digit',
                                month: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs px-3 py-1 rounded-xl shadow-sm inline-flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current text-yellow-200" />
                          <span>+{log.xp_amount} XP</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TeacherAwardBonusModal;
