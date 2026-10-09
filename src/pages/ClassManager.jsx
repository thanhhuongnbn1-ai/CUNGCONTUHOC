import React, { useState, useEffect } from 'react';
import { getStoredClasses, generateQRCodeUrl } from '../lib/classService';
import CreateClassModal from '../components/CreateClassModal';
import JoinClassModal from '../components/JoinClassModal';
import { PlusCircle, QrCode, Copy, Check, Users, Sparkles, LogIn, Share2, GraduationCap, ShieldCheck } from 'lucide-react';

export const ClassManager = ({ userProfile }) => {
  const [classes, setClasses] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [selectedQRClass, setSelectedQRClass] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  const isTeacher = userProfile?.role === 'teacher' || userProfile?.role === 'admin';

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = () => {
    const list = getStoredClasses();
    setClasses(list);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Create Class & Join Class Modals */}
      <CreateClassModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onClassCreated={loadClasses}
        teacherId={userProfile?.id}
      />

      <JoinClassModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onJoinedSuccess={loadClasses}
        studentId={userProfile?.id}
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#FF6600] via-amber-500 to-yellow-500 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 inline-block">
            HỆ THỐNG QUẢN LÝ LỚP HỌC VÀ MÃ GIA NHẬP QR CODE
          </span>
          <h1 className="text-3xl sm:text-4xl font-black">Danh Sách Lớp Học & Mã Join Code</h1>
          <p className="text-orange-100 font-medium text-sm mt-1 max-w-xl">
            Tự động sinh mã 6 ký tự và Mã QR giúp Giáo viên, Học sinh & Phụ huynh kết nối ngay tức thì!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {isTeacher ? (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="bg-white text-[#FF6600] hover:bg-orange-50 font-black text-sm px-6 py-3.5 rounded-2xl shadow-lg flex items-center gap-2 kid-btn whitespace-nowrap"
            >
              <PlusCircle className="w-5 h-5 text-[#FF6600]" />
              <span>Khởi tạo Lớp Mới</span>
            </button>
          ) : (
            <button
              onClick={() => setIsJoinOpen(true)}
              className="bg-white text-[#FF6600] hover:bg-orange-50 font-black text-sm px-6 py-3.5 rounded-2xl shadow-lg flex items-center gap-2 kid-btn whitespace-nowrap"
            >
              <LogIn className="w-5 h-5 text-[#FF6600]" />
              <span>Gia nhập Lớp Học</span>
            </button>
          )}
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <div key={cls.id} className="bg-white rounded-3xl border-2 border-orange-100 shadow-md hover:shadow-xl transition transform hover:-translate-y-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="bg-orange-100 text-orange-700 text-xs font-black px-3 py-1 rounded-full">
                  {cls.grade_level || 'LỚP 1'}
                </span>
                <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {cls.student_count || 24} học sinh
                </span>
              </div>

              <h3 className="font-extrabold text-xl text-gray-800 mb-4">{cls.name}</h3>

              {/* Join Code Box */}
              <div className="bg-orange-50/70 border-2 border-orange-200 rounded-2xl p-3 flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-black text-orange-600 block uppercase">MÃ LỚP (JOIN CODE)</span>
                  <span className="text-2xl font-black font-mono tracking-wider text-orange-700">{cls.join_code}</span>
                </div>
                <button
                  onClick={() => handleCopyCode(cls.join_code)}
                  className="bg-white hover:bg-orange-100 text-orange-600 border border-orange-300 p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                >
                  {copiedCode === cls.join_code ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode === cls.join_code ? 'Đã chép' : 'Sao chép'}</span>
                </button>
              </div>
            </div>

            {/* QR Code Action Button */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedQRClass(cls)}
                className="w-full bg-gray-50 hover:bg-orange-50 border border-gray-200 text-gray-800 hover:text-orange-600 font-extrabold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4 text-orange-500" />
                <span>Xem Mã QR Code Lớp</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* QR Code Inspection Modal */}
      {selectedQRClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full border-4 border-orange-300 shadow-2xl p-6 text-center relative">
            <button
              onClick={() => setSelectedQRClass(null)}
              className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 rounded-full p-1 transition"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            <span className="text-xs font-black text-orange-600 uppercase tracking-wider block mb-1">MÃ QR GIA NHẬP LỚP HỌC</span>
            <h3 className="font-extrabold text-lg text-gray-800 mb-3">{selectedQRClass.name}</h3>

            <div className="bg-white p-4 rounded-2xl border-2 border-orange-200 shadow-inner inline-block mb-3">
              <img
                src={generateQRCodeUrl(selectedQRClass.join_code, selectedQRClass.name)}
                alt="QR Code"
                className="w-52 h-52 mx-auto rounded-lg"
              />
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-2.5 text-xs font-extrabold text-orange-800 mb-4">
              Mã Lớp: <span className="font-mono text-base font-black text-orange-600 ml-1">{selectedQRClass.join_code}</span>
            </div>

            <button
              onClick={() => setSelectedQRClass(null)}
              className="w-full bg-[#FF6600] text-white font-black text-xs py-3 rounded-xl shadow kid-btn"
            >
              Đóng cửa sổ
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClassManager;
