import { GoogleGenerativeAI } from '@google/generative-ai';

// AI CONTENT STUDIO FOR TEACHERS
export const generateMaterialWithAI = async ({
  gradeName,
  subject,
  contentType, // 'story', 'quiz', 'game', 'interactive_lecture'
  rawInputText,
  customInstructions = ''
}) => {
  const apiKey = import.meta.env.VITE_AI_API_KEY;

  if (!apiKey || apiKey === 'your-gemini-api-key-here') {
    return generateFallbackAIContent(gradeName, subject, contentType, rawInputText);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Bạn là Chuyên gia Đổi mới Sư phạm & Thiết kế Học liệu Tiểu học.
Nhiệm vụ: Chuyển đổi tài liệu bài học/SGK khô khan dưới đây thành dạng học liệu tương tác hấp dẫn dành cho học sinh ${gradeName}, Môn: ${subject}.

DẠNG HỌC LIỆU YÊU CẦU: ${contentType.toUpperCase()}
YẦU BÀI GỐC / NỘI DUNG SGK:
"""
${rawInputText}
"""

GHI CHÚ THÊM CỦA GIÁO VIÊN: ${customInstructions}

YÊU CẦU ĐẦU RA BẮT BUỘC:
Trả về 1 chuỗi JSON hợp lệ KHÔNG ĐƯỢC CHỨA KHỐI CODE MARKDOWN (Không dùng \`\`\`json). Cấu trúc như sau:

NẾU contentType = 'quiz':
{
  "title": "Tên bài trắc nghiệm vui nhộn",
  "summary": "Mô tả ngắn cho học sinh",
  "questions": [
    {
      "id": 1,
      "question": "Nội dung câu hỏi?",
      "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      "correctIndex": 0,
      "explanation": "Lời giải thích sinh động cho trẻ em"
    }
  ]
}

NẾU contentType = 'story':
{
  "title": "Tên câu chuyện cổ tích / đồng thoại",
  "summary": "Mô tả bài học rút ra",
  "storyParagraphs": [
    "Đoạn 1 sinh động...",
    "Đoạn 2 hấp dẫn..."
  ],
  "moralLesson": "Bài học đạo đức / kiến thức cốt lõi"
}

NẾU contentType = 'game':
{
  "title": "Tên Trò Chơi Học Tập",
  "summary": "Nhiệm vụ của hiệp sĩ nhỏ",
  "gameType": "drag_drop_or_quiz_challenge",
  "challenges": [
    {
      "prompt": "Thử thách 1...",
      "options": ["Lựa chọn 1", "Lựa chọn 2"],
      "correct": "Lựa chọn 1",
      "rewardBadge": "🏆 Hiệp Sĩ Thông Thái"
    }
  ]
}

NẾU contentType = 'interactive_lecture':
{
  "title": "Bài Giảng Tương Tác Sinh Động",
  "summary": "Mục tiêu bài học",
  "sections": [
    {
      "heading": "Phần 1: Khám phá",
      "content": "Nội dung giải thích ngộ nghĩnh...",
      "interactiveCheck": "Câu hỏi tương tác nhanh?"
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean JSON code blocks if present
    const cleanedJson = responseText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const parsedData = JSON.parse(cleanedJson);
    return parsedData;
  } catch (error) {
    console.warn('AI Content Generation API Error, falling back to local studio generator:', error);
    return generateFallbackAIContent(gradeName, subject, contentType, rawInputText);
  }
};

// Intelligent Fallback Content Generator for Studio Demo & Instant Testing
function generateFallbackAIContent(gradeName, subject, contentType, rawInputText) {
  const titleText = rawInputText.slice(0, 40) || `Bài học ${subject} ${gradeName}`;

  if (contentType === 'quiz') {
    return {
      title: `Thử Thách Vui: ${titleText}`,
      summary: `Bài trắc nghiệm tương tác chuyển đổi từ SGK ${subject} dành cho ${gradeName}`,
      questions: [
        {
          id: 1,
          question: `Dựa vào bài học "${titleText}", kết luận nào dưới đây là đúng nhất?`,
          options: [
            "Chúng mình cần chăm chỉ rèn luyện mỗi ngày",
            "Không cần đọc kỹ bài trước khi làm",
            "Chỉ làm bài khi được nhắc nhở",
            "Bỏ qua các bài tập khó"
          ],
          correctIndex: 0,
          explanation: "Đúng rồi! Chăm chỉ ôn luyện mỗi ngày sẽ giúp em học giỏi vượt bậc đấy! 🌟"
        },
        {
          id: 2,
          question: `Trong môn ${subject} của ${gradeName}, điều quan trọng nhất khi giải bài là gì?`,
          options: [
            "Đọc kỹ đề và suy nghĩ từng bước",
            "Đoán mò đáp án thật nhanh",
            "Nhờ người khác làm hộ ngay lập tức",
            "Bỏ trống không trả lời"
          ],
          correctIndex: 0,
          explanation: "Chính xác! Tư duy từng bước là chìa khóa của các thiên tài nhỏ! 🎉"
        }
      ]
    };
  }

  if (contentType === 'story') {
    return {
      title: `Chuyến Phiêu Lưu Học Tập: ${titleText}`,
      summary: `Câu chuyện đồng thoại rèn luyện tư duy cho các bạn nhỏ ${gradeName}`,
      storyParagraphs: [
        `Ngày xửa ngày xưa, ở một ngôi trường phép thuật dành cho học sinh ${gradeName}, có một bạn Nhím Nhỏ rất thích khám phá kiến thức môn ${subject}.`,
        `Một ngày nọ, Nhím Nhỏ gặp một bài toán hóc chuẩn bị cho kỳ thi. Thay vì nản lòng, Nhím Nhỏ đã mở cuốn sách thần kỳ ra và tự mình suy nghĩ từng bước.`,
        `Cuối cùng, bằng sự kiên trì và hỗ trợ của Thầy AI, Nhím Nhỏ đã giải xong bài tập và nhận được Huy Hiệu Hiệp Sĩ Thông Thái!`
      ],
      moralLesson: "Tự học và kiên trì chính là phép thuật lớn nhất của mỗi học sinh! 🌟"
    };
  }

  if (contentType === 'game') {
    return {
      title: `Đấu Trường Phép Thuật: ${titleText}`,
      summary: `Game thử thách phản xạ & tư duy môn ${subject}`,
      gameType: "quiz_challenge",
      challenges: [
        {
          prompt: `Để vượt qua Cửa Ải 1 môn ${subject}, em cần làm gì?`,
          options: ["Tập trung suy nghĩ và làm bài", "Nhìn sang bài bạn"],
          correct: "Tập trung suy nghĩ và làm bài",
          rewardBadge: "🛡️ Khiên Tập Trung"
        },
        {
          prompt: "Khi gặp bài tập khó, bí kíp của em là gì?",
          options: ["Hỏi Thầy/Cô AI gợi ý từng bước", "Bỏ cuộc ngay"],
          correct: "Hỏi Thầy/Cô AI gợi ý từng bước",
          rewardBadge: "💎 Đá Phép Thuật Socratic"
        }
      ]
    };
  }

  return {
    title: `Bài Giảng Tương Tác: ${titleText}`,
    summary: `Bài giảng trực quan sinh động môn ${subject} ${gradeName}`,
    sections: [
      {
        heading: "1. Khám Phá Kiến Thức Mới",
        content: `Chào mừng các bạn nhỏ đến với bài học ${subject}! Hôm nay chúng mình sẽ cùng tìm hiểu về: ${rawInputText || 'Kiến thức trọng tâm trong sách giáo khoa.'}`,
        interactiveCheck: "Em đã sẵn sàng tham gia thử thách chưa?"
      },
      {
        heading: "2. Thực Hành & Rèn Luyện",
        content: "Hãy vận dụng tư duy để giải các ví dụ minh họa sinh động nhé!",
        interactiveCheck: "Bí kíp để nhớ lâu là gì nhỉ?"
      }
    ]
  };
}
