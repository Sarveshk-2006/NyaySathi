import React, { useState, useRef } from 'react';
import { Mic, StopCircle } from 'lucide-react';
import { PageContainer } from '../layout/PageContainer';
import { Card } from '../shared';

const MultiLanguageVoice = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Browser not supported");
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'en-IN';
    recognitionRef.current.onresult = (e: any) => setTranscript(e.results[0][0].transcript);
    recognitionRef.current.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  return (
    <PageContainer title="Voice Assistant" subtitle="Speak your legal query in your preferred language.">
      <Card className="max-w-3xl mx-auto p-12 text-center">
        <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-10 transition-all duration-500 ${isListening ? 'bg-red-50 ring-4 ring-red-100 animate-pulse' : 'bg-slate-900/5 ring-4 ring-slate-50'}`}>
          <Mic className={`w-14 h-14 ${isListening ? 'text-red-500' : 'text-slate-900'}`} />
        </div>
        
        <div className="flex justify-center gap-6 mb-10">
          {!isListening ? (
            <button onClick={startListening} className="px-10 py-4 bg-slate-900 text-white rounded-full font-bold shadow-xl hover:scale-105 transition-all text-lg flex items-center gap-2">
              <Mic className="w-5 h-5" /> Start Recording
            </button>
          ) : (
            <button onClick={stopListening} className="px-10 py-4 bg-red-500 text-white rounded-full font-bold shadow-xl hover:scale-105 transition-all text-lg flex items-center gap-2">
              <StopCircle className="w-5 h-5" /> Stop Recording
            </button>
          )}
        </div>

        <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} className="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl min-h-[200px] mb-8 text-xl leading-relaxed text-center font-medium focus:ring-2 focus:ring-slate-900/20 outline-none resize-none text-slate-800" placeholder="Tap record and start speaking..." />
        
        <button onClick={() => { localStorage.setItem('nyaysaathi_initial_query', transcript); onNavigate('predict'); }} className="w-full py-4 bg-white border-2 border-slate-900 text-slate-900 font-bold rounded-xl hover:bg-slate-900 hover:text-white transition-all text-lg shadow-sm">
          Analyze Transcript with AI
        </button>
      </Card>
    </PageContainer>
  );
};

export default MultiLanguageVoice;
