import React, { useState } from 'react';
import { joinClassByCode } from '../lib/classService';
import { X, LogIn, CheckCircle2, AlertCircle, Sparkles, KeyRound } from 'lucide-react';

export const JoinClassModal = ({ isOpen, onClose, onJoinedSuccess, studentId }) => {
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [joinedClass, setJoinedClass] = useState(null);

  if (!isOpen) return null;

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode.trim() || loading) return;

    setErrorMsg('');
    setLoading(true);

    const res = await joinClassByCode({
      joinCode: joinCode.trim(),
      studentId: studentId || 'demo-student'
    });

    if (res.success) {
      setJoinedClass(res.class);
      if (onJoinedSuccess) onJoinedSuccess(res.class);
    } else {
      setErrorMsg(res.error || 'Không tìm thấy lớp học. Vui lòng nhập đúng 6 ký tự mã lớp!');
    }

    setLoading(false);
  };

  const resetForm = () => {
    setJoinCode('');
    setErrorMsg('');
    setJoinedClass(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full border-4 border-orange-300 shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FF6600] to-amber-500 p-6 text-white text-center relative">
          <button
            onClick={resetForm}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 rounded-full p-1 transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <span className="text-3xl">🎒</span>
          <h3 className="text-2xl font-black mt-1">Gia Nhập Lớp Học</h3>
          <p className="text-orange-100 text-xs font-bold mt-1">
            Nhập 6 ký tự Mã Lớp từ Thầy/Cô cấp để cùng học tập nhé!
          </p>
        </div>

        {/* Content Body */}
        {!joinedClass ? (
          <form onSubmit={handleJoin} className="p-6 space-y-4">
            
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl text-center flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-extrabold text-gray-700 mb-1">Mã Lớp Học (6 ký tự)</label>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-orange-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Ví dụ: VH982K"
                  className="w-full bg-orange-50/50 border-2 border-orange-300 focus:border-orange-500 rounded-2xl pl-12 pr-4 py-3 text-2xl font-mono font-black tracking-widest text-center uppercase focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={joinCode.trim().length !== 6 || loading}
              className="w-full bg-[#FF6600] hover:bg-orange-600 disabled:opacity-50 text-white font-black text-base py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 kid-btn mt-2"
            >
              <LogIn className="w-5 h-5" />
              <span>{loading ? 'Đang gia nhập...' : 'Tham Gia Lớp Học Ngay'}</span>
            </button>
          </form>
        ) : (
          <div className="p-6 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <h3 className="text-2xl font-black text-gray-800">
              Chúc mừng em đã gia nhập lớp thành công!
            </h3>

            <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 text-xs">
              <span className="font-extrabold text-orange-700 block text-sm">{joinedClass.name}</span>
              <span className="text-gray-500 font-bold mt-1 block">Khối: {joinedClass.grade_level}</span>
            </div>

            <button
              onClick={resetForm}
              className="w-full bg-[#FF6600] hover:bg-orange-600 text-white font-black text-base py-3 rounded-2xl shadow kid-btn"
            >
              Bắt đầu học ngay
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default JoinClassModal;
