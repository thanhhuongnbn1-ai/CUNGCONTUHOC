import { GoogleGenerativeAI } from '@google/generative-ai';

// SYSTEM PROMPT CHO AI GIA SƯ (STRICT AI TUTOR FOR PRIMARY SCHOOL)
export const STRICT_AI_TUTOR_SYSTEM_PROMPT = `
Bạn là "AI GIA SƯ ĐỒNG HÀNH" - Trợ lý tự học thông minh, thân thiện dành riêng cho học sinh Tiểu học (từ Lớp 1 đến Lớp 5).
Nhiệm vụ duy nhất của bạn là đồng hành, động viên và hướng dẫn các em tự suy nghĩ, giải bài tập và hiểu sâu bài học.

QUY TẮC NGIÊM NGẶT TOÀN DIỆN (STRICT RULES):

1. TUYỆT ĐỐI KHÔNG BỎ VÀ KHÔNG ĐƯA ĐÁP ÁN TRỰC TIẾP (NO DIRECT ANSWERS):
   - Khi học sinh hỏi đáp án hoặc nhờ làm hộ bài: TUYỆT ĐỐI KHÔNG đưa ra kết quả cuối cùng.
   - Sử dụng phương pháp gợi mở Socratic: Chia nhỏ bài toán/câu hỏi thành các bước cực kỳ đơn giản. Đặt 1 câu hỏi gợi ý để học sinh tự trả lời từng bước.
   - Ví dụ: Nếu học sinh hỏi "5 + 7 bằng bao nhiêu?", hãy trả lời: "Bạn nhỏ ơi! Hãy tưởng tượng em đang có 5 quả táo màu đỏ 🍎, sau đó được tặng thêm 7 quả táo màu xanh 🍏. Em thử đếm tiếp từ 5 thêm 7 đơn vị nữa xem chúng mình được bao nhiêu nhé?"

2. KHỦNG KHỦNG & KIỂM DUYỆT NỘI DUNG (SAFEGUARD & MODERATION):
   - Phát hiện từ ngữ thô tục, bậy bạ, bạo lực, nhạy cảm hoặc không phù hợp với lứa tuổi tiểu học -> Ngay lập tức TỪ CHỐI và cảnh báo lịch sự: "⚠️ Cảnh báo: Bạn nhỏ ơi, Thầy/Cô AI chỉ có thể hỗ trợ các câu hỏi liên quan đến học tập và chỉ trò chuyện khi chúng mình sử dụng ngôn từ đẹp, lịch sự thôi nhé!"
   - Nếu câu hỏi HOÀN TOÀN KHÔNG LIÊN QUAN ĐẾN BÀI HỌC (ví dụ: chơi game gì, hỏi về chính trị, giải trí người lớn...): Hãy nhắc nhở em quay lại chủ đề bài học: "Thầy/Cô AI thấy câu hỏi này nằm ngoài bài học rồi nè! Chúng mình cùng tập trung ôn lại kiến thức bài học hiện tại nhé ✨."

3. NGÔN NGỮ SƯ PHẠM THÂN THIỆN & DỄ HIỂU (CHILD-FRIENDLY PEDAGOGICAL LANGUAGE):
   - Sử dụng từ ngữ hồn nhiên, khích lệ, dùng các emoji ngộ nghĩnh (🌟, 📚, 🎨, 🎈, 👏, 💡).
   - Xưng hô: "Thầy/Cô AI" hoặc "Bạn Trợ Lý AI" - Gọi học sinh: "Em", "Bạn nhỏ" hoặc "Học sinh cưng".
   - Câu từ ngắn gọn, rõ ràng, phù hợp với trình độ tiểu học. KHÔNG dùng thuật ngữ chuyên môn phức tạp.

4. KHÍCH LỆ VÀ KHỜI GỢI TỰ HỌC:
   - Khi học sinh trả lời đúng: Khen ngợi nhiệt tình ("Giỏi quá!", "Xuất sắc lắm bạn nhỏ ơi! 🎉").
   - Khi học sinh trả lời sai: Động viên nhẹ nhàng ("Không sao cả em nhé! Sai là một bước để chúng mình học giỏi hơn. Thử suy nghĩ lại cùng Thầy/Cô nhé!").
`;

// Danh sách từ cấm / nhạy cảm để filter nhanh ở Frontend SafeGuard
const BLACKLISTED_KEYWORDS = [
  'chửi', 'đánh', 'giết', 'chết', 'bạo lực', 'tục', 'sex', 'đáp án là gì',
  'cho xin đáp án', 'làm hộ', 'giải hộ', 'cho luôn kết quả'
];

export const checkSafeGuard = (userMessage) => {
  const normalized = userMessage.toLowerCase().trim();
  
  // Kiểm tra nếu yêu cầu cho đáp án trực tiếp
  const isAskingForDirectAnswer = 
    normalized.includes('cho xin đáp án') ||
    normalized.includes('cho đáp án') ||
    normalized.includes('đáp án là gì') ||
    normalized.includes('làm hộ') ||
    normalized.includes('giải giúp bài này ra kết quả');

  // Kiểm tra từ ngữ vi phạm
  const containsOffensive = BLACKLISTED_KEYWORDS.some(kw => 
    !kw.includes('đáp án') && !kw.includes('làm hộ') && normalized.includes(kw)
  );

  return {
    isAskingForDirectAnswer,
    containsOffensive
  };
};

export const askAiTutor = async ({ prompt, materialContext = '', chatHistory = [] }) => {
  const apiKey = import.meta.env.VITE_AI_API_KEY;

  const safeguardCheck = checkSafeGuard(prompt);
  if (safeguardCheck.containsOffensive) {
    return "⚠️ **Cảnh báo từ Thầy/Cô AI**: Bạn nhỏ ơi, Thầy/Cô AI chỉ trò chuyện khi chúng mình sử dụng ngôn từ ngoan ngoãn, lịch sự và học tập thôi nhé! Hãy thử đặt lại câu hỏi thật hay nha! 🌟";
  }

  // Nếu không có API Key, trả về câu phản hồi mô phỏng Socratic cực kỳ thông minh
  if (!apiKey || apiKey === 'your-gemini-api-key-here') {
    return generateFallbackSocraticResponse(prompt, materialContext, safeguardCheck.isAskingForDirectAnswer);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: STRICT_AI_TUTOR_SYSTEM_PROMPT
    });

    // Structure conversation contents
    const contents = [];
    if (materialContext) {
      contents.push({
        role: 'user',
        parts: [{ text: `[BỐI CẢNH BÀI HỌC HỌC SINH ĐANG XEM]: ${materialContext}` }]
      });
      contents.push({
        role: 'model',
        parts: [{ text: `Dạ Thầy/Cô AI đã nắm được nội dung bài học "${materialContext}". Em có thắc mắc gì cần gợi ý không nào? ✨` }]
      });
    }

    // Append past history
    chatHistory.forEach(msg => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      });
    });

    // Append current prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const result = await model.generateContent({ contents });
    const responseText = result.response.text();
    return responseText;
  } catch (error) {
    console.warn('Gemini API Error, falling back to Socratic engine:', error);
    return generateFallbackSocraticResponse(prompt, materialContext, safeguardCheck.isAskingForDirectAnswer);
  }
};

// Internal intelligent Socratic fallback when API key is missing or encounters network issue
function generateFallbackSocraticResponse(prompt, materialContext, isAskingDirectAnswer) {
  const lowerPrompt = prompt.toLowerCase();

  if (isAskingDirectAnswer) {
    return "🌟 **Thầy/Cô AI nhắn bạn nhỏ nè**: Thầy/Cô sẽ không cho ngay đáp án đâu nhé, vì em rất thông minh và hoàn toàn có thể tự giải được! Em thử cho Thầy/Cô biết bước đầu tiên em nghĩ đến trong bài toán này là gì nào? 💡";
  }

  if (lowerPrompt.includes('toán') || lowerPrompt.includes('+') || lowerPrompt.includes('-') || lowerPrompt.includes('x') || lowerPrompt.includes(':')) {
    return "🔢 **Gợi ý tư duy Toán học**: Em hãy đọc kỹ đề bài xem chúng mình đã có những con số nào rồi nè? Thử chia bài toán thành 2 bước nhỏ và tính từng bước một nhé! Em tính ra con số đầu tiên là bao nhiêu?";
  }

  if (lowerPrompt.includes('tiếng việt') || lowerPrompt.includes('chữ') || lowerPrompt.includes('tập đọc') || lowerPrompt.includes('từ')) {
    return "📖 **Gợi ý Tiếng Việt**: Thầy/Cô khuyên em hãy phát âm thật rõ từng từ một nhé! Em hãy thử ghép âm đầu và phần vần lại với nhau xem từ đó có nghĩa gì nào? ✨";
  }

  if (materialContext) {
    return `💡 **Gợi ý từ bài học "${materialContext}"**: Bạn nhỏ hãy đọc lại đoạn văn trên một lần nữa nhé. Câu trả lời đang nằm ở ngay những dòng đầu tiên đấy, em thấy từ chìa khóa nào nổi bật nhất nè?`;
  }

  return "🎈 **Thầy/Cô AI đồng hành**: Bạn nhỏ đặt câu hỏi rất hay! Em hãy chia sẻ cho Thầy/Cô biết em đã làm được đến bước nào rồi để chúng mình cùng đi tiếp nha! 🚀";
}
