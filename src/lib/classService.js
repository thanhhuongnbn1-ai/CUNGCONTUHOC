import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Sinh mã Join Code ngẫu nhiên 6 ký tự viết hoa (ví dụ: VH982K, AB73X9)
 */
export const generateJoinCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Bỏ các ký tự dễ nhầm lẫn như 0, O, 1, I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Sinh URL QR Code gia nhập lớp học nhanh
 */
export const generateQRCodeUrl = (joinCode, className = '') => {
  const joinUrl = `${window.location.origin}/join/${joinCode}`;
  const encodedUrl = encodeURIComponent(joinUrl);
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedUrl}&color=FF6600&bgcolor=FFFFFF&margin=10`;
};

// Fallback in-memory / local storage classes for instant testing
const LOCAL_STORAGE_KEY = 'vuihoc_classes_data';

export const getStoredClasses = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [
    {
      id: 'demo-class-1',
      name: 'Lớp 1A - Tiểu Học Vui Học',
      grade_level: 'LỚP 1',
      join_code: 'VH1A99',
      teacher_id: 'demo-teacher',
      created_at: new Date().toISOString(),
      student_count: 24
    },
    {
      id: 'demo-class-2',
      name: 'Lớp 2B - Nhóm Tư Duy Toán',
      grade_level: 'LỚP 2',
      join_code: 'TOAN2B',
      teacher_id: 'demo-teacher',
      created_at: new Date().toISOString(),
      student_count: 18
    }
  ];
};

export const saveClassLocally = (newClass) => {
  const current = getStoredClasses();
  const updated = [newClass, ...current];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

/**
 * Tạo lớp học mới trong Supabase hoặc Local Storage
 */
export const createNewClass = async ({ name, grade_level, teacher_id }) => {
  const join_code = generateJoinCode();
  const newClassObj = {
    id: `class-${Date.now()}`,
    name,
    grade_level: grade_level || 'LỚP 1',
    join_code,
    teacher_id: teacher_id || 'demo-teacher',
    created_at: new Date().toISOString(),
    student_count: 0
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('classes')
        .insert({
          name,
          grade_level: grade_level || 'LỚP 1',
          join_code,
          teacher_id
        })
        .select('*')
        .single();

      if (!error && data) {
        return { success: true, data };
      }
    } catch (err) {
      console.warn('Supabase classes table insert error (falling back to local storage):', err);
    }
  }

  saveClassLocally(newClassObj);
  return { success: true, data: newClassObj };
};

/**
 * Tham gia lớp học qua Mã Join Code 6 ký tự
 */
export const joinClassByCode = async ({ joinCode, studentId }) => {
  const cleanCode = joinCode.trim().toUpperCase();

  if (isSupabaseConfigured()) {
    try {
      const { data: targetClass, error: findErr } = await supabase
        .from('classes')
        .select('*')
        .eq('join_code', cleanCode)
        .single();

      if (!findErr && targetClass) {
        // Insert to class_members
        await supabase
          .from('class_members')
          .insert({ class_id: targetClass.id, student_id: studentId });

        return { success: true, class: targetClass };
      }
    } catch (err) {
      console.warn('Supabase join error:', err);
    }
  }

  // Check local stored classes
  const localClasses = getStoredClasses();
  const matched = localClasses.find(c => c.join_code === cleanCode);

  if (matched) {
    return { success: true, class: matched };
  }

  return { success: false, error: 'Mã lớp học không tồn tại. Vui lòng kiểm tra lại 6 ký tự!' };
};
