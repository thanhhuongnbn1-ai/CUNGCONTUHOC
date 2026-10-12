import { supabase, isSupabaseConfigured } from './supabase';

// Bộ dữ liệu ngân hàng câu hỏi mặc định phong phú (Pre-seeded Question Bank)
export const DEFAULT_QUESTION_BANK = [
  // LỚP 1 - TOÁN HỌC
  {
    id: 'qb_math1_01',
    grade_slug: 'lop-1',
    subject: 'Toán học',
    difficulty: 'easy',
    type: 'single_choice',
    question: 'Bé đếm có 5 quả cam 🍊, mẹ cho thêm 2 quả nữa. Hỏi bé có tất cả bao nhiêu quả cam?',
    options: ['6 quả', '7 quả', '8 quả', '9 quả'],
    correctIndex: 1,
    explanation: '5 + 2 = 7 quả cam.'
  },
  {
    id: 'qb_math1_02',
    grade_slug: 'lop-1',
    subject: 'Toán học',
    difficulty: 'easy',
    type: 'single_choice',
    question: 'Số liền sau của số 9 là số nào?',
    options: ['8', '10', '11', '7'],
    correctIndex: 1,
    explanation: 'Số liền sau số 9 là số 10.'
  },
  {
    id: 'qb_math1_03',
    grade_slug: 'lop-1',
    subject: 'Toán học',
    difficulty: 'medium',
    type: 'multiple_choice',
    question: 'Những phép tính nào dưới đây có kết quả bằng 10? (Chọn tất cả đáp án đúng)',
    options: ['6 + 4', '7 + 3', '5 + 4', '2 + 8'],
    correctIndices: [0, 1, 3],
    explanation: '6 + 4 = 10, 7 + 3 = 10, 2 + 8 = 10 (còn 5 + 4 = 9).'
  },
  {
    id: 'qb_math1_04',
    grade_slug: 'lop-1',
    subject: 'Toán học',
    difficulty: 'medium',
    type: 'true_false',
    question: 'Xét tính Đúng / Sai của các phép so sánh sau:',
    items: [
      { id: 'tf_1', statement: '8 > 5', correct: true },
      { id: 'tf_2', statement: '3 + 4 < 6', correct: false },
      { id: 'tf_3', statement: '10 - 2 = 8', correct: true }
    ],
    explanation: '8 lớn hơn 5 là Đúng. 3 + 4 = 7 > 6 nên khẳng định nhỏ hơn là Sai. 10 - 2 = 8 là Đúng.'
  },
  {
    id: 'qb_math1_05',
    grade_slug: 'lop-1',
    subject: 'Toán học',
    difficulty: 'hard',
    type: 'fill_in_the_blank',
    question: 'Điền số thích hợp vào chỗ trống:',
    template: 'Nếu $10 - \\{blank1\\} = 4$ thì giá trị cần điền là \\{blank2\\}.',
    blanks: [
      { id: 'blank1', label: 'Số trừ', acceptableAnswers: ['6'], hint: '10 trừ mấy bằng 4?' },
      { id: 'blank2', label: 'Số kết luận', acceptableAnswers: ['6'], hint: 'Cùng giá trị trên' }
    ],
    explanation: 'Ta có 10 - 6 = 4.'
  },

  // LỚP 2, 3, 4, 5 & CÔNG THỨC TOÁN LATEX
  {
    id: 'qb_math_latex_01',
    grade_slug: 'lop-4',
    subject: 'Toán học',
    difficulty: 'easy',
    type: 'single_choice',
    question: 'Rút gọn phân số: $\\frac{12}{18}$. Phân số tối giản là:',
    options: ['$\\frac{1}{2}$', '$\\frac{2}{3}$', '$\\frac{3}{4}$', '$\\frac{4}{5}$'],
    correctIndex: 1,
    explanation: 'Chia cả tử và mẫu cho 6: $\\frac{12:6}{18:6} = \\frac{2}{3}$.'
  },
  {
    id: 'qb_math_latex_02',
    grade_slug: 'lop-4',
    subject: 'Toán học',
    difficulty: 'medium',
    type: 'single_choice',
    question: 'Tính giá trị của biểu thức: $S = \\frac{1}{2} + \\frac{1}{4} + \\frac{1}{8}$. Kết quả là:',
    options: ['$\\frac{7}{8}$', '$\\frac{5}{8}$', '$\\frac{3}{4}$', '$\\frac{9}{8}$'],
    correctIndex: 0,
    explanation: 'Quy đồng mẫu số 8: $\\frac{4 + 2 + 1}{8} = \\frac{7}{8}$.'
  },
  {
    id: 'qb_math_latex_03',
    grade_slug: 'lop-5',
    subject: 'Toán học',
    difficulty: 'hard',
    type: 'single_choice',
    question: 'Tính diện tích hình tròn có bán kính $r = 5\\text{ cm}$ (lấy $\\pi = 3.14$): $S = \\pi \\times r^2$.',
    options: ['31.4 cm²', '78.5 cm²', '62.8 cm²', '15.7 cm²'],
    correctIndex: 1,
    explanation: '$S = 3.14 \\times 5^2 = 3.14 \\times 25 = 78.5\\text{ cm}^2$.'
  },

  // TIẾNG VIỆT & TỰ NHIÊN
  {
    id: 'qb_viet_01',
    grade_slug: 'lop-1',
    subject: 'Tiếng Việt',
    difficulty: 'easy',
    type: 'single_choice',
    question: 'Từ nào sau đây viết đúng chính tả?',
    options: ['Nước non', 'Lước lon', 'Nước lon', 'Lước non'],
    correctIndex: 0,
    explanation: '"Nước non" là từ viết đúng chính tả tiếng Việt.'
  },
  {
    id: 'qb_viet_02',
    grade_slug: 'lop-3',
    subject: 'Tiếng Việt',
    difficulty: 'medium',
    type: 'multiple_choice',
    question: 'Những câu nào sau đây có hình ảnh so sánh? (Chọn tất cả đáp án đúng)',
    options: [
      'Mặt trời đỏ rực như quả cầu lửa.',
      'Bé đang ngồi học bài chăm chỉ.',
      'Trăng tròn như cái đĩa bạc.',
      'Gió thổi mát rượi qua hàng cây.'
    ],
    correctIndices: [0, 2],
    explanation: 'Các câu có từ so sánh "như": quả cầu lửa, cái đĩa bạc.'
  },
  {
    id: 'qb_science_01',
    grade_slug: 'lop-4',
    subject: 'Khoa học',
    difficulty: 'easy',
    type: 'true_false',
    question: 'Xét tính Đúng / Sai của các hiện tượng tự nhiên:',
    items: [
      { id: 'tf_s1', statement: 'Nước tồn tại ở 3 thể: rắn, lỏng, khí.', correct: true },
      { id: 'tf_s2', statement: 'Không khí không có trọng lượng và không chiếm chỗ.', correct: false },
      { id: 'tf_s3', statement: 'Thực vật cần ánh sáng mặt trời để quang hợp.', correct: true }
    ],
    explanation: 'Không khí có khối lượng và chiếm thể tích.'
  },
  {
    id: 'qb_essay_01',
    grade_slug: 'lop-3',
    subject: 'Tiếng Việt',
    difficulty: 'hard',
    type: 'essay',
    question: 'Em hãy viết một đoạn văn (4 - 6 câu) kể về một buổi sáng đẹp trời trên quê hương em.',
    maxScore: 10,
    guidelines: 'Tiêu chí: Câu văn miêu tả sinh động, dùng từ gợi cảm, không sai chính tả.',
    sampleAnswer: 'Buổi sáng quê em thật thanh bình. Khi ông mặt trời vừa ló rạng, những giọt sương mai long lanh đọng trên ngọn cỏ...'
  }
];

export const questionBankService = {
  /**
   * Get all questions for grade & subject
   */
  async getQuestions({ gradeSlug, subject, difficulty }) {
    let list = [...DEFAULT_QUESTION_BANK];

    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('question_bank').select('*');
        if (gradeSlug) query = query.eq('grade_slug', gradeSlug);
        if (subject && subject !== 'Tất cả') query = query.eq('subject', subject);
        if (difficulty && difficulty !== 'all') query = query.eq('difficulty', difficulty);

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          list = data;
        }
      } catch (err) {
        console.warn('Load question_bank from Supabase error:', err);
      }
    }

    // Filter local list
    return list.filter(q => {
      const matchGrade = !gradeSlug || q.grade_slug === gradeSlug;
      const matchSub = !subject || subject === 'Tất cả' || q.subject === subject;
      const matchDiff = !difficulty || difficulty === 'all' || q.difficulty === difficulty;
      return matchGrade && matchSub && matchDiff;
    });
  },

  /**
   * Save a question to question bank
   */
  async addQuestion(question) {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('question_bank').insert(question);
      } catch (err) {
        console.warn('Save to question bank error:', err);
      }
    }
    DEFAULT_QUESTION_BANK.push(question);
    return question;
  },

  /**
   * Bulk insert questions into question bank
   */
  async addBulkQuestions(questions) {
    if (isSupabaseConfigured() && questions.length > 0) {
      try {
        await supabase.from('question_bank').insert(questions);
      } catch (err) {
        console.warn('Bulk save to question bank error:', err);
      }
    }
    DEFAULT_QUESTION_BANK.push(...questions);
    return questions.length;
  },

  /**
   * TẠO ĐỀ THI NGẪU NHIÊN:
   * Rút ngẫu nhiên X câu hỏi từ Ngân hàng câu hỏi theo độ khó (Dễ / Trung bình / Khó)
   */
  async generateRandomExam({
    gradeSlug = 'lop-1',
    subject = 'Toán học',
    easyCount = 3,
    mediumCount = 2,
    hardCount = 1,
    title = 'Đề Thi Ngẫu Nhiên Từ Ngân Hàng Câu Hỏi',
    timeLimitMinutes = 20
  }) {
    // 1. Fetch available bank questions for this grade & subject
    const allQuestions = await this.getQuestions({ gradeSlug, subject });

    // Fallback: if not enough in this specific grade, use all questions for that subject
    const subjectQuestions = allQuestions.length > 0
      ? allQuestions
      : DEFAULT_QUESTION_BANK.filter(q => !subject || q.subject === subject);

    // Filter by difficulty
    const easyPool = subjectQuestions.filter(q => q.difficulty === 'easy');
    const mediumPool = subjectQuestions.filter(q => q.difficulty === 'medium');
    const hardPool = subjectQuestions.filter(q => q.difficulty === 'hard');
    const restPool = subjectQuestions.filter(q => !['easy', 'medium', 'hard'].includes(q.difficulty));

    // Helper to sample random N items from an array
    const sampleRandom = (arr, count) => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, Math.min(count, shuffled.length));
    };

    const pickedEasy = sampleRandom(easyPool.length > 0 ? easyPool : subjectQuestions, easyCount);
    const pickedMedium = sampleRandom(mediumPool.length > 0 ? mediumPool : subjectQuestions, mediumCount);
    const pickedHard = sampleRandom(hardPool.length > 0 ? hardPool : subjectQuestions, hardCount);

    // Merge and deduplicate by id
    const seenIds = new Set();
    const finalQuestions = [];

    [...pickedEasy, ...pickedMedium, ...pickedHard].forEach(q => {
      if (!seenIds.has(q.id)) {
        seenIds.add(q.id);
        finalQuestions.push({
          ...q,
          id: `rand_exam_${Date.now()}_${finalQuestions.length + 1}`
        });
      }
    });

    // If still less than requested total, backfill from remaining pool
    const targetTotal = easyCount + mediumCount + hardCount;
    if (finalQuestions.length < targetTotal) {
      const remaining = subjectQuestions.filter(q => !seenIds.has(q.id));
      const extra = sampleRandom(remaining, targetTotal - finalQuestions.length);
      extra.forEach(q => {
        seenIds.add(q.id);
        finalQuestions.push({
          ...q,
          id: `rand_exam_${Date.now()}_${finalQuestions.length + 1}`
        });
      });
    }

    return {
      type: 'multi_type_exam',
      title: title || `Đề Thi Ngẫu Nhiên (${finalQuestions.length} Câu - ${subject})`,
      description: `Đề thi tự động rút từ Ngân hàng câu hỏi gồm: ${pickedEasy.length} câu Dễ, ${pickedMedium.length} câu Trung bình, ${pickedHard.length} câu Khó.`,
      timeLimitMinutes: Number(timeLimitMinutes) || 20,
      questions: finalQuestions,
      shuffle_questions: true,
      shuffle_options: true
    };
  }
};

export default questionBankService;
