import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, ShieldCheck, Sparkles, Volume2, X, RefreshCw, MessageSquare, AlertCircle } from 'lucide-react';
import { askAiTutor, checkSafeGuard } from '../lib/aiTutorService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const StrictAiTutor = ({ materialTitle = '', materialId = null, studentId = null, isOpen = false, onClose = () => {} }) => {
  const [messages, setMessages] = useState([
    {
      role: 'tutor',
      text: `Chào em! Thầy/Cô AI rất vui được đồng hành cùng em trong bài học "${materialTitle || 'ôn tập'}"! ✨ Em đang gặp thắc mắc ở chỗ nào nè? Thầy/Cô sẽ gợi ý để em tự tìm ra đáp án nhé! 🌟`
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputPrompt.trim() || loading) return;

    const userText = inputPrompt.trim();
    setInputPrompt('');

    // Safeguard check at frontend level
    const safeguard = checkSafeGuard(userText);
    
    // Add user message to state
    const updatedMessages = [...messages, { role: 'user', text: userText }];
    setMessages(updatedMessages);
    setLoading(true);

    let aiResponseText = '';

    if (safeguard.containsOffensive) {
      aiResponseText = "⚠️ **Cảnh báo từ Thầy/Cô AI**: Bạn nhỏ ơi, Thầy/Cô AI chỉ trò chuyện khi chúng mình sử dụng ngôn từ đẹp, lịch sự và hỗ trợ bài học thôi nhé! Em hãy thử đặt lại câu hỏi ngoan ngoãn nha! 🌟";
    } else {
      // Call AI Tutor service
      aiResponseText = await askAiTutor({
        prompt: userText,
        materialContext: materialTitle,
        chatHistory: updatedMessages.slice(-6)
      });
    }

    const finalMessages = [...updatedMessages, { role: 'tutor', text: aiResponseText }];
    setMessages(finalMessages);
    setLoading(false);

    // Record AI chat session into Supabase ai_tutor_logs
    if (studentId && isSupabaseConfigured()) {
      try {
        await supabase
          .from('ai_tutor_logs')
          .insert({
            student_id: studentId,
            material_id: materialId || null,
            chat_history: finalMessages
          });
      } catch (err) {
        console.warn('AI Log error:', err);
      }
    }
  };

  // Text to Speech for Grade 1-5 kids
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const cleanedText = text.replace(/[*_#⚠️✨🌟💡🎉🚀📖🔢]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95; // Slightly slower for kids

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 w-96 max-w-[92vw] h-[550px] bg-white rounded-3xl shadow-2xl border-4 border-orange-400 flex flex-col overflow-hidden animate-slide-up">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 p-4 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-600 font-extrabold shadow">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="font-extrabold text-lg leading-tight flex items-center gap-1">
              AI Gia Sư Tự Học <Sparkles className="w-4 h-4 text-yellow-200 fill-current" />
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-orange-100 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Chế độ Socratic & SafeGuard Bật</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition"
          title="Đóng chat"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Warning banner about strict prompt rules */}
      <div className="bg-orange-50 px-3 py-1.5 border-b border-orange-100 text-[11px] text-orange-800 font-semibold flex items-center justify-between">
        <span className="flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 text-orange-600" />
          Thầy/Cô AI gợi mở suy nghĩ, không đưa trực tiếp đáp án.
        </span>
        <button
          onClick={() => setMessages([{
            role: 'tutor',
            text: `Thầy/Cô AI đã làm mới cuộc hội thoại! Em hãy hỏi lại câu hỏi của bài ${materialTitle || 'học'} nhé!`
          }])}
          className="text-orange-600 underline hover:text-orange-800 text-[10px]"
        >
          Làm mới
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto bg-[#FFFBF7] space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-end gap-2 max-w-[88%]">
              {msg.role === 'tutor' && (
                <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold shadow">
                  AI
                </div>
              )}
              
              <div
                className={`p-3.5 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-br-none'
                    : 'bg-white border border-orange-200 text-gray-800 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>

            {/* Read Aloud Voice Button for AI Tutor messages */}
            {msg.role === 'tutor' && (
              <button
                onClick={() => speakText(msg.text)}
                className="mt-1 ml-9 text-xs text-orange-600 hover:text-orange-800 flex items-center gap-1 font-bold bg-orange-100 px-2 py-0.5 rounded-full"
              >
                <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-bounce text-orange-700' : ''}`} />
                <span>{isSpeaking ? 'Đang đọc...' : 'Nghe AI đọc'}</span>
              </button>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-orange-600 text-xs font-bold bg-orange-100 p-3 rounded-2xl w-fit animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Thầy/Cô AI đang suy nghĩ câu hỏi gợi mở cho em...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Suggestions */}
      <div className="bg-amber-50 px-3 py-2 border-t border-orange-100 flex gap-1.5 overflow-x-auto text-xs">
        <button
          onClick={() => setInputPrompt("Thầy/Cô ơi, em chưa hiểu bước 1 ạ?")}
          className="whitespace-nowrap bg-white border border-orange-300 text-orange-700 px-2.5 py-1 rounded-full font-bold hover:bg-orange-100 transition"
        >
          💡 Chưa hiểu bước 1
        </button>
        <button
          onClick={() => setInputPrompt("Cho em xin gợi ý cách làm bài này?")}
          className="whitespace-nowrap bg-white border border-orange-300 text-orange-700 px-2.5 py-1 rounded-full font-bold hover:bg-orange-100 transition"
        >
          ❓ Xin gợi ý tư duy
        </button>
      </div>

      {/* Input box */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Nhập thắc mắc bài học của em..."
          className="flex-1 bg-gray-100 border border-gray-300 focus:border-orange-500 rounded-full px-4 py-2.5 text-sm font-medium focus:outline-none focus:bg-white transition"
        />
        <button
          type="submit"
          disabled={!inputPrompt.trim() || loading}
          className="w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white flex items-center justify-center shadow-md kid-btn transition"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default StrictAiTutor;
