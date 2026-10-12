import { supabase, isSupabaseConfigured } from './supabase';

const LOCAL_STORAGE_SUBMISSIONS_KEY = 'edtech_auto_graded_submissions';
const LOCAL_STORAGE_PROGRESS_KEY = 'edtech_student_progress_local';

export const autoGradingService = {
  /**
   * Chấm điểm tự động tức thì toàn bộ các dạng câu hỏi trắc nghiệm
   * @param {Object} params
   * @param {Array} params.questions - Danh sách câu hỏi
   * @param {Object} params.answers - Đáp án của học sinh theo qId
   * @param {number} params.timeSpentSeconds - Thời gian làm bài (giây)
   * @param {Object} params.material - Thông tin bài thi / học liệu
   * @param {string} params.studentId - ID học sinh
   * @param {string} params.studentName - Tên học sinh
   * @returns {Object} Kết quả chấm điểm chi tiết
   */
  gradeExam({ questions = [], answers = {}, timeSpentSeconds = 0, material = {}, studentId = 'demo-student', studentName = 'Học sinh' }) {
    let totalQuestions = questions.length;
    let autoGradableCount = 0;
    let totalEarnedPoints = 0;
    let correctCount = 0;
    let partialCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    const breakdown = {};

    questions.forEach((q, idx) => {
      const userAns = answers[q.id];
      const isAnswered = this.checkIsAnswered(q, userAns);

      if (!isAnswered) {
        unansweredCount++;
      }

      if (q.type === 'single_choice') {
        autoGradableCount++;
        const isCorrect = userAns !== undefined && userAns === q.correctIndex;
        const pts = isCorrect ? 1 : 0;
        totalEarnedPoints += pts;

        if (isCorrect) correctCount++;
        else wrongCount++;

        breakdown[q.id] = {
          qIndex: idx + 1,
          type: 'single_choice',
          question: q.question,
          userAnswer: userAns,
          correctAnswer: q.correctIndex,
          correctAnswerText: q.options ? q.options[q.correctIndex] : '',
          isCorrect,
          isPartial: false,
          scorePercent: isCorrect ? 100 : 0,
          earned: pts,
          max: 1,
          explanation: q.explanation || 'Không có giải thích chi tiết.'
        };
      } else if (q.type === 'multiple_choice') {
        autoGradableCount++;
        const correctSet = new Set(q.correctIndices || []);
        const chosenList = Array.isArray(userAns) ? userAns : [];
        const totalCorrect = correctSet.size || 1;

        let rightChoices = 0;
        let wrongChoices = 0;

        chosenList.forEach(c => {
          if (correctSet.has(c)) rightChoices++;
          else wrongChoices++;
        });

        // Partial scoring formula: (right - 0.5 * wrong) / totalCorrect
        const rawRatio = (rightChoices - 0.5 * wrongChoices) / totalCorrect;
        const cappedRatio = Math.max(0, Math.min(1, rawRatio));
        const pts = parseFloat(cappedRatio.toFixed(2));
        totalEarnedPoints += pts;

        const isExact = cappedRatio === 1;
        const isPart = cappedRatio > 0 && cappedRatio < 1;

        if (isExact) correctCount++;
        else if (isPart) partialCount++;
        else wrongCount++;

        breakdown[q.id] = {
          qIndex: idx + 1,
          type: 'multiple_choice',
          question: q.question,
          userAnswer: chosenList,
          correctAnswer: q.correctIndices || [],
          correctAnswerTexts: (q.correctIndices || []).map(i => q.options?.[i]),
          isCorrect: isExact,
          isPartial: isPart,
          scorePercent: Math.round(cappedRatio * 100),
          earned: pts,
          max: 1,
          rightChoices,
          wrongChoices,
          totalCorrect,
          explanation: q.explanation || 'Chọn đúng các ý theo yêu cầu của bài toán.'
        };
      } else if (q.type === 'true_false') {
        autoGradableCount++;
        const items = q.items || [];
        const totalItems = items.length || 1;
        let rightSubItems = 0;

        items.forEach(it => {
          const uVal = userAns ? userAns[it.id] : undefined;
          if (uVal === it.correct) {
            rightSubItems++;
          }
        });

        const ratio = rightSubItems / totalItems;
        const pts = parseFloat(ratio.toFixed(2));
        totalEarnedPoints += pts;

        const isExact = rightSubItems === totalItems;
        const isPart = rightSubItems > 0 && rightSubItems < totalItems;

        if (isExact) correctCount++;
        else if (isPart) partialCount++;
        else wrongCount++;

        breakdown[q.id] = {
          qIndex: idx + 1,
          type: 'true_false',
          question: q.question,
          userAnswer: userAns || {},
          items: items.map(it => ({
            id: it.id,
            statement: it.statement,
            userChoice: userAns ? userAns[it.id] : undefined,
            correctChoice: it.correct,
            isRight: userAns && userAns[it.id] === it.correct
          })),
          isCorrect: isExact,
          isPartial: isPart,
          scorePercent: Math.round(ratio * 100),
          earned: pts,
          max: 1,
          rightSubItems,
          totalItems,
          explanation: q.explanation || ''
        };
      } else if (q.type === 'fill_in_the_blank') {
        autoGradableCount++;
        const blanks = q.blanks || [];
        const totalBlanks = blanks.length || 1;
        let rightBlanks = 0;

        const blanksDetail = blanks.map(b => {
          const rawVal = userAns ? (userAns[b.id] || '') : '';
          const cleanedVal = rawVal.trim().toLowerCase();
          const accepted = (b.acceptableAnswers || []).map(a => a.trim().toLowerCase());
          const isRight = accepted.includes(cleanedVal);
          if (isRight) rightBlanks++;

          return {
            id: b.id,
            userText: rawVal,
            acceptableAnswers: b.acceptableAnswers,
            isRight
          };
        });

        const ratio = rightBlanks / totalBlanks;
        const pts = parseFloat(ratio.toFixed(2));
        totalEarnedPoints += pts;

        const isExact = rightBlanks === totalBlanks;
        const isPart = rightBlanks > 0 && rightBlanks < totalBlanks;

        if (isExact) correctCount++;
        else if (isPart) partialCount++;
        else wrongCount++;

        breakdown[q.id] = {
          qIndex: idx + 1,
          type: 'fill_in_the_blank',
          question: q.question,
          userAnswer: userAns || {},
          blanksDetail,
          isCorrect: isExact,
          isPartial: isPart,
          scorePercent: Math.round(ratio * 100),
          earned: pts,
          max: 1,
          rightBlanks,
          totalBlanks,
          explanation: q.explanation || ''
        };
      } else if (q.type === 'essay') {
        // Tự luận & bài làm viết tay gửi giáo viên chấm
        breakdown[q.id] = {
          qIndex: idx + 1,
          type: 'essay',
          question: q.question,
          userAnswer: userAns || {},
          isEssayPending: true,
          submittedText: userAns?.text || '',
          submittedImage: userAns?.imageUrl || null,
          max: q.maxScore || 10,
          explanation: q.guidelines || q.sampleAnswer || 'Bài tự luận chờ giáo viên nhận xét.'
        };
      }
    });

    // Điểm hệ 100 và điểm hệ 10
    const score100 = autoGradableCount > 0
      ? Math.round((totalEarnedPoints / autoGradableCount) * 100)
      : 100;
    const score10 = parseFloat(((score100 / 100) * 10).toFixed(1));

    // Phân loại xếp loại
    let rankLabel = 'Xuất Sắc 🏆';
    let rankColor = 'emerald';
    let cheerMsg = 'Em làm bài quá tuyệt vời! Đạt điểm tuyệt đối hoặc gần như tối đa!';

    if (score10 >= 9.0) {
      rankLabel = 'Xuất Sắc 🏆';
      rankColor = 'emerald';
      cheerMsg = 'Tuyệt đỉnh! Em đã nắm rất vững kiến thức bài học!';
    } else if (score10 >= 8.0) {
      rankLabel = 'Giỏi 🌟';
      rankColor = 'blue';
      cheerMsg = 'Giỏi lắm! Chỉ cần chú ý thêm một vài câu là đạt điểm 10!';
    } else if (score10 >= 6.5) {
      rankLabel = 'Khá 👍';
      rankColor = 'amber';
      cheerMsg = 'Kết quả khá tốt! Em hãy xem lại các câu sai để rút kinh nghiệm nhé!';
    } else if (score10 >= 5.0) {
      rankLabel = 'Đạt Yêu Cầu 📚';
      rankColor = 'yellow';
      cheerMsg = 'Em đã đạt yêu cầu cơ bản, cố gắng ôn thêm bài để bứt phá nhé!';
    } else {
      rankLabel = 'Cần Cố Gắng 💪';
      rankColor = 'red';
      cheerMsg = 'Đừng nản lòng nhé! Hãy xem lời giải chi tiết và làm lại lần nữa!';
    }

    return {
      totalQuestions,
      autoGradableCount,
      totalEarnedPoints,
      score100,
      score10,
      correctCount,
      partialCount,
      wrongCount,
      unansweredCount,
      accuracyPercentage: Math.round((correctCount / (autoGradableCount || 1)) * 100),
      rankLabel,
      rankColor,
      cheerMsg,
      timeSpentSeconds,
      breakdown,
      hasEssay: questions.some(q => q.type === 'essay'),
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Kiểm tra câu hỏi đã được làm hay chưa
   */
  checkIsAnswered(q, ans) {
    if (ans === undefined || ans === null) return false;
    if (q.type === 'single_choice') return typeof ans === 'number';
    if (q.type === 'multiple_choice') return Array.isArray(ans) && ans.length > 0;
    if (q.type === 'true_false') return Object.keys(ans || {}).length > 0;
    if (q.type === 'fill_in_the_blank') {
      return Object.values(ans || {}).some(v => typeof v === 'string' && v.trim().length > 0);
    }
    if (q.type === 'essay') return Boolean(ans?.text?.trim() || ans?.imageUrl);
    return false;
  },

  /**
   * Chấm điểm và đồng bộ ngay lập tức vào Supabase DB & LocalStorage
   */
  async submitAndSync({
    questions,
    answers,
    timeSpentSeconds,
    material,
    studentId = 'demo-student',
    studentName = 'Học sinh'
  }) {
    // 1. Chấm điểm tức thì (0ms)
    const result = this.gradeExam({
      questions,
      answers,
      timeSpentSeconds,
      material,
      studentId,
      studentName
    });

    const submissionRecord = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      material_id: material?.id || null,
      material_title: material?.title || 'Bài tập / Đề thi',
      subject: material?.subject || 'Toán học',
      student_id: studentId,
      student_name: studentName,
      answers,
      scores_breakdown: result.breakdown,
      total_score: result.score100,
      score_10: result.score10,
      max_score: 100,
      correct_count: result.correctCount,
      wrong_count: result.wrongCount,
      time_spent_seconds: timeSpentSeconds,
      rank_label: result.rankLabel,
      status: 'auto_graded',
      submitted_at: result.timestamp
    };

    // 2. Lưu vào LocalStorage dự phòng tức thì
    try {
      const existingSubmissions = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SUBMISSIONS_KEY) || '[]');
      existingSubmissions.unshift(submissionRecord);
      localStorage.setItem(LOCAL_STORAGE_SUBMISSIONS_KEY, JSON.stringify(existingSubmissions.slice(0, 100)));

      // Lưu tiến độ học sinh
      const existingProgress = JSON.parse(localStorage.getItem(LOCAL_STORAGE_PROGRESS_KEY) || '{}');
      existingProgress[material?.id || 'demo'] = {
        score: result.score100,
        score10: result.score10,
        status: 'completed',
        completedAt: result.timestamp
      };
      localStorage.setItem(LOCAL_STORAGE_PROGRESS_KEY, JSON.stringify(existingProgress));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    // 3. Đồng bộ vào Supabase Database
    let supabaseSynced = false;
    if (material?.id && isSupabaseConfigured()) {
      try {
        const isRealUser = studentId && studentId !== 'demo-student' && !studentId.startsWith('demo-');

        // Ghi vào exam_submissions
        const { error: subErr } = await supabase
          .from('exam_submissions')
          .insert({
            material_id: material.id,
            student_id: isRealUser ? studentId : null,
            student_name: studentName,
            answers,
            scores_breakdown: result.breakdown,
            total_score: result.score100,
            max_score: 100,
            essay_submission: answers
          });

        if (!subErr) supabaseSynced = true;

        // Ghi vào student_progress
        if (isRealUser) {
          await supabase
            .from('student_progress')
            .upsert({
              material_id: material.id,
              student_id: studentId,
              status: 'completed',
              score: result.score100,
              completed_at: result.timestamp
            }, { onConflict: 'student_id,material_id' })
            .catch(() => {});

          // Tạo thông báo in-app cho học sinh
          await supabase
            .from('notifications')
            .insert({
              user_id: studentId,
              title: `🎉 Kết quả chấm điểm: ${material.title}`,
              message: `Hệ thống vừa chấm bài của em: đạt ${result.score10}/10 điểm (${result.score100}/100) - Xếp loại: ${result.rankLabel}.`,
              type: 'exam_result'
            })
            .catch(() => {});
        }
      } catch (dbErr) {
        console.warn('Sync to Supabase error:', dbErr);
      }
    }

    return {
      ...result,
      submissionId: submissionRecord.id,
      supabaseSynced
    };
  },

  /**
   * Lấy lịch sử các bài làm đã chấm tự động (hỗ trợ Teacher & Student)
   */
  async getSubmissions({ materialId = null, studentId = null } = {}) {
    let list = [];

    // 1. Thử lấy từ Supabase
    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('exam_submissions')
          .select('*, materials(title, subject), profiles(full_name, email)')
          .order('submitted_at', { ascending: false });

        if (materialId) query = query.eq('material_id', materialId);
        if (studentId && studentId !== 'demo-student') query = query.eq('student_id', studentId);

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          list = data.map(d => ({
            id: d.id,
            material_id: d.material_id,
            material_title: d.materials?.title || 'Đề thi',
            subject: d.materials?.subject || 'Toán học',
            student_id: d.student_id,
            student_name: d.profiles?.full_name || d.student_name || 'Học sinh',
            total_score: d.total_score,
            score_10: parseFloat(((d.total_score / 100) * 10).toFixed(1)),
            scores_breakdown: d.scores_breakdown,
            answers: d.answers,
            submitted_at: d.submitted_at
          }));
        }
      } catch (err) {
        console.warn('Get submissions from Supabase error:', err);
      }
    }

    // 2. Kết hợp với LocalStorage
    try {
      const local = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SUBMISSIONS_KEY) || '[]');
      const filteredLocal = local.filter(l => {
        if (materialId && l.material_id !== materialId) return false;
        if (studentId && l.student_id !== studentId) return false;
        return true;
      });

      // Gộp và loại trùng ID
      const existingIds = new Set(list.map(i => i.id));
      filteredLocal.forEach(item => {
        if (!existingIds.has(item.id)) {
          list.push(item);
        }
      });
    } catch (e) {}

    return list;
  }
};
