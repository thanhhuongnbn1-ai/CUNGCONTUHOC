const supabaseUrl = 'https://niedlctgtghfwrgrcmso.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZWRsY3RndGdoZndyZ3JjbXNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTQ1OTgxMywiZXhwIjoyMTA3MDM1ODEzfQ.3rXYi83aY4jtFDfVfop0tnrn8ZPEskFt-oz1FmQ0eB0';

const sampleExam = {
  title: 'Đề Khảo Sát Năng Lực 5 Dạng Câu Hỏi SGK (Toán, Hóa, Tiếng Việt)',
  description: 'Bộ đề thi chuẩn 5 dạng câu hỏi: Trắc nghiệm LaTeX, nhiều đáp án tính % điểm, đúng/sai, điền khuyết và tự luận tải ảnh.',
  timeLimitMinutes: 20,
  questions: [
    {
      id: 'q1',
      type: 'single_choice',
      question: 'Tính giá trị của biểu thức: $A = \\frac{15}{3} + \\sqrt{16} - 2^2$. Giá trị đúng của $A$ là:',
      options: [
        '$A = 3$',
        '$A = 5$',
        '$A = 7$',
        '$A = 9$'
      ],
      correctIndex: 1,
      explanation: 'Ta có: $\\frac{15}{3} = 5$, $\\sqrt{16} = 4$, $2^2 = 4$. Do đó $A = 5 + 4 - 4 = 5$.'
    },
    {
      id: 'q2',
      type: 'multiple_choice',
      question: 'Trong các phân số dưới đây, những phân số nào lớn hơn $\\frac{1}{2}$? (Chọn tất cả đáp án đúng)',
      options: [
        '$\\frac{3}{4}$',
        '$\\frac{2}{5}$',
        '$\\frac{5}{6}$',
        '$\\frac{1}{3}$'
      ],
      correctIndices: [0, 2],
      explanation: 'Ta quy đồng hoặc đổi ra số thập phân: $\\frac{3}{4} = 0.75 > 0.5$ và $\\frac{5}{6} \\approx 0.83 > 0.5$. Còn $\\frac{2}{5} = 0.4 < 0.5$ và $\\frac{1}{3} \\approx 0.33 < 0.5$.'
    },
    {
      id: 'q3',
      type: 'true_false',
      question: 'Xét tính Đúng / Sai của các khẳng định sau về Tự nhiên và Khoa học:',
      items: [
        {
          id: 'tf1',
          statement: 'Nước tinh khiết sôi ở nhiệt độ $100^\\circ\\text{C}$ dưới áp suất tiêu chuẩn.',
          correct: true
        },
        {
          id: 'tf2',
          statement: 'Công thức phân tử của nước cất là $\\text{H}_2\\text{O}_2$.',
          correct: false
        },
        {
          id: 'tf3',
          statement: 'Cây xanh quang hợp hấp thụ khí $\\text{CO}_2$ và giải phóng khí $\\text{O}_2$.',
          correct: true
        },
        {
          id: 'tf4',
          statement: 'Mặt Trời quay quanh Trái Đất theo quỹ đạo tròn hoàn hảo.',
          correct: false
        }
      ],
      explanation: 'Nước sôi ở 100°C. Công thức nước cất là H2O (H2O2 là oxy già). Cây xanh quang hợp tạo ra O2. Trái Đất quay quanh Mặt Trời.'
    },
    {
      id: 'q4',
      type: 'fill_in_the_blank',
      question: 'Điền từ hoặc số chính xác vào các chỗ trống sau:',
      template: 'Thủ đô của nước ta là {blank1}. Vào năm {blank2}, Bác Hồ đã đọc bản Tuyên ngôn Độc lập tại Quảng trường Ba Đình.',
      blanks: [
        {
          id: 'blank1',
          label: 'Chỗ trống (1) - Tên thủ đô',
          acceptableAnswers: ['Hà Nội', 'ha noi', 'Ha Noi'],
          hint: 'Thủ đô nghìn năm văn hiến của Việt Nam'
        },
        {
          id: 'blank2',
          label: 'Chỗ trống (2) - Năm đọc Tuyên ngôn',
          acceptableAnswers: ['1945'],
          hint: 'Năm sinh ra nước Việt Nam Dân chủ Cộng hòa'
        }
      ],
      explanation: 'Thủ đô của Việt Nam là Hà Nội. Năm 1945, Bác Hồ đọc Tuyên ngôn Độc lập.'
    },
    {
      id: 'q5',
      type: 'essay',
      question: 'Em hãy viết một đoạn văn ngắn (từ 5 đến 7 câu) kể về một việc tốt em đã làm để giúp đỡ bạn bè hoặc người thân trong gia đình. (Em có thể gõ văn bản trực tiếp hoặc viết ra vở rồi chụp ảnh tải lên).',
      maxScore: 10,
      guidelines: 'Tiêu chí chấm điểm:\n- Đúng cấu trúc đoạn văn, đủ số câu (5 - 7 câu)\n- Diễn đạt lưu loát, giàu cảm xúc\n- Nếu nộp ảnh: Chữ viết rõ ràng, sạch đẹp.',
      sampleAnswer: 'Đoạn văn mẫu: Hôm qua sau giờ tan học, em thấy bạn Nam bị rơi hộp bút màu xuống sân trường. Em đã nhanh chóng nhặt lên và mang trả tận tay cho bạn...'
    }
  ]
};

async function seedExam() {
  console.log('Seeding sample 5-type exam to Supabase...');
  // 1. Get lop-1 grade_id
  const gRes = await fetch(`${supabaseUrl}/rest/v1/grades_folders?slug=eq.lop-1`, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
  });
  const grades = await gRes.json();
  const lop1Id = grades[0]?.id;

  if (!lop1Id) {
    console.error('Could not find lop-1 grade folder');
    return;
  }

  // Check if exam already exists
  const checkRes = await fetch(`${supabaseUrl}/rest/v1/materials?title=ilike.*5 Dạng Câu Hỏi SGK*`, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
  });
  const existing = await checkRes.json();

  if (existing.length > 0) {
    console.log('Exam already exists in Supabase. ID:', existing[0].id);
    return;
  }

  const payload = {
    grade_id: lop1Id,
    subject: 'Toán học',
    title: sampleExam.title,
    description: sampleExam.description,
    content_type: 'quiz',
    ai_generated_content: {
      type: 'multi_type_exam',
      ...sampleExam
    }
  };

  const res = await fetch(`${supabaseUrl}/rest/v1/materials`, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    const data = await res.json();
    console.log('Successfully seeded 5-type exam to Supabase! ID:', data[0]?.id);
  } else {
    console.error('Failed to seed exam:', res.status, await res.text());
  }
}

seedExam();
