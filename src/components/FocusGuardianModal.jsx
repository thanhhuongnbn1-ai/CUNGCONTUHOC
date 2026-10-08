import React from 'react';
import { ShieldAlert, AlertTriangle, ArrowRight, Eye } from 'lucide-react';

export const FocusGuardianModal = ({ isOpen, violationCount, onDismiss, lastViolationTime }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full border-4 border-amber-400 shadow-2xl p-6 text-center transform transition-all scale-100 relative overflow-hidden">
        {/* Animated Warning Banner */}
        <div className="bg-amber-500 -mx-6 -mt-6 p-4 mb-6 flex items-center justify-center gap-3 text-white font-extrabold text-xl shadow-md">
          <ShieldAlert className="w-8 h-8 animate-bounce" />
          <span>CẢNH BÁO CHỐNG XAO NHÃNG (FOCUS GUARDIAN)</span>
        </div>

        {/* Mascot / Icon illustration */}
        <div className="w-24 h-24 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center border-4 border-amber-300 shadow-inner">
          <Eye className="w-12 h-12 text-amber-600 animate-pulse" />
        </div>

        <h3 className="text-2xl font-black text-gray-800 mb-2">
          Bạn nhỏ ơi, em vừa rời màn hình học đấy!
        </h3>

        <p className="text-gray-600 font-medium mb-4 text-base leading-relaxed">
          Hệ thống phát hiện em vừa chuyển tab hoặc rời khỏi bài học. Để rèn luyện tính tự học tốt nhất, hãy tập trung 100% vào bài nhé!
        </p>

        {/* Violation Counter Badge */}
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-3 mb-6 flex items-center justify-around text-sm font-bold">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>Số lần rời tab ghi nhận:</span>
          </div>
          <span className="bg-red-600 text-white px-4 py-1 rounded-full text-lg font-black shadow">
            {violationCount} lượt
          </span>
        </div>

        <p className="text-xs text-gray-400 mb-6 italic">
          * Lượt vi phạm này sẽ được ghi nhận vào báo cáo thái độ tự học gửi cho Giáo viên & Phụ huynh ({lastViolationTime || 'Vừa xong'}).
        </p>

        {/* Action Button */}
        <button
          onClick={onDismiss}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-lg py-4 px-6 rounded-2xl shadow-lg hover:shadow-orange-200 flex items-center justify-center gap-2 kid-btn"
        >
          <span>Quay Lại Bài Học Ngay</span>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default FocusGuardianModal;
