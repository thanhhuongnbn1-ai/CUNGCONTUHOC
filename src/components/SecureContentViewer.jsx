import React, { useRef } from 'react';
import { useContentProtection } from '../hooks/useContentProtection';
import { ShieldCheck, Lock, AlertTriangle, FileText, Video, EyeOff } from 'lucide-react';

export const SecureContentViewer = ({
  contentType = 'pdf', // 'pdf' | 'video' | 'document'
  sourceUrl,
  title,
  studentName = 'Học Sinh Vui Học',
  studentId = 'HS-2026'
}) => {
  const containerRef = useRef(null);
  const { warningMessage } = useContentProtection({
    isProtected: true,
    containerRef
  });

  return (
    <div
      ref={containerRef}
      className="relative select-none overflow-hidden rounded-3xl border-4 border-amber-300 bg-white shadow-2xl p-4 sm:p-6"
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* Security Warning Toast */}
      {warningMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-2xl border-2 border-white flex items-center gap-2 animate-bounce">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{warningMessage}</span>
        </div>
      )}

      {/* Top Protection Banner */}
      <div className="bg-amber-500 -mx-6 -mt-6 p-3.5 mb-4 text-white flex flex-wrap items-center justify-between gap-2 text-xs font-black shadow">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-200" />
          <span>HỌC LIỆU ĐƯỢC BẢO VỆ TÁC QUYỀN (CHỐNG SAO CHÉP & TẢI VỀ)</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-amber-100">
          <Lock className="w-3.5 h-3.5" />
          <span>Đã khóa nút Download, In ấn và Bôi đen văn bản</span>
        </div>
      </div>

      {/* Dynamic Watermark Overlay to deter screen capture */}
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-around opacity-15 rotate-[-20deg] overflow-hidden select-none">
        <div className="text-xl sm:text-2xl font-black text-gray-900 tracking-widest whitespace-nowrap text-center">
          {studentName} • {studentId} • BẢN QUYỀN ĐỒNG HÀNH CÙNG CON TRƯỞNG THÀNH
        </div>
        <div className="text-xl sm:text-2xl font-black text-gray-900 tracking-widest whitespace-nowrap text-center">
          {studentName} • {studentId} • HỌC LIỆU NỘI BỘ TIỂU HỌC
        </div>
        <div className="text-xl sm:text-2xl font-black text-gray-900 tracking-widest whitespace-nowrap text-center">
          {studentName} • {studentId} • NGHIÊM CẤM SAO CHÉP & CHIA SẺ
        </div>
      </div>

      {/* Content Rendering by Type */}

      {/* 1. PDF VIEWER (WITH TOOLBAR AND DOWNLOAD BUTTONS DISABLED) */}
      {contentType === 'pdf' && (
        <div className="relative w-full h-[600px] rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-100">
          <iframe
            src={`${sourceUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'}#toolbar=0&navpanes=0&scrollbar=0`}
            title={title || 'PDF Document'}
            className="w-full h-full border-0 pointer-events-auto"
            onContextMenu={(e) => e.preventDefault()}
          />
          {/* Transparent click shield overlay on top bar to prevent PDF viewer toolbar inspection */}
          <div className="absolute top-0 left-0 right-0 h-14 bg-transparent pointer-events-auto" onContextMenu={(e) => e.preventDefault()} />
        </div>
      )}

      {/* 2. VIDEO PLAYER (WITH DOWNLOAD AND PICTURE-IN-PICTURE BUTTONS DISABLED) */}
      {contentType === 'video' && (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-gray-200 bg-black flex items-center justify-center">
          <video
            controls
            controlsList="nodownload noplaybackrate nofullscreen"
            disablePictureInPicture
            onContextMenu={(e) => e.preventDefault()}
            className="w-full h-full object-contain"
            src={sourceUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
          >
            Trình duyệt của bạn không hỗ trợ thẻ video.
          </video>
        </div>
      )}

      {/* Security Footer Notice */}
      <div className="mt-3 text-center text-[11px] text-gray-400 font-bold flex items-center justify-center gap-1.5">
        <Lock className="w-3.5 h-3.5 text-amber-500" />
        <span>Hệ thống tự động gắn Watermark định danh và theo dõi hành vi sao chép trái phép.</span>
      </div>
    </div>
  );
};

export default SecureContentViewer;
