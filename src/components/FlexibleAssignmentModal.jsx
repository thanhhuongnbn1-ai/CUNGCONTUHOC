import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  User,
  Calendar,
  Clock,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Gamepad2,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { assignmentService } from '../lib/assignmentService';

export const FlexibleAssignmentModal = ({
  material,
  userProfile,
  onClose,
  onAssigned
}) => {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [studentsInClass, setStudentsInClass] = useState([]);

  // Assignment Configuration States
  const [targetType, setTargetType] = useState('all'); // 'all' | 'group' | 'individual'
  const [targetGroupName, setTargetGroupName] = useState('Nhóm Cần Phụ Đạo');
  const [customGroupName, setCustomGroupName] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [deadline, setDeadline] = useState('');
  const [note, setNote] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-defined student groups
  const PRESET_GROUPS = [
    'Nhóm Cần Phụ Đạo / Ôn Tập',
    'Nhóm Bồi Dưỡng Học Sinh Giỏi',
    'Nhóm Tự Học Cuối Tuần',
    'Nhóm Luyện Thi Khảo Sát'
  ];

  // Load Classes on mount
  useEffect(() => {
    loadClasses();
  }, []);

  // When selected class changes, load its students
  useEffect(() => {
    if (selectedClassId) {
      loadStudentsForClass(selectedClassId);
    }
  }, [selectedClassId]);

  const loadClasses = async () => {
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('classes')
          .select('id, name, grade_level');
        if (data && data.length > 0) {
          setClasses(data);
          setSelectedClassId(data[0].id);
          return;
        }
      } catch (err) {
        console.warn('Error loading classes:', err);
      }
    }

    // Fallback sample classes
    const fallback = [
      { id: 'class_1a', name: 'Lớp 1A - Vui Học', grade_level: 'LỚP 1' },
      { id: 'class_2b', name: 'Lớp 2B - Khám Phá', grade_level: 'LỚP 2' },
      { id: 'class_4c', name: 'Lớp 4C - Vươn Xa', grade_level: 'LỚP 4' }
    ];
    setClasses(fallback);
    setSelectedClassId(fallback[0].id);
  };

  const loadStudentsForClass = async (classId) => {
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('class_members')
          .select('student_id, profiles(id, full_name, email)')
          .eq('class_id', classId);

        if (data && data.length > 0) {
          const list = data
            .map(m => m.profiles)
            .filter(Boolean)
            .map(p => ({
              id: p.id,
              name: p.full_name || p.email
            }));
          setStudentsInClass(list);
          return;
        }
      } catch (err) {
        console.warn('Error loading students:', err);
      }
    }

    // Fallback demo students
    setStudentsInClass([
      { id: 'stu_01', name: 'Bé Minh Triết (Học sinh mẫu)' },
      { id: 'stu_02', name: 'Bé Bảo An' },
      { id: 'stu_03', name: 'Bé Gia Hưng' },
      { id: 'stu_04', name: 'Bé Thảo Vy' },
      { id: 'stu_05', name: 'Bé Tuấn Kiệt' }
    ]);
  };

  const handleToggleStudent = (studentId) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSetQuickDeadline = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(21, 0, 0, 0); // 21:00 tối
    // Format YYYY-MM-DDTHH:mm
    const iso = d.toISOString().slice(0, 16);
    setDeadline(iso);
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!selectedClassId) {
      setErrorMsg('Vui lòng chọn Lớp học nhận bài!');
      return;
    }

    if (targetType === 'individual' && selectedStudentIds.length === 0) {
      setErrorMsg('Vui lòng chọn ít nhất 1 học sinh nhận bài!');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    const targetClass = classes.find(c => c.id === selectedClassId);
    const finalGroupName = targetGroupName === 'Khác' ? customGroupName : targetGroupName;

    const studentNames = studentsInClass
      .filter(s => selectedStudentIds.includes(s.id))
      .map(s => s.name);

    try {
      const created = await assignmentService.createAssignment({
        materialId: material?.id || 'demo_mat',
        materialTitle: material?.title || 'Bài tập tương tác',
        materialType: material?.content_type || 'quiz',
        classId: selectedClassId,
        className: targetClass?.name || 'Lớp học',
        assignedBy: userProfile?.id,
        teacherName: userProfile?.full_name || 'Thầy/Cô Giáo',
        targetType,
        targetGroupName: finalGroupName,
        studentIds: selectedStudentIds,
        studentNames,
        deadline: deadline || null,
        note: note.trim()
      });

      setIsSuccess(true);
      if (onAssigned) onAssigned(created);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMsg('Lỗi khi giao bài: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl p-6 sm:p-8 border-4 border-orange-100 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6600] to-amber-500 text-white flex items-center justify-center shadow-md">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                GIAO BÀI LINH HOẠT
              </span>
              <h3 className="text-xl font-black text-gray-800 mt-0.5">
                Giao Bài Tập / Game / Đề Thi
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MATERIAL INFO PREVIEW */}
        <div className="p-4 bg-orange-50/70 border-2 border-orange-200 rounded-2xl flex items-center gap-3">
          <div className="p-2.5 bg-white rounded-xl border border-orange-200 text-[#FF6600] shadow-sm">
            {material?.content_type === 'game' ? <Gamepad2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-black text-orange-600 uppercase">
              {material?.subject || 'Môn học'} • {material?.content_type === 'game' ? 'Trò chơi mini' : 'Đề thi / Bài tập'}
            </span>
            <h4 className="text-sm font-extrabold text-gray-800 truncate">
              {material?.title || 'Tên bài học'}
            </h4>
          </div>
        </div>

        <form onSubmit={handleSubmitAssignment} className="space-y-5">
          
          {/* 1. SELECT TARGET CLASS */}
          <div>
            <label className="block text-xs font-extrabold text-gray-700 mb-1.5">
              1. Chọn Lớp Học Nhận Bài:
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl p-3 text-xs font-bold focus:outline-none focus:border-orange-500"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.grade_level})
                </option>
              ))}
            </select>
          </div>

          {/* 2. CHOOSE ASSIGNMENT TARGET TYPE */}
          <div>
            <label className="block text-xs font-extrabold text-gray-700 mb-1.5">
              2. Chọn Đối Tượng Giao Bài:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setTargetType('all')}
                className={`p-3.5 rounded-2xl border-2 text-left transition kid-btn ${
                  targetType === 'all'
                    ? 'bg-orange-50 border-[#FF6600] text-[#FF6600] shadow'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="font-black text-xs">Toàn Lớp</span>
                </div>
                <p className="text-[11px] text-gray-500 font-medium">
                  Tất cả học sinh trong lớp đều làm bài
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('group')}
                className={`p-3.5 rounded-2xl border-2 text-left transition kid-btn ${
                  targetType === 'group'
                    ? 'bg-orange-50 border-[#FF6600] text-[#FF6600] shadow'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <UserCheck className="w-4 h-4" />
                  <span className="font-black text-xs">Nhóm Cụ Thể</span>
                </div>
                <p className="text-[11px] text-gray-500 font-medium">
                  Giao theo nhóm bồi dưỡng, phụ đạo
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('individual')}
                className={`p-3.5 rounded-2xl border-2 text-left transition kid-btn ${
                  targetType === 'individual'
                    ? 'bg-orange-50 border-[#FF6600] text-[#FF6600] shadow'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4" />
                  <span className="font-black text-xs">Học Sinh Cá Biệt</span>
                </div>
                <p className="text-[11px] text-gray-500 font-medium">
                  Chọn 1 hoặc vài em cần kèm riêng
                </p>
              </button>
            </div>
          </div>

          {/* 3. SUB-SELECTION BASED ON TARGET TYPE */}
          {targetType === 'group' && (
            <div className="bg-gray-50 p-4 rounded-2xl border-2 border-gray-200 space-y-3 animate-fade-in">
              <label className="block text-xs font-extrabold text-gray-700">
                Chọn Nhóm Học Sinh:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_GROUPS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setTargetGroupName(g)}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                      targetGroupName === g
                        ? 'bg-[#FF6600] text-white border-orange-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-orange-50'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}

          {targetType === 'individual' && (
            <div className="bg-gray-50 p-4 rounded-2xl border-2 border-gray-200 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-gray-700">
                  Chọn Học Sinh Nhận Bài ({selectedStudentIds.length} em đã chọn):
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedStudentIds.length === studentsInClass.length) {
                      setSelectedStudentIds([]);
                    } else {
                      setSelectedStudentIds(studentsInClass.map(s => s.id));
                    }
                  }}
                  className="text-[11px] font-black text-[#FF6600] hover:underline"
                >
                  {selectedStudentIds.length === studentsInClass.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {studentsInClass.map((student) => {
                  const isChecked = selectedStudentIds.includes(student.id);
                  return (
                    <label
                      key={student.id}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                        isChecked
                          ? 'bg-orange-100/70 border-orange-400 text-orange-950 font-bold'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleStudent(student.id)}
                        className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                      />
                      <span className="text-xs truncate">{student.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. DEADLINE (THỜI HẠN NỘP BÀI) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold text-gray-700">
                3. Hạn Chót Nộp Bài (Deadline):
              </label>
              <div className="flex items-center gap-1.5 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => handleSetQuickDeadline(1)}
                  className="text-orange-600 hover:underline px-1.5 py-0.5 bg-orange-50 rounded"
                >
                  +1 Ngày
                </button>
                <button
                  type="button"
                  onClick={() => handleSetQuickDeadline(3)}
                  className="text-orange-600 hover:underline px-1.5 py-0.5 bg-orange-50 rounded"
                >
                  +3 Ngày
                </button>
                <button
                  type="button"
                  onClick={() => handleSetQuickDeadline(7)}
                  className="text-orange-600 hover:underline px-1.5 py-0.5 bg-orange-50 rounded"
                >
                  +1 Tuần
                </button>
              </div>
            </div>

            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl p-3 text-xs font-bold focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* 5. TEACHER NOTE */}
          <div>
            <label className="block text-xs font-extrabold text-gray-700 mb-1.5">
              4. Lời Dặn Của Thầy / Cô:
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Các em ôn lại bài trước khi làm nhé, cố gắng hoàn thành trước giờ học!"
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl p-3 text-xs font-medium focus:outline-none focus:border-orange-500"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black border border-emerald-300 flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>🎉 Đã giao bài tập thành công và gửi thông báo tới học sinh!</span>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl border-2 border-gray-200 text-xs font-black text-gray-600 hover:bg-gray-100 transition"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="bg-[#FF6600] hover:bg-orange-600 disabled:opacity-50 text-white font-black text-xs px-6 py-3.5 rounded-2xl shadow-lg transition kid-btn flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isLoading ? 'Đang giao bài...' : 'Xác Nhận Giao Bài Ngay'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default FlexibleAssignmentModal;
