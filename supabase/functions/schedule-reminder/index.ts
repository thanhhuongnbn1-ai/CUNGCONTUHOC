// Supabase Edge Function: schedule-reminder
// Chạy định kỳ (Cron Job mỗi 15 phút) để quét bảng class_schedules,
// tìm các môn học sắp diễn ra trong 30 phút tới và gửi thông báo In-app cho Giáo viên & Học sinh.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

interface ClassSchedule {
  id: string;
  class_id: string;
  subject_name: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  teacher_id: string | null;
  is_active: boolean;
  reminder_minutes: number;
}

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Missing Supabase environment variables' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Tính toán thời gian hiện tại theo Giờ Việt Nam (UTC+7)
    const nowUtc = new Date();
    const vietnamOffsetMs = 7 * 60 * 60 * 1000;
    const nowVn = new Date(nowUtc.getTime() + vietnamOffsetMs);

    // Chuyển đổi ngày trong tuần: JS getDay() trả về 0 (CN), 1 (T2), ..., 6 (T7)
    // Quy ước hệ thống: 2 (Thứ 2) -> 7 (Thứ 7), 8 (Chủ nhật)
    const jsDay = nowVn.getUTCDay();
    const dayOfWeek = jsDay === 0 ? 8 : jsDay + 1;

    // Giờ và phút hiện tại (VN)
    const currentHours = nowVn.getUTCHours();
    const currentMinutes = nowVn.getUTCMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    console.log(`[SCHEDULE CRON] Scanning schedules for Day ${dayOfWeek} at ${currentHours}:${currentMinutes} (VN Time)`);

    // 1. Lấy danh sách lịch học đang kích hoạt (is_active = true) của ngày hôm nay
    const { data: schedules, error: scheduleError } = await supabase
      .from('class_schedules')
      .select('*')
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true);

    if (scheduleError) {
      throw scheduleError;
    }

    const notificationsToCreate = [];
    let notifiedCount = 0;

    for (const schedule of (schedules as ClassSchedule[]) || []) {
      // Parse start_time (định dạng HH:mm hoặc HH:mm:ss)
      const [sHour, sMin] = schedule.start_time.split(':').map(Number);
      const scheduleTotalMinutes = sHour * 60 + sMin;

      // Khoảng cách thời gian từ hiện tại đến giờ học
      const diffMinutes = scheduleTotalMinutes - currentTotalMinutes;
      const reminderWindow = schedule.reminder_minutes || 30;

      // Nếu môn học diễn ra trong vòng 0 đến reminderWindow (mặc định 30 phút tới)
      if (diffMinutes > 0 && diffMinutes <= reminderWindow) {
        console.log(`🔔 Found upcoming schedule: ${schedule.subject_name} starting at ${schedule.start_time} (in ${diffMinutes}m)`);

        const messageContent = `Sắp đến giờ học môn ${schedule.subject_name}, lớp bắt đầu lúc ${schedule.start_time}. Hãy chuẩn bị nhé!`;

        // Lấy danh sách học sinh thuộc lớp class_id
        const { data: members } = await supabase
          .from('class_members')
          .select('student_id')
          .eq('class_id', schedule.class_id);

        const recipientIds = new Set<string>();

        // Thêm giáo viên phụ trách (nếu có)
        if (schedule.teacher_id) {
          recipientIds.add(schedule.teacher_id);
        }

        // Thêm tất cả học sinh trong lớp
        if (members && members.length > 0) {
          members.forEach((m: { student_id: string }) => recipientIds.add(m.student_id));
        }

        // Tạo thông báo cho từng người nhận
        for (const userId of recipientIds) {
          notificationsToCreate.push({
            user_id: userId,
            title: `Nhắc lịch: Môn ${schedule.subject_name}`,
            message: messageContent,
            type: 'schedule_reminder',
            is_read: false,
            created_at: new Date().toISOString()
          });
          notifiedCount++;
        }
      }
    }

    // 2. Chèn thông báo hàng loạt vào bảng notifications
    if (notificationsToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notificationsToCreate);

      if (insertError) {
        console.error('Failed to insert notifications:', insertError);
      } else {
        console.log(`✅ Dispatched ${notificationsToCreate.length} reminders successfully.`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        checkedSchedules: schedules?.length || 0,
        remindersDispatched: notifiedCount,
        timestamp: nowVn.toISOString()
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('Error in schedule-reminder function:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
