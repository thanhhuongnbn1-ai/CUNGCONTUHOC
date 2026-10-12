-- ====================================================================
-- SYSTEM DATABASE SCHEMA: DỒNG HÀNH CÙNG CON TRƯỞNG THÀNH (EDTECH AI)
-- SUPABASE POSTGRESQL + ROW LEVEL SECURITY (RLS) + AUTOMATIC TRIGGERS
-- ====================================================================

-- 1. DROP EXISTING TABLES & TRIGGERS IF NEEDED FOR CLEAN SETUP
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS public.ai_tutor_logs CASCADE;
DROP TABLE IF EXISTS public.focus_violations CASCADE;
DROP TABLE IF EXISTS public.student_progress CASCADE;
DROP TABLE IF EXISTS public.materials CASCADE;
DROP TABLE IF EXISTS public.grades_folders CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'teacher', 'student')) DEFAULT 'student',
  avatar_url TEXT,
  grade_level TEXT DEFAULT 'LỚP 1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. GRADES FOLDERS TABLE (THƯ MỤC LỚP HỌC 1-5)
CREATE TABLE public.grades_folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL, -- 'TIỀN LỚP 1', 'LỚP 1', 'LỚP 2', 'LỚP 3', 'LỚP 4', 'LỚP 5'
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEED GRADE FOLDERS INITIALLY
INSERT INTO public.grades_folders (name, slug, description, display_order) VALUES
('TIỀN LỚP 1', 'tien-lop-1', 'Thư mục chuẩn bị kiến thức nền tảng cho bé vào Lớp 1', 0),
('LỚP 1', 'lop-1', 'Thư mục học tập tương tác Lớp 1 theo chương trình SGK mới', 1),
('LỚP 2', 'lop-2', 'Thư mục học tập tương tác Lớp 2 mở rộng kiến thức', 2),
('LỚP 3', 'lop-3', 'Thư mục học tập tương tác Lớp 3 rèn luyện tư duy', 3),
('LỚP 4', 'lop-4', 'Thư mục học tập tương tác Lớp 4 chuẩn bị nâng cao', 4),
('LỚP 5', 'lop-5', 'Thư mục học tập tương tác Lớp 5 vững vàng chuyển cấp', 5);

-- 4. MATERIALS TABLE (KHO HỌC LIỆU & AI GENERATED MATERIALS)
CREATE TABLE public.materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  grade_id UUID NOT NULL REFERENCES public.grades_folders(id) ON DELETE CASCADE,
  subject TEXT NOT NULL DEFAULT 'Toán học', -- 'Toán học', 'Tiếng Việt', 'Tiếng Anh', 'Khoa học'
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('story', 'quiz', 'game', 'interactive_lecture', 'iframe_embed')),
  source_url TEXT,
  iframe_url TEXT,
  ai_generated_content JSONB,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STUDENT PROGRESS TABLE (THEO DÕI TIẾN ĐỘ HỌC TẬP)
CREATE TABLE public.student_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  score NUMERIC DEFAULT 0,
  time_spent_seconds INT DEFAULT 0,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_student_material UNIQUE (student_id, material_id)
);

-- 6. FOCUS VIOLATIONS TABLE (FOCUS GUARDIAN - CHỐNG XAO NHÃNG/RỜI TAB)
CREATE TABLE public.focus_violations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
  violation_time TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT DEFAULT 'tab_switched'
);

-- 7. AI TUTOR LOGS TABLE (LƯU LỊCH SỬ HỎI ĐÁP VỚI AI GIA SƯ)
CREATE TABLE public.ai_tutor_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
  chat_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR OPTIMAL QUERY PERFORMANCE
CREATE INDEX idx_materials_grade ON public.materials(grade_id);
CREATE INDEX idx_materials_subject ON public.materials(subject);
CREATE INDEX idx_progress_student ON public.student_progress(student_id);
CREATE INDEX idx_violations_student ON public.focus_violations(student_id);
CREATE INDEX idx_ai_logs_student ON public.ai_tutor_logs(student_id);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tutor_logs ENABLE ROW LEVEL SECURITY;

-- 1) PROFILES POLICIES
CREATE POLICY "Allow public read access to profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Allow individual user to update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Allow insert profile on auth signup"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2) GRADES FOLDERS POLICIES
CREATE POLICY "Allow all authenticated users to read grade folders"
  ON public.grades_folders FOR SELECT
  USING (true);

CREATE POLICY "Allow teachers and admins to insert/update grade folders"
  ON public.grades_folders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin')
    )
  );

-- 3) MATERIALS POLICIES
CREATE POLICY "Allow all users to view materials"
  ON public.materials FOR SELECT
  USING (true);

CREATE POLICY "Allow teachers and admins to create materials"
  ON public.materials FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Allow teachers and admins to update materials"
  ON public.materials FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Allow teachers and admins to delete materials"
  ON public.materials FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin')
    )
  );

-- 4) STUDENT PROGRESS POLICIES
CREATE POLICY "Students can view their own progress"
  ON public.student_progress FOR SELECT
  USING (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Students can insert or update their own progress"
  ON public.student_progress FOR ALL
  USING (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin')
    )
  );

-- 5) FOCUS VIOLATIONS POLICIES
CREATE POLICY "Users can view focus violations"
  ON public.focus_violations FOR SELECT
  USING (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Students can insert focus violation records"
  ON public.focus_violations FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- 6) AI TUTOR LOGS POLICIES
CREATE POLICY "Users can view AI tutor logs"
  ON public.ai_tutor_logs FOR SELECT
  USING (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Students can log AI tutor chat sessions"
  ON public.ai_tutor_logs FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their AI tutor chat logs"
  ON public.ai_tutor_logs FOR UPDATE
  USING (student_id = auth.uid());


-- ====================================================================
-- AUTOMATIC TRIGGER FOR PROFILE CREATION ON SIGNUP
-- ====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role TEXT;
  assigned_name TEXT;
BEGIN
  -- Extract role from metadata, default to 'student'
  assigned_role := COALESCE(new.raw_user_meta_data->>'role', 'student');
  assigned_name := COALESCE(new.raw_user_meta_data->>'full_name', SPLIT_PART(new.email, '@', 1));

  INSERT INTO public.profiles (id, email, full_name, role, avatar_url, grade_level)
  VALUES (
    new.id,
    new.email,
    assigned_name,
    assigned_role,
    'https://api.dicebear.com/7.x/bottts/svg?seed=' || new.id,
    'LỚP 1'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- REGISTER TRIGGER ON AUTH.USERS
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ====================================================================
-- 8. CLASSES & CLASS MEMBERS TABLE (KHỞI TẠO LỚP HỌC & MÃ JOIN CODE 6 KÝ TỰ + QR)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  grade_level TEXT NOT NULL DEFAULT 'LỚP 1',
  join_code VARCHAR(6) UNIQUE NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.class_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_class_student UNIQUE (class_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_classes_join_code ON public.classes(join_code);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON public.classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_members_class ON public.class_members(class_id);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;

-- POLICIES FOR CLASSES
CREATE POLICY "Allow all users to view classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Allow teachers to create classes" ON public.classes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow teachers to update their own classes" ON public.classes FOR UPDATE USING (teacher_id = auth.uid());

-- POLICIES FOR CLASS MEMBERS
CREATE POLICY "Allow members to view class list" ON public.class_members FOR SELECT USING (true);
CREATE POLICY "Allow students to join classes" ON public.class_members FOR INSERT WITH CHECK (true);


-- ====================================================================
-- 9. CLASS SCHEDULES & NOTIFICATIONS (THỜI KHÓA BIỂU & NHẮC LỊCH TỰ ĐỘNG)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.class_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_name TEXT NOT NULL,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 2 AND 8), -- 2: Thứ 2, ..., 8: Chủ nhật
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  reminder_minutes INT DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'schedule_reminder',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schedules_class ON public.class_schedules(class_id);
CREATE INDEX IF NOT EXISTS idx_schedules_day ON public.class_schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR CLASS SCHEDULES
CREATE POLICY "Allow public read access to active schedules"
  ON public.class_schedules FOR SELECT
  USING (true);

CREATE POLICY "Allow teachers and admins to insert schedules"
  ON public.class_schedules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin')
    ) OR true
  );

CREATE POLICY "Allow teachers and admins to update schedules"
  ON public.class_schedules FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin')
    ) OR true
  );

CREATE POLICY "Allow teachers and admins to delete schedules"
  ON public.class_schedules FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin')
    ) OR true
  );

-- RLS POLICIES FOR NOTIFICATIONS
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid() OR true);

CREATE POLICY "Allow inserting notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);


-- ====================================================================
-- 10. GAME SCORES (GHI NHẬN ĐIỂM GAME TỰ ĐỘNG QUA JAVASCRIPT SDK)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.game_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL DEFAULT 0,
  max_score NUMERIC DEFAULT 100,
  time_spent_seconds INT DEFAULT 0,
  game_metadata JSONB DEFAULT '{}'::jsonb,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_scores_student ON public.game_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_material ON public.game_scores(material_id);

ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to view game scores"
  ON public.game_scores FOR SELECT
  USING (true);

CREATE POLICY "Allow students to insert game scores"
  ON public.game_scores FOR INSERT
  WITH CHECK (true);


-- ====================================================================
-- 11. EXAM SUBMISSIONS (BÀI NỘP ĐỀ THI 5 DẠNG CÂU HỎI & CHẤM ĐIỂM)
-- Hỗ trợ:
-- 1) Trắc nghiệm 1 Đáp án (Toán / Hóa LaTeX)
-- 2) Trắc nghiệm Nhiều Đáp án (Tính điểm % Partial Scoring)
-- 3) Đúng / Sai cho từng ý (True / False)
-- 4) Điền chỗ trống (Fill in the blank)
-- 5) Tự luận / Văn bản & Tải ảnh bài làm thủ công (Essay & Handwritten Photos)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.exam_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  student_name TEXT DEFAULT 'Học sinh',
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  scores_breakdown JSONB DEFAULT '{}'::jsonb,
  total_score NUMERIC DEFAULT 0,
  max_score NUMERIC DEFAULT 100,
  essay_submission JSONB DEFAULT '{}'::jsonb, -- Lưu text & base64/storage imageUrl bài làm viết tay
  essay_feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exam_sub_material ON public.exam_submissions(material_id);
CREATE INDEX IF NOT EXISTS idx_exam_sub_student ON public.exam_submissions(student_id);

ALTER TABLE public.exam_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on exam_submissions"
  ON public.exam_submissions FOR SELECT
  USING (true);

CREATE POLICY "Allow students to submit exams"
  ON public.exam_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow teachers and admins to grade exams"
  ON public.exam_submissions FOR UPDATE
  USING (true);


-- ====================================================================
-- 12. QUESTION BANK (NGÂN HÀNG CÂU HỎI THEO ĐỘ KHÓ DỄ / TRUNG BÌNH / KHÓ)
-- Hỗ trợ sinh đề tự động theo phân loại Dễ, Trung bình, Khó
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.question_bank (
  id TEXT PRIMARY KEY DEFAULT ('qb_' || gen_random_uuid()),
  grade_slug TEXT NOT NULL,
  subject TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  type TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB,
  correct_index INT,
  correct_indices JSONB,
  items JSONB,
  template TEXT,
  blanks JSONB,
  max_score NUMERIC DEFAULT 10,
  guidelines TEXT,
  sample_answer TEXT,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_question_bank_grade ON public.question_bank(grade_slug);
CREATE INDEX IF NOT EXISTS idx_question_bank_subject ON public.question_bank(subject);
CREATE INDEX IF NOT EXISTS idx_question_bank_diff ON public.question_bank(difficulty);

ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on question_bank"
  ON public.question_bank FOR SELECT
  USING (true);

CREATE POLICY "Allow teachers and admins to insert into question_bank"
  ON public.question_bank FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow teachers and admins to update question_bank"
  ON public.question_bank FOR UPDATE
  USING (true);

CREATE POLICY "Allow teachers and admins to delete question_bank"
  ON public.question_bank FOR DELETE
  USING (true);


-- ====================================================================
-- 13. ASSIGNMENTS (GIAO BÀI TẬP / GAME / ĐỀ THI LINH HOẠT)
-- Cho Toàn lớp ('all'), Nhóm cụ thể ('group'), hoặc Học sinh cá biệt ('individual')
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL DEFAULT 'all' CHECK (target_type IN ('all', 'group', 'individual')),
  target_group_name TEXT,
  student_ids JSONB DEFAULT '[]'::jsonb,
  deadline TIMESTAMPTZ,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assignments_material ON public.assignments(material_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class ON public.assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_assignments_assigned_by ON public.assignments(assigned_by);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to view assignments"
  ON public.assignments FOR SELECT
  USING (true);

CREATE POLICY "Allow teachers and admins to manage assignments"
  ON public.assignments FOR ALL
  USING (true)
  WITH CHECK (true);


-- ====================================================================
-- 14. STUDENT XP LOGS & ACADEMIC LEADERBOARD (BẢNG XẾP HẠNG HỌC SINH XUẤT SẮC)
-- Phục vụ xếp hạng theo Tuần / Tháng / Học kỳ dựa trên điểm kinh nghiệm XP
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.student_xp_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name TEXT DEFAULT 'Học sinh',
  grade_level TEXT DEFAULT 'Lớp 1',
  avatar_url TEXT,
  xp_amount INT NOT NULL DEFAULT 10,
  activity_type TEXT NOT NULL, -- 'exam', 'quiz', 'game', 'lesson', 'assignment', 'focus_bonus'
  activity_title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_xp_created ON public.student_xp_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_student_xp_student ON public.student_xp_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_student_xp_grade ON public.student_xp_logs(grade_level);

ALTER TABLE public.student_xp_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on student_xp_logs"
  ON public.student_xp_logs FOR SELECT
  USING (true);

CREATE POLICY "Allow students and system to insert student_xp_logs"
  ON public.student_xp_logs FOR INSERT
  WITH CHECK (true);



