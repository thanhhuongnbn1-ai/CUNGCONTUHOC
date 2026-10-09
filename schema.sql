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
