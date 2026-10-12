import { useEffect, useState, useCallback } from 'react';

/**
 * Hook Chống Sao Chép & Giới Hạn Tải Xuống Học Liệu Bản Quyền
 * - Tắt chuột phải (contextmenu)
 * - Tắt các phím tắt copy/in/lưu (Ctrl+C, Ctrl+S, Ctrl+P, Ctrl+U, F12)
 * - Tắt bôi đen text selection và kéo thả
 */
export const useContentProtection = ({ isProtected = true, containerRef = null } = {}) => {
  const [warningMessage, setWarningMessage] = useState(null);

  const showSecurityWarning = useCallback((msg) => {
    setWarningMessage(msg);
    setTimeout(() => {
      setWarningMessage(null);
    }, 3000);
  }, []);

  useEffect(() => {
    if (!isProtected) return;

    const target = containerRef?.current || document;

    // 1. Chặn Chuột Phải
    const handleContextMenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      showSecurityWarning('🔒 Nội dung học liệu được bảo vệ bản quyền. Không được phép click chuột phải!');
      return false;
    };

    // 2. Chặn Bôi Đen Chọn Chữ
    const handleSelectStart = (e) => {
      e.preventDefault();
      return false;
    };

    // 3. Chặn Kéo Thả File / Ảnh
    const handleDragStart = (e) => {
      e.preventDefault();
      return false;
    };

    // 4. Chặn Sao Chép (Copy / Cut)
    const handleCopyCut = (e) => {
      e.preventDefault();
      showSecurityWarning('⚠️ Cảnh báo: Học liệu độc quyền! Nghiêm cấm sao chép nội dung.');
      return false;
    };

    // 5. Chặn Phím Tắt Trình Duyệt (Ctrl+C, Ctrl+S, Ctrl+P, Ctrl+U, F12)
    const handleKeyDown = (e) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // Ctrl + C (Copy)
      if (isCtrlOrCmd && key === 'c') {
        e.preventDefault();
        showSecurityWarning('⚠️ Chức năng Sao chép (Ctrl+C) đã bị vô hiệu hóa để bảo vệ tác quyền bài giảng.');
      }
      // Ctrl + S (Save / Download)
      else if (isCtrlOrCmd && key === 's') {
        e.preventDefault();
        showSecurityWarning('🔒 Chức năng Tải xuống (Ctrl+S) đã bị khóa đối với tài liệu này.');
      }
      // Ctrl + P (Print)
      else if (isCtrlOrCmd && key === 'p') {
        e.preventDefault();
        showSecurityWarning('🚫 Chức năng In ấn (Ctrl+P) đã bị tắt để tránh rò rỉ học liệu.');
      }
      // Ctrl + U (View Source)
      else if (isCtrlOrCmd && key === 'u') {
        e.preventDefault();
        showSecurityWarning('🔒 Mã nguồn được bảo mật.');
      }
      // F12 or Ctrl+Shift+I (DevTools)
      else if (e.key === 'F12' || (isCtrlOrCmd && e.shiftKey && key === 'i')) {
        e.preventDefault();
        showSecurityWarning('🛡️ Công cụ phát triển đã bị hạn chế.');
      }
    };

    target.addEventListener('contextmenu', handleContextMenu);
    target.addEventListener('selectstart', handleSelectStart);
    target.addEventListener('dragstart', handleDragStart);
    target.addEventListener('copy', handleCopyCut);
    target.addEventListener('cut', handleCopyCut);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      target.removeEventListener('contextmenu', handleContextMenu);
      target.removeEventListener('selectstart', handleSelectStart);
      target.removeEventListener('dragstart', handleDragStart);
      target.removeEventListener('copy', handleCopyCut);
      target.removeEventListener('cut', handleCopyCut);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProtected, containerRef, showSecurityWarning]);

  return {
    warningMessage,
    clearWarning: () => setWarningMessage(null)
  };
};

export default useContentProtection;
