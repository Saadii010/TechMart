import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, User, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

interface AIChatWidgetProps {
  userId?: string;
}

export default function AIChatWidget({ userId }: AIChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    { role: 'model', text: 'Hello! I am your TechMart AI Shopping Expert. I can recommend premium products, compare options, help plan your budget, explain warranty policies, check your orders, or even suggest perfect accessories. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickPrompts = [
    "Best laptop under $2500?",
    "Compare iPhone 15 Pro & Galaxy S24 Ultra",
    "Where is my order?",
    "Suggest keyboard accessories",
    "Warranty & Return Policy"
  ];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build history excluding current to prevent duplicates
      const historyToSend = messages.map(m => ({ role: m.role, text: m.text }));
      
      const res = await api.ai.chat({
        query: textToSend,
        history: historyToSend,
        userId
      });

      setMessages(prev => [...prev, { role: 'model', text: res.reply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'I apologize, but I am facing some connection drops. Please make sure your Gemini API key is configured or try again soon!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-sky-400 to-blue-600 dark:from-[#38bdf8] dark:to-blue-600 text-white dark:text-[#020617] p-4 rounded-full shadow-[0_4px_20px_rgba(56,189,248,0.35)] dark:shadow-[0_0_25px_rgba(56,189,248,0.5)] transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer font-bold group"
          id="btn-ai-floating"
        >
          <Sparkles className="h-6 w-6 animate-pulse group-hover:rotate-12 transition-transform" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out font-extrabold whitespace-nowrap text-xs uppercase tracking-wider">
            AI Assistant
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="bg-white dark:bg-[#020617]/95 dark:backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-3xl w-[380px] h-[550px] flex flex-col overflow-hidden transition-all duration-300 transform scale-100 dark:shadow-[0_0_40px_rgba(56,189,248,0.15)]"
          id="widget-ai-chat"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-400 to-blue-600 dark:from-[#38bdf8] dark:to-blue-700 text-white dark:text-[#020617] px-4 py-3.5 flex items-center justify-between shadow-md border-b dark:border-white/10">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 dark:bg-[#020617]/20 p-1.5 rounded-lg">
                <Sparkles className="h-5 w-5 text-white dark:text-[#020617] animate-pulse" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm leading-tight tracking-wide">TechMart AI Guide</h4>
                <span className="text-[10px] text-blue-100 dark:text-[#020617]/80 flex items-center gap-1 font-semibold">
                  <span className="h-1.5 w-1.5 bg-emerald-400 dark:bg-emerald-950 rounded-full animate-ping"></span> Live Assistant Core
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white dark:text-[#020617] opacity-80 hover:opacity-100 p-1 rounded-full hover:bg-white/10 dark:hover:bg-[#020617]/10 transition"
              id="btn-ai-close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#020617]/40">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div className={`p-1.5 rounded-lg flex items-center justify-center self-end h-7 w-7 ${msg.role === 'user' ? 'bg-blue-100 dark:bg-sky-400/20 text-blue-600 dark:text-sky-400' : 'bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-slate-300'}`}>
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4 text-sky-400" />}
                </div>
                <div className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 dark:bg-sky-400 text-white dark:text-[#020617] dark:font-semibold rounded-br-none' 
                    : 'bg-white dark:bg-white/5 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-white/10 rounded-bl-none'
                }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
              </div>
            ))}

            {/* Thinking / Loading indicator */}
            {isLoading && (
              <div className="flex gap-2 max-w-[85%] mr-auto">
                <div className="bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-slate-300 p-1.5 rounded-lg flex items-center justify-center self-end h-7 w-7">
                  <RefreshCw className="h-4 w-4 text-sky-400 animate-spin" />
                </div>
                <div className="p-3 rounded-2xl text-xs bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-white/10 rounded-bl-none flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  <span className="ml-1 italic">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2.5 bg-slate-100 dark:bg-[#020617] border-t border-b border-slate-200 dark:border-white/10 overflow-x-auto flex gap-2 scrollbar-none">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="text-[10px] bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 rounded-full px-3 py-1 hover:bg-blue-50 dark:hover:bg-sky-400/10 dark:hover:text-sky-400 dark:hover:border-sky-400/40 whitespace-nowrap transition cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="p-3 bg-white dark:bg-[#020617] border-t border-slate-200 dark:border-white/10 flex gap-2 items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about specs, discounts, order tracking..."
              className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 dark:focus:border-[#38bdf8] text-slate-800 dark:text-slate-100"
              id="input-ai-chat"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 dark:bg-[#38bdf8] hover:bg-blue-700 dark:hover:bg-sky-300 text-white dark:text-[#020617] p-2.5 rounded-xl disabled:bg-slate-200 dark:disabled:bg-white/5 dark:disabled:text-white/20 dark:shadow-none shadow-md transition-all cursor-pointer"
              id="btn-ai-send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
