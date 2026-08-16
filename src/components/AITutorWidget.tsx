import React, { useState } from 'react';
import { Bot, Send, Sparkles, User, RefreshCw, MessageSquare, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Course, Lesson } from '../types';

interface AITutorWidgetProps {
  course?: Course | null;
  lesson?: Lesson | null;
}

interface Message {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  time: string;
}

export const AITutorWidget: React.FC<AITutorWidgetProps> = ({ course, lesson }) => {
  const { user, t, language } = useAuth();

  const isRtl = language !== 'en';

  const [inputQuestion, setInputQuestion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-init',
      sender: 'tutor',
      text: `بخێرهاتی ${user?.full_name || 'قوتابیێ هێژا'}! ئەزم مامۆستایێ تە یێ ژیر د ئەکادیمیایا ئەلفا دا. هەر پرسیارەکا تە هەبیت ل سەر وانەیا "${lesson?.title || 'ڤێ وانەیێ'}" بپرسه.`,
      time: new Date().toLocaleTimeString(language === 'en' ? 'en-US' : 'ar-IQ', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const quickPrompts = [
    'پوختەیا وانەیێ د ٣ خالان دا',
    'یاسا یان خاڵێن سەرەکی چنە؟',
    'هاریکارییا من بکە د وەڵامدانێ دا'
  ];

  const handleSend = async (questionText?: string) => {
    const query = questionText || inputQuestion.trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString(language === 'en' ? 'en-US' : 'ar-IQ', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          courseTitle: course?.title || 'General Course',
          lessonTitle: lesson?.title || 'General Lesson',
          studentName: user?.full_name || 'Student',
          language: language
        })
      });

      let data: any = {};
      try {
        const text = await response.text();
        if (text && text.trim()) data = JSON.parse(text);
      } catch (e) {
        data = {};
      }
      
      const tutorReplyText = data.reply || 'Sorry, I am unable to generate a response right now. Please try again.';

      const tutorMsg: Message = {
        id: 'tut-' + Date.now(),
        sender: 'tutor',
        text: tutorReplyText,
        time: new Date().toLocaleTimeString(language === 'en' ? 'en-US' : 'ar-IQ', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, tutorMsg]);
    } catch (err) {
      console.error("AI Tutor Error:", err);
      const errorMsg: Message = {
        id: 'tut-err-' + Date.now(),
        sender: 'tutor',
        text: 'A connection error occurred. Please check your network or try again later.',
        time: new Date().toLocaleTimeString(language === 'en' ? 'en-US' : 'ar-IQ', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-gradient-to-b from-sky-50/50 via-white to-white rounded-3xl border border-sky-100 shadow-sm overflow-hidden flex flex-col h-[480px] ${isRtl ? 'dir-rtl' : 'dir-ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Tutor Header */}
      <div className="bg-gradient-to-r from-[#2B7FE0] to-[#1E5BB0] px-5 py-3.5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-amber-300">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold">{t('aiTutorTitle')}</h4>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-[11px] text-sky-100">پشتیڤانییا ئۆنلاین ٢٤/٧</p>
          </div>
        </div>

        <span className="text-[10px] bg-white/10 px-2 py-1 rounded-full border border-white/20">
          Gemini AI
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 max-w-[85%] ${
              msg.sender === 'user' ? (isRtl ? 'mr-auto flex-row-reverse' : 'ml-auto') : (isRtl ? 'ml-auto' : 'mr-auto')
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${
                msg.sender === 'user'
                  ? 'bg-slate-800 text-white'
                  : 'bg-[#2B7FE0] text-white shadow-xs'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-slate-800 text-white rounded-tl-none'
                  : 'bg-sky-50/90 text-slate-800 border border-sky-100 rounded-tr-none shadow-2xs'
              }`}
            >
              <p>{msg.text}</p>
              <span
                className="text-[9px] block mt-1.5 text-slate-400"
              >
                {msg.time}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs bg-sky-50/60 p-3 rounded-2xl max-w-xs border border-sky-100">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2B7FE0]" />
            <span>دبیرهاتن و بەرسڤدان دایە...</span>
          </div>
        )}
      </div>

      {/* Quick Suggestion Chips */}
      <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
        <Sparkles className="w-3.5 h-3.5 text-[#2B7FE0] shrink-0" />
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 rounded-full bg-white hover:bg-sky-50 text-slate-700 hover:text-[#2B7FE0] border border-slate-200 shrink-0 transition-colors cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-white border-t border-slate-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder={t('askAnything')}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2B7FE0]"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || loading}
            className="w-10 h-10 rounded-xl bg-[#2B7FE0] hover:bg-[#1E5BB0] text-white flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Send className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
        </form>
      </div>

    </div>
  );
};
