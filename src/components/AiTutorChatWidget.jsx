import React, { useState, useEffect, useRef } from 'react';
import { askAiTutor, aiChatDbService } from '../lib/aiTutorService';
import { LatexRenderer } from './LatexRenderer';
import {
  MessageSquare,
  Sparkles,
  X,
  Minus,
  Send,
  Trash2,
  Volume2,
  FileText,
  Video,
  Presentation,
  Link as LinkIcon,
  HelpCircle,
  BookOpen,
  ChevronDown,
  RefreshCw,
  CheckCircle2,
  Lightbulb,
  Maximize2
} from 'lucide-react';

// Danh sách các bài học mẫu tiêu biểu để học sinh chọn nhanh ngữ cảnh tài liệu
const DEFAULT_LESSON_CONTEXTS = [
  {
    id: 'mat-1',
    title: 'Thử Thách Phép Cộng Trong Phạm Vi 10 (SGK Lớp 1)',
    subject: 'Toán học',
    content_type: 'pdf',
    grade_level: 'Lớp 1',
    description: 'Tài liệu hướng dẫn phép cộng và đếm que tính trong phạm vi 10'
  },
  {
    id: 'mat-2',
    title: 'Cậu Bé Chăm Học Và Cây Bút Thần',
    subject: 'Tiếng Việt',
    content_type: 'word',
    grade_level: 'Lớp 1',
    description: 'Truyện đọc rèn luyện đức tính kiên trì tự học và lòng hiếu thảo'
  },
  {
    id: 'mat-3',
    title: 'Đấu Trường Wordwall: Game Ghép Từ Vựng Phép Thuật',
    subject: 'Tiếng Anh',
    content_type: 'link',
    grade_level: 'Lớp 2',
    description: 'Liên kết học từ vựng Tiếng Anh chủ đề trường lớp và màu sắc'
  },
  {
    id: 'mat-4',
    title: 'Bài Giảng Video: Vòng Tuần Hoàn Của Nước Trong Tự Nhiên',
    subject: 'Tự nhiên & Xã hội',
    content_type: 'video',
    grade_level: 'Lớp 3',
    description: 'Video mô phỏng sự bay hơi, ngưng tụ mây và mưa'
  },
  {
    id: 'mat-5',
    title: 'Slide Thuyết Trình: Phân Số Và Phép Tính Phân Số (PowerPoint)',
    subject: 'Toán học',
    content_type: 'ppt',
    grade_level: 'Lớp 4',
    description: 'Bộ slide minh họa phân số bằng các hình tròn và que bánh quy'
  }
];

export const AiTutorChatWidget = ({ userProfile, activeMaterial = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(activeMaterial || DEFAULT_LESSON_CONTEXTS[0]);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [isContextDropdownOpen, setIsContextDropdownOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messagesEndRef = useRef(null);

  // Sync activeMaterial when user navigates or views a new lesson
  useEffect(() => {
    if (activeMaterial) {
      setSelectedMaterial(activeMaterial);
    }
  }, [activeMaterial]);

  // Listen for global custom event to open widget with material context
  useEffect(() => {
    const handleOpenWithMaterial = (e) => {
      if (e.detail?.material) {
        setSelectedMaterial(e.detail.material);
      }
      setIsOpen(true);
    };
    window.addEventListener('open_ai_tutor_with_material', handleOpenWithMaterial);
    return () => window.removeEventListener('open_ai_tutor_with_material', handleOpenWithMaterial);
  }, []);

  // Load conversation and messages when selectedMaterial changes
  useEffect(() => {
    initConversation();
  }, [selectedMaterial]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const initConversation = async () => {
    const studentId = userProfile?.id || 'demo-student-id';
    const studentName = userProfile?.full_name || 'Bé Minh Triết';
    
    const conv = await aiChatDbService.getOrCreateConversation({
      studentId,
      studentName,
      materialId: selectedMaterial?.id,
      materialTitle: selectedMaterial?.title,
      subject: selectedMaterial?.subject,
      fileType: selectedMaterial?.content_type || 'pdf'
    });

    setConversationId(conv.id);
    const history = await aiChatDbService.loadMessages(conv.id);

    if (history.length > 0) {
      setMessages(history);
    } else {
      // Welcome message customized to file type
      const welcomeText = getInitialGreeting(selectedMaterial);
      const welcomeMsg = {
        id: `welcome_${Date.now()}`,
        sender: 'ai',
        message_text: welcomeText,
        created_at: new Date().toISOString()
      };
      setMessages([welcomeMsg]);
    }
  };

  const getInitialGreeting = (mat) => {
    const typeLabel = mat?.content_type?.toUpperCase() || 'TÀI LIỆU';
    const title = mat?.title || 'Bài học';
    return `🦉 **Xin chào bạn nhỏ!** Thầy/Cô Trợ Giảng AI đã mở tài liệu **[${typeLabel}] "${title}"** rồi nè!
    
Em có chỗ nào chưa hiểu trong bài đọc, slide hay video này thì hỏi Thầy/Cô ngay nhé! Chúng mình cùng khám phá nha! ✨`;
  };

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const studentMsg = {
      id: `stu_${Date.now()}`,
      sender: 'student',
      message_text: text,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, studentMsg]);
    setInputValue('');
    setIsLoading(true);

    // Save student message to DB / LocalStorage
    await aiChatDbService.saveMessage({
      conversationId,
      sender: 'student',
      messageText: text,
      materialContext: selectedMaterial?.title,
      fileType: selectedMaterial?.content_type || 'pdf'
    });

    try {
      // Call AI Tutor Engine with full lesson context
      const aiResponse = await askAiTutor({
        prompt: text,
        material: selectedMaterial,
        chatHistory: messages
      });

      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        message_text: aiResponse,
        created_at: new Date().toISOString()
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Save AI message to DB / LocalStorage
      await aiChatDbService.saveMessage({
        conversationId,
        sender: 'ai',
        messageText: aiResponse,
        materialContext: selectedMaterial?.title,
        fileType: selectedMaterial?.content_type || 'pdf'
      });
    } catch (err) {
      console.error('Error getting AI response:', err);
      const errorMsg = {
        id: `err_${Date.now()}`,
        sender: 'ai',
        message_text: 'Thầy/Cô AI đang suy nghĩ thêm một chút, em hỏi lại câu này nhé! 🌟',
        created_at: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Bạn nhỏ có muốn làm mới cuộc trò chuyện với Trợ Giảng AI không?')) {
      const welcomeMsg = {
        id: `welcome_${Date.now()}`,
        sender: 'ai',
        message_text: getInitialGreeting(selectedMaterial),
        created_at: new Date().toISOString()
      };
      setMessages([welcomeMsg]);
      localStorage.removeItem(`vuihoc_ai_chat_history_v1`);
    }
  };

  // Text-To-Speech for primary school kids
  const speakText = (text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Clean markdown and latex tags for speaking
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/\\\(|\\\)/g, '')
      .replace(/\[|\]/g, '')
      .replace(/https?:\/\/\S+/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95; // Slightly slower, child friendly

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const getFileBadge = (type) => {
    switch (type) {
      case 'video':
        return { label: 'Video Clip', icon: <Video className="w-3 h-3 text-red-500" />, bg: 'bg-red-50 text-red-700' };
      case 'ppt':
        return { label: 'PowerPoint', icon: <Presentation className="w-3 h-3 text-orange-500" />, bg: 'bg-orange-50 text-orange-700' };
      case 'word':
        return { label: 'Word Doc', icon: <FileText className="w-3 h-3 text-blue-500" />, bg: 'bg-blue-50 text-blue-700' };
      case 'link':
        return { label: 'Liên kết Link', icon: <LinkIcon className="w-3 h-3 text-emerald-500" />, bg: 'bg-emerald-50 text-emerald-700' };
      default:
        return { label: 'Tài liệu PDF', icon: <FileText className="w-3 h-3 text-amber-500" />, bg: 'bg-amber-50 text-amber-700' };
    }
  };

  const badge = getFileBadge(selectedMaterial?.content_type);

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans print:hidden">
      
      {/* 1. FLOATING MINIMIZED TRIGGER BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white p-3.5 sm:p-4 rounded-full shadow-2xl hover:shadow-orange-500/40 transform hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border-4 border-white"
          title="Mở Trợ Giảng AI giải đáp bài học"
        >
          {/* Notification Pulsing Glow */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
          </span>

          <span className="text-2xl sm:text-3xl filter drop-shadow">🦉</span>
          
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-[10px] font-black uppercase tracking-wider text-yellow-100 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-200" /> TRỢ GIẢNG AI
            </span>
            <span className="text-xs font-black text-white leading-tight">
              Hỏi Đáp Bài Học 💬
            </span>
          </div>
        </button>
      )}

      {/* 2. EXPANDED CHATBOX CONTAINER */}
      {isOpen && (
        <div className="bg-white w-[94vw] sm:w-[410px] h-[580px] max-h-[85vh] rounded-3xl shadow-2xl border-4 border-orange-300 flex flex-col overflow-hidden animate-slide-in">
          
          {/* A. HEADER */}
          <div className="bg-gradient-to-r from-[#FF6600] via-amber-500 to-yellow-500 text-white p-4 flex items-center justify-between relative shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-2xl border border-white/30 shadow-inner">
                🦉
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm text-white drop-shadow-sm">
                    Trợ Giảng AI Socratic
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Đang trực tuyến" />
                </div>
                <p className="text-[10px] text-orange-100 font-semibold truncate max-w-[190px]">
                  Giải đáp mọi file PDF, Word, PPT & Video
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 hover:bg-white/20 rounded-xl text-white/90 hover:text-white transition"
                title="Làm mới cuộc trò chuyện"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-xl text-white/90 hover:text-white transition"
                title="Thu nhỏ"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* B. ACTIVE LESSON CONTEXT SELECTOR PILL */}
          <div className="bg-orange-50/80 border-b border-orange-200 px-3.5 py-2 relative">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${badge.bg}`}>
                  {badge.icon}
                  <span>{badge.label}</span>
                </span>
                <p className="text-xs font-black text-gray-800 truncate" title={selectedMaterial?.title}>
                  {selectedMaterial?.title || 'Bài học hiện tại'}
                </p>
              </div>

              {/* Change Context Dropdown Button */}
              <button
                onClick={() => setIsContextDropdownOpen(!isContextDropdownOpen)}
                className="text-[10px] font-bold text-orange-600 hover:text-orange-700 bg-white px-2 py-1 rounded-lg border border-orange-200 shadow-sm flex items-center gap-1 flex-shrink-0"
              >
                <span>Đổi bài</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* Context Selector Dropdown Menu */}
            {isContextDropdownOpen && (
              <div className="absolute top-full left-2 right-2 mt-1 bg-white rounded-2xl border-2 border-orange-200 shadow-2xl z-30 p-2 space-y-1.5 max-h-56 overflow-y-auto animate-fade-in">
                <p className="text-[10px] font-black uppercase text-gray-400 px-2 py-1">
                  Chọn tài liệu bài học để Thầy/Cô AI hỗ trợ:
                </p>
                {DEFAULT_LESSON_CONTEXTS.map((item) => {
                  const itemBadge = getFileBadge(item.content_type);
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedMaterial(item);
                        setIsContextDropdownOpen(false);
                      }}
                      className={`p-2 rounded-xl cursor-pointer text-xs flex items-center gap-2 transition ${
                        selectedMaterial?.id === item.id
                          ? 'bg-orange-100 font-black text-orange-900 border border-orange-300'
                          : 'hover:bg-orange-50/60 text-gray-700'
                      }`}
                    >
                      <span className={`p-1 rounded-md ${itemBadge.bg}`}>
                        {itemBadge.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate text-xs">{item.title}</p>
                        <p className="text-[10px] text-gray-400">{item.subject} • {item.grade_level}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* C. QUICK SUGGESTED PROMPTS PILLS */}
          <div className="px-3 pt-2 pb-1.5 bg-white border-b border-gray-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => handleSendMessage('Thầy/Cô ơi, hãy tóm tắt nội dung chính của tài liệu bài học này cho em với ạ!')}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-[10px] font-black whitespace-nowrap transition active:scale-95 flex items-center gap-1"
            >
              📄 <span>Tóm tắt bài học</span>
            </button>

            <button
              onClick={() => handleSendMessage('Gợi ý cho em các bước giải bài tập trong tài liệu này nhé!')}
              className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 rounded-full text-[10px] font-black whitespace-nowrap transition active:scale-95 flex items-center gap-1"
            >
              💡 <span>Gợi ý cách giải</span>
            </button>

            <button
              onClick={() => handleSendMessage('Cho em 1 ví dụ hoặc bài tập tương tự để em tự luyện tập nhé!')}
              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-[10px] font-black whitespace-nowrap transition active:scale-95 flex items-center gap-1"
            >
              🔢 <span>Bài tập tương tự</span>
            </button>
          </div>

          {/* D. CHAT MESSAGES SCROLL AREA */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#FFFDF9]">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center text-base shadow flex-shrink-0 mt-0.5 border border-white">
                      🦉
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm space-y-1.5 ${
                      isAi
                        ? 'bg-white text-gray-800 border border-orange-100 rounded-tl-sm'
                        : 'bg-gradient-to-r from-[#FF6600] to-orange-500 text-white rounded-tr-sm font-semibold'
                    }`}
                  >
                    {/* Message content with Latex Math Renderer support */}
                    <div className="prose prose-xs max-w-none text-xs break-words">
                      <LatexRenderer content={msg.message_text} />
                    </div>

                    {/* Footer AI actions (Text-to-speech speaker & timestamp) */}
                    <div className={`flex items-center justify-between gap-2 pt-1 border-t ${isAi ? 'border-gray-100 text-gray-400' : 'border-white/20 text-orange-100'}`}>
                      <span className="text-[9px]">
                        {new Date(msg.created_at || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      {isAi && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => speakText(msg.message_text)}
                            className="p-1 hover:bg-gray-100 rounded-md text-orange-600 transition"
                            title="Nghe đọc bài giải"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Đồng bộ DB
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {!isAi && (
                    <img
                      src={userProfile?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=student'}
                      alt="Student"
                      className="w-7 h-7 rounded-full bg-white border border-orange-300 flex-shrink-0 mt-0.5"
                    />
                  )}
                </div>
              );
            })}

            {/* Typing Loader */}
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-400 text-xs italic p-2">
                <span className="text-base animate-bounce">🦉</span>
                <span className="text-[11px] font-bold text-orange-600">Trợ Giảng AI đang đọc tài liệu và suy nghĩ câu trả lời...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* E. INPUT AREA */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white border-t border-orange-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Hỏi Trợ Giảng AI về tài liệu bài học này..."
              disabled={isLoading}
              className="flex-1 bg-gray-50 border-2 border-orange-200 focus:border-orange-500 rounded-2xl px-3.5 py-2.5 text-xs text-gray-800 font-semibold focus:outline-none transition"
            />

            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="bg-[#FF6600] hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2.5 rounded-2xl shadow-md transition transform active:scale-95 flex-shrink-0"
              title="Gửi câu hỏi"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
};

export default AiTutorChatWidget;
