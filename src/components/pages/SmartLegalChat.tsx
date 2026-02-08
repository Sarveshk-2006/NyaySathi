import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, Send } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { PageContainer } from '../layout/PageContainer';
import { Card } from '../shared';
import ipcDataSource from '../../data/ipc.json';
import constitutionalRightsDataSource from '../../data/constitutional-rights.json';

const ipcData = ipcDataSource || [];
const constitutionalRightsData = constitutionalRightsDataSource || [];

const SmartLegalChat = () => {
  const starterPrompts = [
    "Draft a simple FIR for theft of a mobile phone",
    "What to do if a landlord is refusing to return my deposit?",
    "Steps to file a domestic violence complaint in India",
    "Explain Section 420 IPC and possible defenses",
    "What are my rights during police arrest under CrPC?"
  ];

  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; text: string; sources?: any[] }>>([
    {
      role: 'ai',
      text: "Namaste! I am your AI Legal Assistant. Ask me about FIRs, property disputes, contracts, consumer complaints, or your rights. I will keep it concise and practical."
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);
  const [preferredLanguage, setPreferredLanguage] = useState<'auto' | 'en' | 'hi' | 'mr'>('auto');
  const { currentUser } = useAuth();

  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  };

  useEffect(scrollToBottom, [messages]);

  const buildLocalContext = (userMsg: string) => {
    const text = userMsg.toLowerCase();
    const keywords = text.split(/\W+/).filter(Boolean).slice(0, 8);
    const matchScore = (content: string) => {
      const lowered = content.toLowerCase();
      return keywords.reduce((score, k) => score + (lowered.includes(k) ? 1 : 0), 0);
    };

    const topIpc = ipcData
      .map((item: any) => ({
        ...item,
        _score: matchScore(`${item.section} ${item.title} ${item.description}`)
      }))
      .filter((item: any) => item._score > 0)
      .sort((a: any, b: any) => b._score - a._score)
      .slice(0, 3);

    const topRights = constitutionalRightsData
      .map((item: any) => ({ ...item, _score: matchScore(`${item.article} ${item.title} ${item.description}`) }))
      .filter((item: any) => item._score > 0)
      .sort((a: any, b: any) => b._score - a._score)
      .slice(0, 2);

    const sectionsText = topIpc
      .map((i: any) => `IPC Section ${i.section}: ${i.title} - ${i.description}`)
      .join('\n');
    const rightsText = topRights
      .map((r: any) => `Constitution Article ${r.article || ''} ${r.title}: ${r.description}`)
      .join('\n');

    const combined = [sectionsText, rightsText].filter(Boolean).join('\n');
    return combined.slice(0, 3500);
  };

  const sendMessage = async (promptText?: string) => {
    const userMsg = (promptText ?? input).trim();
    if (!userMsg) return;

    const historyPayload = messages.slice(-6).map(m => ({ role: m.role, text: m.text }));
    const localContext = buildLocalContext(userMsg);

    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8001/api/smart-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: historyPayload, context: localContext, preferredLanguage })
      });
      const data = await response.json();

      const aiText = data?.text || "I could not generate a response right now. Please try again.";
      setMessages(prev => [...prev, { role: 'ai', text: aiText, sources: data?.sources }]);

      if (currentUser) {
        addDoc(collection(db, 'history', currentUser.uid, 'queries'), {
          type: "SmartChat",
          query: userMsg,
          response: aiText,
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error('Smart chat error:', err);
      setMessages(prev => [...prev, { role: 'ai', text: "I am having trouble reaching the server. Please try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <PageContainer title="Smart Legal Chat" subtitle="Guided, concise legal answers with references to IPC/CrPC/Constitution when available.">
      <Card className="h-[75vh] flex flex-col p-0 border-t-0 bg-slate-50">
        {/* Starter prompts */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 bg-white/70 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-slate-700">Try a quick question</p>
              <p className="text-xs text-slate-500">Tap to auto-fill and send.</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                Answer language
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value as any)}
                  className="text-xs px-3 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-700 focus:outline-none"
                >
                  <option value="auto">Auto-detect</option>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="mr">Marathi</option>
                </select>
              </label>
              <div className="flex gap-2 flex-wrap">
                {starterPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(p)}
                    className="text-xs px-3 py-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-sm"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div ref={chatBodyRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-amber-500 text-white'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5"/> : <Bot className="w-6 h-6"/>}
              </div>
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}`}>
                {msg.text}
                {msg.sources?.length ? (
                  <div className="mt-3 space-y-1 text-xs">
                    <p className="text-slate-400 font-semibold">References</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((s: any, idx2: number) => (
                        <a
                          key={idx2}
                          href={s.uri || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-800 transition-colors"
                        >
                          {s.title || 'Source'}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
               <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white"><Bot className="w-6 h-6"/></div>
               <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 flex gap-1">
                 <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                 <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
               </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your legal question here..." 
              className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800"
            />
            <button type="submit" disabled={isLoading} className="p-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg disabled:opacity-70">
              <Send className="w-6 h-6"/>
            </button>
          </form>
          <p className="text-[11px] text-slate-400 mt-2">Outputs are informational. Not legal advice; consult a lawyer for case-specific guidance.</p>
        </div>

      </Card>
    </PageContainer>
  );
};

export default SmartLegalChat;
