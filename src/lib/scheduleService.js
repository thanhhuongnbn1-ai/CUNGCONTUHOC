import { supabase, isSupabaseConfigured } from './supabase';

export const DAYS_OF_WEEK = [
  { value: 2, label: 'Thứ Hai', short: 'T2' },
  { value: 3, label: 'Thứ Ba', short: 'T3' },
  { value: 4, label: 'Thứ Tư', short: 'T4' },
  { value: 5, label: 'Thứ Năm', short: 'T5' },
  { value: 6, label: 'Thứ Sáu', short: 'T6' },
  { value: 7, label: 'Thứ Bảy', short: 'T7' },
  { value: 8, label: 'Chủ Nhật', short: 'CN' }
];

export const POPULAR_SUBJECTS = [
  'Toán học',
  'Tiếng Việt',
  'Tiếng Anh',
  'Khoa học',
  'Lịch sử & Địa lý',
  'Đạo đức',
  'Âm nhạc',
  'Mĩ thuật',
  'Tin học',
  'Giáo dục thể chất',
  'Hoạt động trải nghiệm'
];

export const getSubjectTheme = (subjectName = '') => {
  const s = subjectName.toLowerCase();
  if (s.includes('toán')) return { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-800', badge: 'bg-blue-600 text-white', icon: '🔢' };
  if (s.includes('tiếng việt')) return { bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-800', badge: 'bg-amber-600 text-white', icon: '📖' };
  if (s.includes('tiếng anh') || s.includes('english')) return { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-800', badge: 'bg-purple-600 text-white', icon: '🔤' };
  if (s.includes('khoa học') || s.includes('tự nhiên')) return { bg: 'bg-emerald-100', border: 'border-emerald-400', text: 'text-emerald-800', badge: 'bg-emerald-600 text-white', icon: '🧪' };
  if (s.includes('mĩ thuật') || s.includes('vẽ')) return { bg: 'bg-pink-100', border: 'border-pink-400', text: 'text-pink-800', badge: 'bg-pink-600 text-white', icon: '🎨' };
  if (s.includes('âm nhạc') || s.includes('hát')) return { bg: 'bg-rose-100', border: 'border-rose-400', text: 'text-rose-800', badge: 'bg-rose-600 text-white', icon: '🎵' };
  if (s.includes('thể chất') || s.includes('thể dục')) return { bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-800', badge: 'bg-orange-600 text-white', icon: '⚽' };
  if (s.includes('tin học')) return { bg: 'bg-cyan-100', border: 'border-cyan-400', text: 'text-cyan-800', badge: 'bg-cyan-600 text-white', icon: '💻' };
  return { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-900', badge: 'bg-orange-500 text-white', icon: '📚' };
};

const LOCAL_STORAGE_KEY = 'vuihoc_schedules_cache';

const DEFAULT_SEED_SCHEDULES = [
  // Thứ 2
  { id: 'sch-1', class_id: 'default', subject_name: 'Toán học', day_of_week: 2, start_time: '07:30', end_time: '08:15', is_active: true, reminder_minutes: 30 },
  { id: 'sch-2', class_id: 'default', subject_name: 'Tiếng Việt', day_of_week: 2, start_time: '08:30', end_time: '09:15', is_active: true, reminder_minutes: 30 },
  { id: 'sch-3', class_id: 'default', subject_name: 'Tiếng Anh', day_of_week: 2, start_time: '09:30', end_time: '10:15', is_active: true, reminder_minutes: 15 },
  // Thứ 3
  { id: 'sch-4', class_id: 'default', subject_name: 'Tiếng Việt', day_of_week: 3, start_time: '07:30', end_time: '08:15', is_active: true, reminder_minutes: 30 },
  { id: 'sch-5', class_id: 'default', subject_name: 'Toán học', day_of_week: 3, start_time: '08:30', end_time: '09:15', is_active: true, reminder_minutes: 30 },
  { id: 'sch-6', class_id: 'default', subject_name: 'Khoa học', day_of_week: 3, start_time: '09:30', end_time: '10:15', is_active: true, reminder_minutes: 30 },
  // Thứ 4
  { id: 'sch-7', class_id: 'default', subject_name: 'Toán học', day_of_week: 4, start_time: '07:30', end_time: '08:15', is_active: true, reminder_minutes: 30 },
  { id: 'sch-8', class_id: 'default', subject_name: 'Mĩ thuật', day_of_week: 4, start_time: '08:30', end_time: '09:15', is_active: true, reminder_minutes: 15 },
  { id: 'sch-9', class_id: 'default', subject_name: 'Âm nhạc', day_of_week: 4, start_time: '09:30', end_time: '10:15', is_active: true, reminder_minutes: 15 },
  // Thứ 5
  { id: 'sch-10', class_id: 'default', subject_name: 'Tiếng Việt', day_of_week: 5, start_time: '07:30', end_time: '08:15', is_active: true, reminder_minutes: 30 },
  { id: 'sch-11', class_id: 'default', subject_name: 'Tiếng Anh', day_of_week: 5, start_time: '08:30', end_time: '09:15', is_active: true, reminder_minutes: 15 },
  { id: 'sch-12', class_id: 'default', subject_name: 'Tin học', day_of_week: 5, start_time: '09:30', end_time: '10:15', is_active: true, reminder_minutes: 30 },
  // Thứ 6
  { id: 'sch-13', class_id: 'default', subject_name: 'Toán học', day_of_week: 6, start_time: '07:30', end_time: '08:15', is_active: true, reminder_minutes: 30 },
  { id: 'sch-14', class_id: 'default', subject_name: 'Giáo dục thể chất', day_of_week: 6, start_time: '08:30', end_time: '09:15', is_active: true, reminder_minutes: 15 },
  { id: 'sch-15', class_id: 'default', subject_name: 'Hoạt động trải nghiệm', day_of_week: 6, start_time: '09:30', end_time: '10:15', is_active: true, reminder_minutes: 30 }
];

export const getLocalSchedules = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_SEED_SCHEDULES;
};

export const saveLocalSchedules = (list) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
};

export const fetchClassSchedules = async (classId) => {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('class_schedules').select('*').order('start_time', { ascending: true });
      if (classId && classId !== 'all' && classId !== 'default') {
        query = query.eq('class_id', classId);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn('Fetch schedules error from Supabase, using local fallback:', err);
    }
  }
  return getLocalSchedules();
};

export const createSchedule = async (scheduleData) => {
  const newSchedule = {
    id: `sch-${Date.now()}`,
    ...scheduleData,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('class_schedules')
        .insert({
          class_id: scheduleData.class_id,
          subject_name: scheduleData.subject_name,
          day_of_week: scheduleData.day_of_week,
          start_time: scheduleData.start_time,
          end_time: scheduleData.end_time,
          teacher_id: scheduleData.teacher_id || null,
          is_active: scheduleData.is_active ?? true,
          reminder_minutes: scheduleData.reminder_minutes ?? 30
        })
        .select('*')
        .single();

      if (!error && data) {
        return { success: true, data };
      }
    } catch (err) {
      console.warn('Supabase schedule insert error:', err);
    }
  }

  // Fallback to local storage
  const current = getLocalSchedules();
  const updated = [...current, newSchedule];
  saveLocalSchedules(updated);
  return { success: true, data: newSchedule };
};

export const updateSchedule = async (id, updates) => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('class_schedules')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (!error && data) {
        return { success: true, data };
      }
    } catch (err) {
      console.warn('Supabase update schedule error:', err);
    }
  }

  const current = getLocalSchedules();
  const updated = current.map(item => item.id === id ? { ...item, ...updates } : item);
  saveLocalSchedules(updated);
  return { success: true, data: updated.find(i => i.id === id) };
};

export const deleteSchedule = async (id) => {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('class_schedules').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete schedule error:', err);
    }
  }

  const current = getLocalSchedules();
  const updated = current.filter(item => item.id !== id);
  saveLocalSchedules(updated);
  return { success: true };
};

/**
 * Tính toán môn học đang diễn ra trong ngày hôm nay và môn học sắp tới
 */
export const getOngoingAndUpcoming = (schedules) => {
  const now = new Date();
  const jsDay = now.getDay();
  const currentDayOfWeek = jsDay === 0 ? 8 : jsDay + 1; // 2: T2 -> 8: CN

  const nowHours = now.getHours();
  const nowMinutes = now.getMinutes();
  const nowTotalMinutes = nowHours * 60 + nowMinutes;

  const todaySchedules = schedules
    .filter(s => s.day_of_week === currentDayOfWeek && s.is_active)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  let ongoing = null;
  let upcoming = null;

  for (const s of todaySchedules) {
    const [startH, startM] = s.start_time.split(':').map(Number);
    const [endH, endM] = s.end_time.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    // Đang diễn ra
    if (nowTotalMinutes >= startTotal && nowTotalMinutes <= endTotal) {
      ongoing = s;
      break;
    }

    // Sắp diễn ra trong vòng reminder_minutes (mặc định 30 phút)
    const reminderLimit = s.reminder_minutes || 30;
    if (startTotal > nowTotalMinutes && (startTotal - nowTotalMinutes) <= reminderLimit) {
      if (!upcoming) upcoming = s;
    }
  }

  return {
    currentDayOfWeek,
    todaySchedules,
    ongoing,
    upcoming
  };
};
