import { supabase, isSupabaseConfigured } from './supabase';

// Local storage fallback key for offline / demo mode
const LOCAL_STORAGE_ASSIGNMENTS = 'edtech_assignments_local';

export const assignmentService = {
  /**
   * Create an assignment for whole class, specific group, or individual students
   */
  async createAssignment({
    materialId,
    materialTitle = 'Bài tập/Đề thi',
    materialType = 'quiz',
    classId,
    className = 'Lớp 1A',
    assignedBy,
    teacherName = 'Giáo viên',
    targetType = 'all', // 'all' | 'group' | 'individual'
    targetGroupName = '', // e.g. 'Nhóm Cần Phụ Đạo', 'Nhóm Bồi Dưỡng'
    studentIds = [], // Array of student UUIDs
    studentNames = [], // Array of student names
    deadline = null,
    note = ''
  }) {
    const newAssignment = {
      id: `assign_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      material_id: materialId,
      material_title: materialTitle,
      material_type: materialType,
      class_id: classId,
      class_name: className,
      assigned_by: assignedBy || null,
      teacher_name: teacherName,
      target_type: targetType,
      target_group_name: targetGroupName || null,
      student_ids: studentIds || [],
      student_names: studentNames || [],
      deadline: deadline || null,
      note: note || '',
      created_at: new Date().toISOString()
    };

    // 1. Save to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('assignments')
          .insert({
            material_id: materialId,
            class_id: classId,
            assigned_by: assignedBy || null,
            target_type: targetType,
            target_group_name: targetGroupName || null,
            student_ids: studentIds,
            deadline: deadline || null,
            note: note || ''
          })
          .select();

        if (!error && data && data[0]) {
          newAssignment.id = data[0].id;
        }

        // Send notifications
        const notificationTitle = `📢 Bài tập mới: ${materialTitle}`;
        const notificationMsg = targetType === 'all'
          ? `Thầy/Cô ${teacherName} đã giao bài "${materialTitle}" cho toàn thể lớp ${className}. Hạn nộp: ${deadline ? new Date(deadline).toLocaleString('vi-VN') : 'Không giới hạn'}.`
          : targetType === 'group'
          ? `Thầy/Cô đã giao nhiệm vụ cho [${targetGroupName}]: "${materialTitle}".`
          : `Thầy/Cô đã giao bài tập riêng cho em: "${materialTitle}". Hãy cố gắng hoàn thành nhé!`;

        if (targetType === 'individual' && studentIds.length > 0) {
          for (const sId of studentIds) {
            await supabase.from('notifications').insert({
              user_id: sId,
              title: notificationTitle,
              message: notificationMsg,
              type: 'assignment'
            }).catch(() => {});
          }
        }
      } catch (err) {
        console.warn('Save assignment to Supabase error:', err);
      }
    }

    // 2. Save to Local Storage fallback
    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ASSIGNMENTS) || '[]');
      existing.unshift(newAssignment);
      localStorage.setItem(LOCAL_STORAGE_ASSIGNMENTS, JSON.stringify(existing));
    } catch (_) {}

    return newAssignment;
  },

  /**
   * Get assignments by class
   */
  async getAssignmentsByClass(classId) {
    if (isSupabaseConfigured() && classId) {
      try {
        const { data, error } = await supabase
          .from('assignments')
          .select('*, materials(title, content_type, subject)')
          .eq('class_id', classId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map(item => ({
            ...item,
            material_title: item.materials?.title || 'Bài tập',
            material_type: item.materials?.content_type || 'quiz'
          }));
        }
      } catch (err) {
        console.warn('Fetch assignments error:', err);
      }
    }

    // Fallback local storage
    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ASSIGNMENTS) || '[]');
      if (classId) return existing.filter(a => a.class_id === classId);
      return existing;
    } catch (_) {
      return [];
    }
  },

  /**
   * Get assignments applicable for a specific student
   */
  async getAssignmentsForStudent(studentId, classId) {
    const list = await this.getAssignmentsByClass(classId);
    return list.filter(a => {
      // 1. Assigned to whole class
      if (a.target_type === 'all') return true;
      // 2. Assigned to individual
      if (a.target_type === 'individual' && (a.student_ids || []).includes(studentId)) return true;
      // 3. Assigned to group (matches student if in group)
      if (a.target_type === 'group' && (a.student_ids || []).includes(studentId)) return true;
      return false;
    });
  }
};

export default assignmentService;
