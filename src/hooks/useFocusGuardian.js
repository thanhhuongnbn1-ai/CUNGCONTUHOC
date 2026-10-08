import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Focus Guardian Hook (Kiểm Soát Tập Trung & Chống Xao Nhãng)
 * Lắng nghe sự kiện rời tab (visibilitychange / window blur)
 * Ghi nhận vi phạm vào cơ sở dữ liệu Supabase focus_violations
 */
export const useFocusGuardian = ({ studentId, materialId, isEnabled = true }) => {
  const [isFocusLost, setIsFocusLost] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [lastViolationTime, setLastViolationTime] = useState(null);
  
  // Throttle logging to prevent duplicate spam within 3 seconds
  const lastLogTimeRef = useRef(0);

  const logViolationToDB = useCallback(async (reasonText) => {
    const now = Date.now();
    if (now - lastLogTimeRef.current < 3000) return; // Debounce 3s
    lastLogTimeRef.current = now;

    console.warn(`[FOCUS GUARDIAN] Focus violation detected: ${reasonText}`);
    
    // Update local counter
    setViolationCount(prev => prev + 1);
    setLastViolationTime(new Date().toLocaleTimeString('vi-VN'));

    // Record to Supabase DB if user is authenticated and DB is available
    if (studentId && isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('focus_violations')
          .insert({
            student_id: studentId,
            material_id: materialId || null,
            violation_time: new Date().toISOString(),
            reason: reasonText
          });

        if (error) {
          console.warn('[FOCUS GUARDIAN] DB Log Error:', error.message);
        }
      } catch (err) {
        console.warn('[FOCUS GUARDIAN] Failed to log violation:', err);
      }
    }
  }, [studentId, materialId]);

  useEffect(() => {
    if (!isEnabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        setIsFocusLost(true);
        logViolationToDB('Chuyển Tab Trình Duyệt (visibilitychange)');
      }
    };

    const handleWindowBlur = () => {
      setIsFocusLost(true);
      logViolationToDB('Thoát Cửa Sổ Trình Duyệt (window.onblur)');
    };

    // Attach listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isEnabled, logViolationToDB]);

  const dismissWarning = () => {
    setIsFocusLost(false);
  };

  const resetViolationCount = () => {
    setViolationCount(0);
  };

  return {
    isFocusLost,
    violationCount,
    lastViolationTime,
    dismissWarning,
    resetViolationCount
  };
};

export default useFocusGuardian;
