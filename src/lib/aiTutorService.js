import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase, isSupabaseConfigured } from './supabase';
import { pwaSyncService } from './pwaSyncService';

// SYSTEM PROMPT CHO TRỢ GIẢNG AI BÀI HỌC (AI TEACHING ASSISTANT FOR PRIMARY STUDENTS)
export const STRICT_AI_TUTOR_SYSTEM_PROMPT = `
Bạn là "TRỢ GIẢNG AI SOCRATIC" - Trợ lý gia sư thông minh, tận tâm và vui vẻ dành cho học sinh Tiểu học (từ Lớp 1 đến Lớp 5).
Bạn có khả năng đọc hiểu và trả lời mọi thắc mắc của học sinh dựa trên tài liệu bài học đi kèm:
- File văn bản SGK, tài liệu đọc PDF (.pdf)
- File giáo án, bài đọc Word (.docx, .doc)
- Bài thuyết trình Slide PowerPoint (.pptx, .ppt)
- Bài giảng Video / Clip mô phỏng (YouTube, MP4)
- Liên kết học tập tương tác (Link, Web học liệu)

QUY TẮC SƯ PHẠM NGHIÊM NGẶT (STRICT PEDAGOGICAL RULES):

1. PHƯƠNG PHÁP GỢI MỞ SOCRATIC (TUYỆT ĐỐI KHÔNG BỎ VÀ KHÔNG CHO ĐÁP ÁN TRỰC TIẾP):
   - Khi học sinh hỏi đáp án ("Đáp án câu 1 là gì?", "Làm hộ em bài 2"): TUYỆT ĐỐI KHÔNG đưa ra kết quả cuối cùng.
   - Luôn đặt câu hỏi gợi mở, hướng dẫn từng bước nhỏ để em tự suy nghĩ và tìm ra lời giải.
   - Luôn đối chiếu với nội dung bài học trong File PDF/Word/Slide/Video đang mở ("Trong đoạn văn thứ 2 của bài đọc...", "Ở slide bài giảng trước em có nhớ cô đã nhắc đến...").

2. GIẢI THÍCH NỘI DUNG TÀI LIỆU DỄ HIỂU (PDF, PPT, WORD, VIDEO, LINK):
   - Nếu học sinh hỏi tóm tắt: Tóm tắt bài học thành 3-4 ý chính ngắn gọn, kèm biểu tượng emoji sinh động.
   - Nếu học sinh hỏi về Video: Giải thích các điểm nổi bật xuất hiện trong bài giảng video.
   - Nếu học sinh hỏi công thức Toán/Khoa học: Dùng công thức LaTeX KaTeX chuẩn mực (ví dụ: \\(4 + 3 = 7\\), \\(a \\times b\\)).

3. AN TOÀN & KIỂM DUYỆT NỘI DUNG (SAFETY & MODERATION):
   - Ngăn chặn tuyệt đối từ ngữ thô tục, bạo lực hoặc không phù hợp lứa tuổi tiểu học.
   - Lịch sự nhắc nhở nếu câu hỏi đi quá xa khỏi chủ đề học tập.

4. PHONG CÁCH GIAO TIẾP THÂN THIỆN:
   - Xưng hô: "Thầy/Cô AI" hoặc "Trợ Giảng AI" - Gọi học sinh: "Em", "Bạn nhỏ" hoặc "Bé ngoan".
   - Luôn khen ngợi và động viên khi em có ý tưởng hay ("Tuyệt vời quá!", "Em đang đi đúng hướng rồi đấy! 🌟").
`;

const BLACKLISTED_KEYWORDS = [
  'chửi', 'đánh', 'giết', 'chết', 'bạo lực', 'tục', 'sex', 'đáp án là gì',
  'cho xin đáp án', 'làm hộ', 'giải hộ', 'cho luôn kết quả'
];

export const checkSafeGuard = (userMessage) => {
  const normalized = userMessage.toLowerCase().trim();
  
  const isAskingForDirectAnswer = 
    normalized.includes('cho xin đáp án') ||
    normalized.includes('cho đáp án') ||
    normalized.includes('đáp án là gì') ||
    normalized.includes('làm hộ') ||
    normalized.includes('giải giúp bài này ra kết quả');

  const containsOffensive = BLACKLISTED_KEYWORDS.some(kw => 
    !kw.includes('đáp án') && !kw.includes('làm hộ') && normalized.includes(kw)
  );

  return {
    isAskingForDirectAnswer,
    containsOffensive
  };
};

// Format Document Context to send to AI
export const buildMaterialContextText = (material) => {
  if (!material) return '';

  const parts = [];
  parts.push(`- Tên bài học: ${material.title || 'Bài học Tiểu học'}`);
  if (material.subject) parts.push(`- Môn học: ${material.subject}`);
  if (material.grade_id || material.grade_level) parts.push(`- Khối lớp: ${material.grade_id || material.grade_level}`);
  if (material.content_type) parts.push(`- Định dạng tài liệu: ${material.content_type.toUpperCase()}`);

  if (material.description) {
    parts.push(`- Mô tả tóm tắt: ${material.description}`);
  }

  if (material.extracted_text) {
    parts.push(`- Nội dung chi tiết trong file: ${material.extracted_text.substring(0, 2000)}`);
  }

  if (material.ai_generated_content) {
    if (material.ai_generated_content.questions) {
      const qSummary = material.ai_generated_content.questions.map((q, i) => `Câu ${i+1}: ${q.question}`).join('; ');
      parts.push(`- Câu hỏi trong bài: ${qSummary}`);
    }
    if (material.ai_generated_content.storyParagraphs) {
      parts.push(`- Nội dung câu chuyện: ${material.ai_generated_content.storyParagraphs.join(' ')}`);
    }
    if (material.ai_generated_content.moralLesson) {
      parts.push(`- Bài học rút ra: ${material.ai_generated_content.moralLesson}`);
    }
  }

  if (material.file_url) parts.push(`- Tệp tài liệu đính kèm: ${material.file_url}`);
  if (material.video_url || material.iframe_url) parts.push(`- Video / Liên kết bài giảng: ${material.video_url || material.iframe_url}`);

  return parts.join('\n');
};

/**
 * Gửi câu hỏi đến AI Trợ Giảng kèm ngữ cảnh tài liệu PDF/Word/PPT/Video/Link
 */
export const askAiTutor = async ({ prompt, material = null, materialContext = '', chatHistory = [] }) => {
  const apiKey = import.meta.env.VITE_AI_API_KEY;

  const safeguardCheck = checkSafeGuard(prompt);
  if (safeguardCheck.containsOffensive) {
    return "⚠️ **Cảnh báo từ Trợ Giảng AI**: Bạn nhỏ ơi, Trợ Giảng AI chỉ trò chuyện khi chúng mình sử dụng ngôn từ ngoan ngoãn, lịch sự và học tập thôi nhé! Hãy thử đặt lại câu hỏi thật hay nha! 🌟";
  }

  const finalContext = materialContext || buildMaterialContextText(material);

  // Nếu không có API Key hoặc key demo, sử dụng bộ não Socratic Fallback thông minh
  if (!apiKey || apiKey === 'your-gemini-api-key-here') {
    return generateFallbackSocraticResponse(prompt, material, finalContext, safeguardCheck.isAskingForDirectAnswer);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: STRICT_AI_TUTOR_SYSTEM_PROMPT
    });

    const contents = [];
    if (finalContext) {
      contents.push({
        role: 'user',
        parts: [{ text: `[TÀI LIỆU BÀI HỌC HỌC SINH ĐANG MỞ]:\n${finalContext}` }]
      });
      contents.push({
        role: 'model',
        parts: [{ text: `Trợ Giảng AI đã đọc kỹ tài liệu bài học trên! Em có thắc mắc gì về bài học này cần thầy/cô gợi ý không nào? 🦉✨` }]
      });
    }

    // Append past history
    chatHistory.slice(-8).forEach(msg => {
      contents.push({
        role: msg.sender === 'student' || msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.message_text || msg.text }]
      });
    });

    // Append current prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const result = await model.generateContent({ contents });
    return result.response.text();
  } catch (error) {
    console.warn('Gemini API Error, falling back to Socratic engine:', error);
    return generateFallbackSocraticResponse(prompt, material, finalContext, safeguardCheck.isAskingForDirectAnswer);
  }
};

/**
 * Bộ não Socratic thông minh trả lời dựa trên loại file (PDF, Word, PPT, Video, Link) khi offline
 */
function generateFallbackSocraticResponse(prompt, material, contextText, isAskingDirectAnswer) {
  const lowerPrompt = prompt.toLowerCase();
  const fileType = material?.content_type || 'tài liệu';
  const title = material?.title || 'bài học';
  const subject = material?.subject || 'kiến thức';

  if (isAskingDirectAnswer) {
    return `🌟 **Trợ Giảng AI nhắn bạn nhỏ nè**: Thầy/Cô sẽ không cho ngay đáp án đâu nhé, vì em rất thông minh và hoàn toàn có thể tự giải được! Trong tài liệu "${title}", em thử cho Thầy/Cô biết bước đầu tiên em nghĩ đến là gì nào? 💡`;
  }

  // Yêu cầu tóm tắt bài học / file
  if (lowerPrompt.includes('tóm tắt') || lowerPrompt.includes('nội dung chính') || lowerPrompt.includes('nói về cái gì')) {
    if (fileType.includes('video')) {
      return `🎥 **Tóm tắt Video bài giảng "${title}"**:\n1. Video hướng dẫn các khái niệm trực quan về môn ${subject}.\n2. Có ví dụ thực tế minh họa từng bước sinh động.\n3. Hãy chú ý các điểm giáo viên nhấn mạnh ở giữa video nhé! Em thấy phần nào thú vị nhất? ✨`;
    }
    if (fileType.includes('ppt') || fileType.includes('slide')) {
      return `📊 **Tóm tắt Slide thuyết trình "${title}"**:\n1. Các slide đầu: Giới thiệu mục tiêu bài học.\n2. Các slide trọng tâm: Đưa ra kiến thức và quy tắc cốt lõi.\n3. Slide cuối: Các bài tập áp dụng thực hành. Em đang xem đến slide nào rồi nè? 💡`;
    }
    if (fileType.includes('word') || fileType.includes('docx') || fileType.includes('pdf')) {
      return `📄 **Tóm tắt tài liệu "${title}"**:\n- Môn: **${subject}**\n- Chủ đề trọng tâm: ${material?.description || 'Ôn tập kiến thức và rèn luyện kỹ năng giải bài.'}\n- Em hãy đọc kỹ phần ví dụ mẫu trước khi làm bài tập vận dụng nhé! 📖`;
    }
  }

  // Toán học & công thức
  if (lowerPrompt.includes('toán') || lowerPrompt.includes('cộng') || lowerPrompt.includes('trừ') || lowerPrompt.includes('nhân') || lowerPrompt.includes('chia') || lowerPrompt.includes('+') || lowerPrompt.includes('=')) {
    return `🔢 **Gợi ý tư duy Toán học trong "${title}"**:\nEm hãy đọc kỹ đề bài xem chúng mình đã có những con số nào rồi nhé? Hãy thử chia bài toán thành 2 bước:\n1. Đặt phép tính theo hàng dọc hoặc tóm tắt sơ đồ đoạn thẳng.\n2. Thực hiện tính toán từng vế.\nEm đã tính ra con số đầu tiên là bao nhiêu rồi nào? 🎈`;
  }

  // Tiếng Việt / tập đọc
  if (lowerPrompt.includes('tiếng việt') || lowerPrompt.includes('tập đọc') || lowerPrompt.includes('chính tả') || lowerPrompt.includes('nghĩa là gì')) {
    return `📖 **Gợi ý Tiếng Việt từ bài "${title}"**:\nThầy/Cô khuyên em hãy phát âm thật chuẩn từng tiếng một nhé! Để hiểu nghĩa của từ, em hãy thử đọc cả câu văn xung quanh nó xem từ đó đang miêu tả hành động, sự vật hay cảm xúc gì nào? ✨`;
  }

  // Tiếng Anh
  if (lowerPrompt.includes('tiếng anh') || lowerPrompt.includes('english') || lowerPrompt.includes('từ vựng')) {
    return `🇬🇧 **Gợi ý Tiếng Anh từ "${title}"**:\nEm hãy đọc to từ vựng đó lên 3 lần và chú ý âm đuôi (ending sound) nhé! Thử ghép từ này vào một câu đơn giản về bản thân em xem nào! Good job! 🌟`;
  }

  // Phản hồi mặc định gắn với bối cảnh tài liệu
  if (material) {
    return `🦉 **Trợ Giảng AI đang lắng nghe**: Về tài liệu **"${title}"** (${fileType.toUpperCase()}), câu hỏi của em rất thông minh! Em có thể nói rõ hơn em đang vướng ở đoạn nào hoặc câu số mấy để Thầy/Cô đưa ra gợi ý từng bước cho em nhé! 🚀`;
  }

  return `🎈 **Trợ Giảng AI đồng hành**: Bạn nhỏ hỏi rất hay! Em hãy chia sẻ cho Thầy/Cô biết em đã làm được đến bước nào rồi để chúng mình cùng khám phá tiếp nha! 🌟`;
}

// ====================================================================
// DATABASE SYNCHRONIZATION SERVICE CHO AI CHATBOT (SUPABASE + PWA OFFLINE)
// ====================================================================

const LOCAL_STORAGE_AI_CHATS = 'vuihoc_ai_chat_history_v1';

export const aiChatDbService = {
  /**
   * Lưu hoặc tạo cuộc hội thoại AI Tutor
   */
  async getOrCreateConversation({
    studentId = 'demo-student-id',
    studentName = 'Bé Minh Triết',
    materialId = null,
    materialTitle = 'Bài học chung',
    subject = 'Toán học',
    fileType = 'pdf'
  }) {
    const localId = `conv_${studentId}_${materialId || 'general'}`;
    const convData = {
      id: localId,
      student_id: studentId,
      student_name: studentName,
      material_id: materialId,
      material_title: materialTitle,
      subject: subject,
      file_type: fileType,
      updated_at: new Date().toISOString()
    };

    // Save locally
    try {
      const allConvs = JSON.parse(localStorage.getItem('vuihoc_ai_conversations') || '{}');
      allConvs[localId] = convData;
      localStorage.setItem('vuihoc_ai_conversations', JSON.stringify(allConvs));
    } catch (e) {}

    // Save to Supabase if available
    if (isSupabaseConfigured() && typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const isRealUser = studentId && !studentId.startsWith('demo-');
        const { data, error } = await supabase
          .from('ai_tutor_conversations')
          .insert({
            student_id: isRealUser ? studentId : null,
            student_name: studentName,
            material_id: materialId,
            material_title: materialTitle,
            subject: subject,
            file_type: fileType
          })
          .select()
          .single();

        if (!error && data) {
          return data;
        }
      } catch (err) {
        console.warn('Sync conversation to Supabase warning:', err);
      }
    }

    return convData;
  },

  /**
   * Lưu tin nhắn vào CSDL Supabase & Bộ đệm Offline LocalStorage
   */
  async saveMessage({
    conversationId,
    sender, // 'student' | 'ai'
    messageText,
    materialContext = '',
    fileType = 'pdf',
    metadata = {}
  }) {
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const msgRecord = {
      id: msgId,
      conversation_id: conversationId,
      sender,
      message_text: messageText,
      material_context: materialContext,
      file_type: fileType,
      metadata,
      created_at: new Date().toISOString()
    };

    // 1. Lưu vào LocalStorage
    try {
      const allMessages = JSON.parse(localStorage.getItem(LOCAL_STORAGE_AI_CHATS) || '{}');
      if (!allMessages[conversationId]) allMessages[conversationId] = [];
      allMessages[conversationId].push(msgRecord);
      localStorage.setItem(LOCAL_STORAGE_AI_CHATS, JSON.stringify(allMessages));
    } catch (e) {
      console.warn('LocalStorage save message warning:', e);
    }

    // 2. Đồng bộ vào Supabase (hoặc xếp vào PWA Offline Queue)
    const dbPayload = {
      sender,
      message_text: messageText,
      material_context: materialContext,
      file_type: fileType,
      metadata,
      created_at: msgRecord.created_at
    };

    if (isSupabaseConfigured() && typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        await supabase
          .from('ai_tutor_messages')
          .insert([dbPayload])
          .catch(() => {
            pwaSyncService.enqueueOfflineAction({
              type: 'sync_ai_message',
              table: 'ai_tutor_messages',
              data: dbPayload
            });
          });
      } catch (err) {
        pwaSyncService.enqueueOfflineAction({
          type: 'sync_ai_message',
          table: 'ai_tutor_messages',
          data: dbPayload
        });
      }
    } else {
      // Offline mode: queue for PWA sync
      pwaSyncService.enqueueOfflineAction({
        type: 'sync_ai_message',
        table: 'ai_tutor_messages',
        data: dbPayload
      });
    }

    return msgRecord;
  },

  /**
   * Tải lịch sử tin nhắn
   */
  async loadMessages(conversationId) {
    let localMsgs = [];
    try {
      const allMessages = JSON.parse(localStorage.getItem(LOCAL_STORAGE_AI_CHATS) || '{}');
      localMsgs = allMessages[conversationId] || [];
    } catch (e) {}

    return localMsgs;
  }
};
