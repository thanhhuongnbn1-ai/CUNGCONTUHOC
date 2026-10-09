import React, { useState } from 'react';
import { createNewClass, generateQRCodeUrl } from '../lib/classService';
import { X, QrCode, Copy, Check, Sparkles, Users, PlusCircle, Share2, Download } from 'lucide-react';

export const CreateClassModal = ({ isOpen, onClose, onClassCreated, teacherId }) => {
  const [className, setClassName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('LỚP 1');
  const [createdClass, setCreatedClass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!className.trim() || loading) return;

    setLoading(true);
    const res = await createNewClass({
      name: className.trim(),
      grade_level: gradeLevel,
      teacher_id: teacherId
    });

    if (res.success) {
      setCreatedClass(res.data);
      if (onClassCreated) onClassCreated(res.data);
    }
    setLoading(false);
  };

  const handleCopyCode = () => {
    if (!createdClass) return;
    navigator.clipboard.writeText(createdClass.join_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!createdClass) return;
    const link = `${window.location.origin}/join/${createdClass.join_code}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const resetForm = () => {
    setClassName('');
    setCreatedClass(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full border-4 border-orange-300 shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FF6600] to-amber-500 p-6 text-white text-center relative">
          <button
            onClick={resetForm}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 rounded-full p-1 transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <span className="text-3xl">🏫</span>
          <h3 className="text-2xl font-black mt-1">Khởi Tạo Lớp Học Mới</h3>
          <p className="text-orange-100 text-xs font-bold mt-1">
            Hệ thống tự động sinh Mã Lớp (6 ký tự) và QR Code gia nhập tức thì!
          </p>
        </div>

        {/* Content Body */}
        {!createdClass ? (
          <form onSubmit={handleCreate} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-gray-700 mb-1">Tên Lớp Học / Nhóm Học</label>
              <input
                type="text"
                required
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Ví dụ: Lớp 1A - Tiểu Học Vui Học"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-700 mb-1">Khối Lớp</label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-black text-gray-800"
              >
                <option value="TIỀN LỚP 1">TIỀN LỚP 1</option>
                <option value="LỚP 1">LỚP 1</option>
                <option value="LỚP 2">LỚP 2</option>
                <option value="LỚP 3">LỚP 3</option>
                <option value="LỚP 4">LỚP 4</option>
                <option value="LỚP 5">LỚP 5</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={!className.trim() || loading}
              className="w-full bg-[#FF6600] hover:bg-orange-600 disabled:opacity-50 text-white font-black text-base py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 kid-btn mt-4"
            >
              <PlusCircle className="w-5 h-5" />
              <span>{loading ? 'Đang khởi tạo...' : 'Tạo Lớp & Sinh QR Code ngay'}</span>
            </button>
          </form>
        ) : (
          /* Result view displaying 6-character Join Code & QR Code */
          <div className="p-6 text-center space-y-5 animate-fade-in">
            
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Đã khởi tạo thành công lớp: <strong>{createdClass.name}</strong></span>
            </div>

            {/* Big 6-Character Join Code Badge */}
            <div className="bg-orange-50 border-2 border-orange-300 rounded-3xl p-4">
              <span className="text-xs font-black text-orange-600 uppercase tracking-wider block mb-1">
                MÃ THAM GIA LỚP HỌC (6 KÝ TỰ)
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl font-black text-orange-600 tracking-widest font-mono bg-white px-6 py-2 rounded-2xl border-2 border-orange-400 shadow-inner">
                  {createdClass.join_code}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-2xl shadow kid-btn"
                  title="Sao chép mã 6 ký tự"
                >
                  {copiedCode ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                </button>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-4 rounded-3xl border-2 border-gray-200 shadow-md inline-block">
              <img
                src={generateQRCodeUrl(createdClass.join_code, createdClass.name)}
                alt="QR Code Lớp Học"
                className="w-48 h-48 mx-auto rounded-xl border border-orange-100"
              />
              <p className="text-[11px] text-gray-500 font-bold mt-2">Quét mã QR bằng Điện thoại/Máy tính bảng để vào lớp ngay</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 bg-gray-100 hover:bg-orange-100 text-gray-800 font-black text-xs py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition kid-btn"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-orange-600" />}
                <span>{copiedLink ? 'Đã chép link gia nhập' : 'Sao chép Link chia sẻ'}</span>
              </button>

              <button
                onClick={resetForm}
                className="flex-1 bg-[#FF6600] hover:bg-orange-600 text-white font-black text-xs py-3 px-4 rounded-2xl shadow flex items-center justify-center gap-2 kid-btn"
              >
                <span>Xác nhận & Hoàn tất</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default CreateClassModal;
