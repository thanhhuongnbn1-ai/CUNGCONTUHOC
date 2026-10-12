import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

/**
 * Service to parse Word (.docx) & Excel (.xlsx) files with structured format:
 * Câu 1: ...
 * A. ...
 * B. ...
 * C. ...
 * D. ...
 * [Đáp án: A] hoặc [Đáp án: A, C]
 * [Lời giải: ...]
 * [Độ khó: Dễ / Trung bình / Khó]
 */

export const examImportService = {
  /**
   * Parse plain text or Word raw text content
   */
  parseTextContent(rawText) {
    if (!rawText || typeof rawText !== 'string') return [];

    const normalized = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    // Split into question blocks: Câu 1, Câu 2, Question 1, Bài 1...
    const questionBlocks = normalized.split(/(?=(?:^|\n)\s*(?:Câu|Question|Bài)\s*\d+[\.:\s])/i);

    const questions = [];

    questionBlocks.forEach((block, idx) => {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) return;

      const lines = trimmedBlock.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) return;

      let questionTitle = '';
      const options = [];
      let answerRaw = '';
      let explanation = '';
      let difficulty = 'medium'; // default
      let customType = null;

      // Extract question text and attributes
      lines.forEach(line => {
        // 1. Check for answer tag: [Đáp án: ...] or Đáp án: ...
        const ansMatch = line.match(/\[?\s*(?:Đáp\s*án|Answer|Key)\s*[:=]\s*([^\]\n]+)\]?/i);
        if (ansMatch) {
          answerRaw = ansMatch[1].trim();
          return;
        }

        // 2. Check for explanation tag: [Lời giải: ...] or [Giải thích: ...]
        const expMatch = line.match(/\[?\s*(?:Lời\s*giải|Giải\s*thích|Explanation)\s*[:=]\s*([^\]\n]+)\]?/i);
        if (expMatch) {
          explanation = expMatch[1].trim();
          return;
        }

        // 3. Check for difficulty tag: [Độ khó: Dễ / Trung bình / Khó]
        const diffMatch = line.match(/\[?\s*(?:Độ\s*khó|Difficulty)\s*[:=]\s*([^\]\n]+)\]?/i);
        if (diffMatch) {
          const dStr = diffMatch[1].toLowerCase();
          if (dStr.includes('dễ') || dStr.includes('easy')) difficulty = 'easy';
          else if (dStr.includes('khó') || dStr.includes('hard')) difficulty = 'hard';
          else difficulty = 'medium';
          return;
        }

        // 4. Check for question type hint: [Loại: ...]
        const typeMatch = line.match(/\[?\s*(?:Loại|Type)\s*[:=]\s*([^\]\n]+)\]?/i);
        if (typeMatch) {
          const tStr = typeMatch[1].toLowerCase();
          if (tStr.includes('nhiều') || tStr.includes('multi')) customType = 'multiple_choice';
          else if (tStr.includes('đúng/sai') || tStr.includes('true')) customType = 'true_false';
          else if (tStr.includes('điền') || tStr.includes('blank')) customType = 'fill_in_the_blank';
          else if (tStr.includes('tự luận') || tStr.includes('essay')) customType = 'essay';
          return;
        }

        // 5. Check for options: A. ..., B. ..., C. ..., D. ... or a), b), c)
        const optMatch = line.match(/^([A-Da-d])[\.\)]\s*(.+)$/);
        if (optMatch) {
          options.push(optMatch[2].trim());
          return;
        }

        // 6. Otherwise it belongs to question title prompt
        if (!questionTitle) {
          // Remove prefix like "Câu 1:"
          questionTitle = line.replace(/^(?:Câu|Question|Bài)\s*\d+[\.:\s]*/i, '').trim();
        } else {
          questionTitle += ' ' + line;
        }
      });

      if (!questionTitle && options.length === 0) return;

      // Determine final question type
      let type = customType || 'single_choice';
      let correctIndex = 0;
      let correctIndices = [];

      // Check if multiple choice answers (e.g. "A, C" or "A và B")
      const letterMatches = answerRaw.toUpperCase().match(/[A-D]/g);

      if (letterMatches && letterMatches.length > 1) {
        type = 'multiple_choice';
        correctIndices = letterMatches.map(l => l.charCodeAt(0) - 65).filter(i => i >= 0 && i < options.length);
      } else if (letterMatches && letterMatches.length === 1) {
        correctIndex = letterMatches[0].charCodeAt(0) - 65;
        if (correctIndex < 0 || correctIndex >= options.length) correctIndex = 0;
        correctIndices = [correctIndex];
      } else if (type === 'single_choice' && options.length === 0) {
        // If no options, might be essay or fill in blank
        if (questionTitle.includes('{blank') || questionTitle.includes('___')) {
          type = 'fill_in_the_blank';
        } else {
          type = 'essay';
        }
      }

      // Structure question object
      const questionObj = {
        id: `imported_q_${Date.now()}_${idx + 1}`,
        type,
        difficulty,
        question: questionTitle || `Câu hỏi số ${idx + 1}`,
        explanation: explanation || 'Lời giải chi tiết cho câu hỏi.',
        options: options.length > 0 ? options : ['Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D']
      };

      if (type === 'single_choice') {
        questionObj.correctIndex = correctIndex;
      } else if (type === 'multiple_choice') {
        questionObj.correctIndices = correctIndices.length > 0 ? correctIndices : [0, 1];
      } else if (type === 'true_false') {
        questionObj.items = [
          { id: 'tf_1', statement: options[0] || 'Khẳng định A...', correct: answerRaw.toLowerCase().includes('đúng') || answerRaw.toUpperCase().includes('A') },
          { id: 'tf_2', statement: options[1] || 'Khẳng định B...', correct: !answerRaw.toLowerCase().includes('đúng') }
        ];
      } else if (type === 'fill_in_the_blank') {
        questionObj.template = questionTitle;
        questionObj.blanks = [
          { id: 'blank1', label: 'Chỗ trống (1)', acceptableAnswers: [answerRaw || 'đáp án'], hint: 'Từ khóa cần điền' }
        ];
      } else if (type === 'essay') {
        questionObj.maxScore = 10;
        questionObj.guidelines = 'Học sinh trình bày câu trả lời hoặc chụp ảnh bài làm.';
        questionObj.sampleAnswer = explanation || answerRaw || 'Gợi ý đáp án bài làm.';
      }

      questions.push(questionObj);
    });

    return questions;
  },

  /**
   * Parse Word file (.docx)
   */
  async parseWordDocx(file) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const rawText = result.value;
    return this.parseTextContent(rawText);
  },

  /**
   * Parse Excel file (.xlsx, .xls, .csv)
   */
  async parseExcelSpreadsheet(file) {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (!rows || rows.length === 0) return [];

    const questions = [];

    rows.forEach((row, idx) => {
      // Find keys case-insensitively
      const getVal = (possibleKeys) => {
        for (const k of Object.keys(row)) {
          const lowerK = k.trim().toLowerCase();
          if (possibleKeys.some(pk => lowerK.includes(pk.toLowerCase()))) {
            return String(row[k]).trim();
          }
        }
        return '';
      };

      const questionText = getVal(['câu hỏi', 'question', 'nội dung', 'content']);
      if (!questionText) return;

      const optA = getVal(['lựa chọn a', 'đáp án a', 'phương án a', 'option a', 'a']);
      const optB = getVal(['lựa chọn b', 'đáp án b', 'phương án b', 'option b', 'b']);
      const optC = getVal(['lựa chọn c', 'đáp án c', 'phương án c', 'option c', 'c']);
      const optD = getVal(['lựa chọn d', 'đáp án d', 'phương án d', 'option d', 'd']);

      const rawAnswer = getVal(['đáp án đúng', 'đáp án', 'answer', 'key']);
      const explanation = getVal(['giải thích', 'lời giải', 'explanation']);
      const rawDifficulty = getVal(['độ khó', 'difficulty', 'mức độ']);

      let difficulty = 'medium';
      if (rawDifficulty.toLowerCase().includes('dễ') || rawDifficulty.toLowerCase().includes('easy')) difficulty = 'easy';
      if (rawDifficulty.toLowerCase().includes('khó') || rawDifficulty.toLowerCase().includes('hard')) difficulty = 'hard';

      const options = [optA, optB, optC, optD].filter(Boolean);

      // Check single or multiple
      const letterMatches = rawAnswer.toUpperCase().match(/[A-D]/g) || [];
      let type = 'single_choice';
      let correctIndex = 0;
      let correctIndices = [];

      if (letterMatches.length > 1) {
        type = 'multiple_choice';
        correctIndices = letterMatches.map(l => l.charCodeAt(0) - 65).filter(i => i >= 0 && i < options.length);
      } else if (letterMatches.length === 1) {
        correctIndex = letterMatches[0].charCodeAt(0) - 65;
        if (correctIndex < 0 || correctIndex >= options.length) correctIndex = 0;
        correctIndices = [correctIndex];
      }

      questions.push({
        id: `excel_q_${Date.now()}_${idx + 1}`,
        type,
        difficulty,
        question: questionText,
        options: options.length > 0 ? options : ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
        correctIndex,
        correctIndices,
        explanation: explanation || 'Lời giải chi tiết.'
      });
    });

    return questions;
  },

  /**
   * Generate Word template text
   */
  generateSampleWordContent() {
    return `ĐỀ THI KIỂM TRA ĐỊNH KỲ (MẪU CẤU TRÚC WORD CHUẨN)
Hướng dẫn: Giáo viên soạn theo mẫu bên dưới, hệ thống sẽ tự động bóc tách thành đề thi tương tác!

Câu 1: Giá trị của biểu thức $A = 10 + 20 \\times 2$ là:
A. 60
B. 50
C. 40
D. 70
[Đáp án: B]
[Độ khó: Dễ]
[Lời giải: Nhân chia trước, cộng trừ sau: 20 x 2 = 40, 10 + 40 = 50]

Câu 2: Những phân số nào sau đây tối giản? (Chọn nhiều đáp án)
A. $\\frac{2}{3}$
B. $\\frac{4}{6}$
C. $\\frac{5}{7}$
D. $\\frac{9}{12}$
[Đáp án: A, C]
[Độ khó: Trung bình]
[Lời giải: 2/3 và 5/7 là phân số tối giản]

Câu 3: [Đúng/Sai] Nước tinh khiết đóng băng ở $0^\\circ\\text{C}$.
A. Đúng
B. Sai
[Đáp án: A]
[Độ khó: Dễ]
[Lời giải: Nước đóng băng ở 0 độ C và sôi ở 100 độ C]

Câu 4: Em hãy viết đoạn văn ngắn từ 3-5 câu nêu cảm nghĩ về người thầy cô em yêu quý.
[Loại: Tự luận]
[Độ khó: Khó]
[Lời giải: Tiêu chí: Diễn đạt mạch lạc, đủ số câu, thể hiện được tình cảm chân thành]
`;
  },

  /**
   * Download sample Word/Text file
   */
  downloadSampleWordFile() {
    const text = this.generateSampleWordContent();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Mau_De_Thi_Word_Chuan.txt';
    a.click();
    URL.revokeObjectURL(url);
  },

  /**
   * Download sample Excel file (.xlsx)
   */
  downloadSampleExcelFile() {
    const sampleData = [
      {
        'Câu hỏi': 'Tính giá trị của phép tính: 25 + 75 = ?',
        'Lựa chọn A': '90',
        'Lựa chọn B': '100',
        'Lựa chọn C': '110',
        'Lựa chọn D': '120',
        'Đáp án đúng': 'B',
        'Độ khó': 'Dễ',
        'Giải thích': '25 + 75 = 100'
      },
      {
        'Câu hỏi': 'Những số nào sau đây là số chẵn?',
        'Lựa chọn A': '12',
        'Lựa chọn B': '15',
        'Lựa chọn C': '28',
        'Lựa chọn D': '31',
        'Đáp án đúng': 'A, C',
        'Độ khó': 'Trung bình',
        'Giải thích': '12 và 28 có chữ số tận cùng là 2, 8 nên là số chẵn'
      },
      {
        'Câu hỏi': 'Công thức hóa học của khí Carbonic là:',
        'Lựa chọn A': 'CO',
        'Lựa chọn B': 'CO2',
        'Lựa chọn C': 'O2',
        'Lựa chọn D': 'H2O',
        'Đáp án đúng': 'B',
        'Độ khó': 'Trung bình',
        'Giải thích': 'Khí Carbonic có công thức là CO2'
      },
      {
        'Câu hỏi': 'Cho biết cạnh hình vuông là 5cm. Chu vi của hình vuông là bao nhiêu?',
        'Lựa chọn A': '20 cm',
        'Lựa chọn B': '25 cm',
        'Lựa chọn C': '15 cm',
        'Lựa chọn D': '10 cm',
        'Đáp án đúng': 'A',
        'Độ khó': 'Dễ',
        'Giải thích': 'Chu vi hình vuông = Cạnh x 4 = 5 x 4 = 20 cm'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'NganHangCauHoi');
    XLSX.writeFile(workbook, 'Mau_De_Thi_Excel_Chuan.xlsx');
  }
};

export default examImportService;
