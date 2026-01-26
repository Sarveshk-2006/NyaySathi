import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, BrainCircuit, Users, Gavel, Home, Loader2, Star, BookUser, Medal, 
  LogOut, Download, Volume2, StopCircle, Scroll, Scale, CalendarDays, Landmark, 
  ChevronRight, Mic, Search, Shield, Clock, Zap, Globe, FileSearch, Upload, 
  Bookmark, History, Menu, X, ArrowRight, CheckCircle2, Play, ExternalLink,
  MessageSquare, ThumbsUp, Filter, Plus, Info, Send, Share2, MoreHorizontal,
  Bot, User, Trophy, BookOpen, Lightbulb, RefreshCw, MessageCircle // Added MessageCircle here
} from 'lucide-react';

// --- IMPORTS ---
import { db, auth } from './firebase'; 
import { 
  collection, query, onSnapshot, QueryDocumentSnapshot, DocumentData, 
  addDoc, serverTimestamp, orderBy, deleteDoc, doc, updateDoc, arrayUnion, arrayRemove, increment 
} from 'firebase/firestore';
import { useAuth } from './contexts/AuthContext'; 
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { jsPDF } from 'jspdf'; 

// Data Imports
import ipcDataSource from './data/ipc.json';
import penaltyDataSource from './data/penalties.json';
import casesDataSource from './data/cases.json';
import constitutionalRightsDataSource from './data/constitutional-rights.json';



const ipcData = ipcDataSource || [];
const penaltyData = penaltyDataSource || [];
const casesData = casesDataSource || [];
const constitutionalRightsData = constitutionalRightsDataSource || [];

const LOGO_URL = "D:\Nyay-Sathi\citizen-legal-buddy-main\public\logo.jpeg"; 


// --- HELPER FUNCTIONS & MOCK DATA ---

const getVerdictImage = (text: string, index: number) => {
  const t = text.toLowerCase();
  const images = {
    supremeCourt: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800&h=600",
    constitution: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800&h=600",
    criminal: "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?auto=format&fit=crop&q=80&w=800&h=600",
    corporate: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800&h=600",
    family: "https://images.unsplash.com/photo-1633613286991-611fe299c4be?auto=format&fit=crop&q=80&w=800&h=600",
    digital: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800&h=600",
    default: [
      "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=800&h=600",
      "https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&q=80&w=800&h=600",
      "https://images.unsplash.com/photo-1589391886645-d51941baf7fb?auto=format&fit=crop&q=80&w=800&h=600",
    ]
  };

  if (t.includes("constitution") || t.includes("right")) return images.constitution;
  if (t.includes("criminal") || t.includes("murder") || t.includes("theft")) return images.criminal;
  if (t.includes("company") || t.includes("corporate") || t.includes("tax")) return images.corporate;
  if (t.includes("divorce") || t.includes("family") || t.includes("marriage")) return images.family;
  if (t.includes("digital") || t.includes("data") || t.includes("privacy")) return images.digital;
  if (t.includes("supreme court") || t.includes("high court")) return images.supremeCourt;
  
  return images.default[index % images.default.length];
};

const parseVerdicts = (text: string): any[] => {
  try {
    if (!text || text.trim() === '') return [];
    if (/\|\s*Case Name\s*\|/i.test(text)) {
      const lines = text.split('\n').map((l) => l.trim()).filter((l) => l !== '');
      let headerIndex = lines.findIndex((l, i) => /\|\s*Case Name\s*\|/i.test(l) && i + 1 < lines.length && /^\|?\s*[-:]+/.test(lines[i + 1] || ''));
      if (headerIndex === -1) headerIndex = lines.findIndex((l) => l.startsWith('|'));
      const results: any[] = [];
      if (headerIndex !== -1) {
        for (let i = headerIndex + 2; i < lines.length; i++) {
          const ln = lines[i];
          if (!ln.startsWith('|')) continue;
          const cols = ln.split('|').slice(1, -1).map((c) => c.trim());
          const caseName = cols[0] || 'N/A';
          const date = cols[1] || 'N/A';
          const court = cols[2] || 'N/A';
          const significance = cols.slice(3).join(' | ') || '';
          results.push({ caseName, court, date, summary: significance });
        }
        return results.map((r, idx) => ({ id: idx, caseName: r.caseName, court: r.court, date: r.date, summary: r.summary }));
      }
    }
    const possibleBlocks = text.split(/\n{2,}/).map((b) => b.trim()).filter((b) => b !== '');
    if (possibleBlocks.length > 1) {
      return possibleBlocks.map((block, index) => ({
        id: index,
        caseName: block.split('\n')[0].slice(0, 120),
        court: 'Supreme Court',
        date: new Date().toLocaleDateString(),
        summary: block,
      }));
    }
    return [{ id: 0, caseName: 'Latest Legal Update', court: 'Supreme Court', date: new Date().toLocaleDateString(), summary: text.trim() }];
  } catch (e) {
    return [{ id: 0, caseName: 'Update', court: 'N/A', date: 'N/A', summary: text }];
  }
};

const MOCK_VERDICTS = [
  {
    id: 101,
    caseName: "X vs. Union of India (Digital Privacy)",
    court: "Supreme Court of India",
    date: "15 Jan 2026",
    summary: "A landmark judgment reinforcing the right to be forgotten in the digital age. The court held that individuals have the right to request the removal of personal data from search engines under specific circumstances.",
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800&h=600",
    link: "#"
  },
  {
    id: 102,
    caseName: "State vs. ABC Corp (Environmental Compliance)",
    court: "National Green Tribunal",
    date: "10 Jan 2026",
    summary: "Strict penalties imposed on industrial units for failing to meet new emission standards. The tribunal emphasized the 'Polluter Pays' principle and mandated immediate corrective measures.",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800&h=600",
    link: "#"
  },
  {
    id: 103,
    caseName: "In Re: Guidelines for Workplace Safety",
    court: "Supreme Court of India",
    date: "05 Jan 2026",
    summary: "New guidelines issued to ensure the safety of gig workers. The court directed platform aggregators to provide basic social security benefits and accident insurance coverage.",
    imageUrl: "https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&q=80&w=800&h=600",
    link: "#"
  }
];

const MOCK_FORUM_POSTS = [
  { id: 'mock1', title: "Landlord refusing to return security deposit", author: "Rohan123", isLawyer: false, category: "Property", upvotes: 45, comments: 12, time: "2h ago", content: "I vacated my flat in Pune last month after giving 1 month notice. Now landlord is making excuses..." },
  { id: 'mock2', title: "Can I file an FIR online for a lost mobile phone?", author: "Adv. Priya Sharma", isLawyer: true, category: "Criminal", upvotes: 120, comments: 34, time: "5h ago", content: "Yes, you can. Most state police portals allow online lost article reports. Here is the process..." },
  { id: 'mock3', title: "Employment bond validity in India", author: "Techie_99", isLawyer: false, category: "Corporate", upvotes: 89, comments: 21, time: "1d ago", content: "My company is asking me to pay 2 lakhs for leaving before 2 years. Is this legal?" }
];

const LEARNING_MODULES = [
  {
    id: 1,
    title: "Rights Upon Arrest",
    desc: "Know your fundamental rights if detained by police.",
    xp: 100,
    icon: Shield,
    questions: [
      { q: "Can you be arrested without a warrant?", options: ["Yes, for cognizable offenses", "No, never", "Only at night"], ans: 0 },
      { q: "What is the time limit to produce an arrested person before a magistrate?", options: ["12 hours", "24 hours", "48 hours"], ans: 1 },
    ]
  },
  {
    id: 2,
    title: "Consumer Protection",
    desc: "How to file a complaint against defective goods.",
    xp: 150,
    icon: Scale,
    questions: [
      { q: "Which mark certifies gold purity in India?", options: ["ISI", "Agmark", "BIS Hallmark"], ans: 2 },
      { q: "Can you file a consumer complaint online?", options: ["Yes", "No"], ans: 0 },
    ]
  },
  {
    id: 3,
    title: "Cyber Crime Basics",
    desc: "Reporting online fraud and digital safety.",
    xp: 200,
    icon: Globe,
    questions: [
      { q: "What is the helpline number for Cyber Crime in India?", options: ["100", "1930", "108"], ans: 1 },
    ]
  }
];

// --- REUSABLE UI WRAPPERS ---

const PageContainer = ({ children, title, subtitle }: { children: React.ReactNode, title: string, subtitle?: string }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in relative z-10">
    <div className="text-center mb-16">
      <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4 tracking-tight drop-shadow-sm">{title}</h2>
      {subtitle && <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">{subtitle}</p>}
      <div className="h-1.5 w-24 bg-amber-500 mx-auto rounded-full mt-6 shadow-sm"></div>
    </div>
    {children}
  </div>
);

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-2xl shadow-xl border-t-4 border-amber-500 overflow-hidden hover:shadow-2xl transition-all duration-300 ${className || ''}`}>
    {children}
  </div>
);

const LegalDisclaimer = () => (
  <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-5 rounded-r-xl my-8 shadow-sm flex items-start gap-4">
    <div className="p-2 bg-amber-100/50 rounded-full flex-shrink-0">
      <Shield className="w-5 h-5 text-amber-700" />
    </div>
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wide font-serif text-amber-800 mb-1">Legal Disclaimer</h3>
      <div className="text-sm opacity-90 leading-relaxed font-medium">
        This AI assistant provides information for educational purposes only. It is not a substitute for professional legal advice. Always consult a qualified advocate.
      </div>
    </div>
  </div>
);

// --- 1. HERO & HOME PAGE ---

const HomePage = ({ onNavClick }: { onNavClick: (page: string) => void }) => {
  const coreTools = [
    { title: "Smart Chat", desc: "Chat with AI to solve legal queries instantly.", icon: MessageCircle, action: 'chat' },
    { title: "Doc Generator", desc: "Create rental agreements, affidavits & wills.", icon: FileText, action: 'docs' },
    { title: "Nyay Vidya", desc: "Gamified learning. Earn badges by learning law.", icon: Trophy, action: 'learn' },
    { title: "Voice Assistant", desc: "Speak in Hindi, Marathi, or English.", icon: Mic, action: 'voice' },
  ];

  const referenceTools = [
    { title: "IPC Lookup", desc: "Search 500+ penal code sections.", icon: Search, action: 'ipc' },
    { title: "Case Law", desc: "Browse landmark court verdicts.", icon: Landmark, action: 'cases' },
    { title: "Penalties", desc: "Calculate fines and jail terms.", icon: Scale, action: 'penalty' },
    { title: "Constitution", desc: "Know your fundamental rights.", icon: BookUser, action: 'const' },
    { title: "Find Advocate", desc: "Connect with top lawyers.", icon: Users, action: 'find' },
    { title: "Community Forum", desc: "Discuss legal issues anonymously.", icon: MessageSquare, action: 'community' },
    { title: "Recent Verdicts", desc: "Stay updated with latest judgments.", icon: Scroll, action: 'verdicts' },
  ];

  return (
    <div className="pb-20 overflow-x-hidden bg-slate-50">
      
      {/* HERO SECTION - Deep Navy Background */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px]" />
        
        <div className="container mx-auto px-6 relative z-10 text-center pt-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-400 text-sm font-bold mb-8 animate-fade-in shadow-lg">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            Nyay Saathi v2.0 Live
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-extrabold mb-8 tracking-tight leading-tight animate-slide-up drop-shadow-2xl text-white">
            Justice, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Simplified.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Your intelligent legal companion. Decode Indian law, generate documents, and find expert advocates with the power of Ethical AI.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {/* Primary Action Button - Gold */}
            <button 
              onClick={() => onNavClick('chat')}
              className="group relative px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg rounded-full shadow-lg shadow-amber-500/30 transition-all hover:scale-105 flex items-center justify-center gap-3"
            >
              Start Free Consultation 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            {/* Secondary Action Button - Transparent/Glass */}
            <button 
              onClick={() => onNavClick('find')}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold text-lg rounded-full transition-all hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
            >
              <Users className="w-5 h-5" />
              Find a Lawyer
            </button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-slate-800 text-white relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-5"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-white mb-4">How Nyay Saathi Works</h2>
            <div className="h-1.5 w-20 bg-amber-500 mx-auto rounded-full shadow-lg"></div>
            <p className="text-slate-300 mt-6 text-lg max-w-2xl mx-auto font-light">Legal assistance used to be complicated. We made it a three-step conversation.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "1. Ask or Upload", desc: "Type your query, speak in your language, or upload a document.", icon: Upload },
              { title: "2. AI Processing", desc: "Our engine scans the Constitution, IPC, and Case Laws instantly.", icon: BrainCircuit },
              { title: "3. Instant Solution", desc: "Receive a simple explanation, a drafted document, or next steps.", icon: CheckCircle2 },
            ].map((step, idx) => (
              <div key={idx} className="bg-white/5 p-10 rounded-3xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden group">
                <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-8 text-amber-400 shadow-lg group-hover:scale-110 transition-transform">
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 font-serif">{step.title}</h3>
                <p className="text-slate-300 leading-relaxed text-lg">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOOLS GRID */}
      <section className="py-24 container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <span className="text-amber-600 font-bold tracking-wider uppercase text-sm">Features</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-2">Legal Power Tools</h2>
            <p className="text-slate-600 mt-4 text-lg">Everything you need to navigate the legal system, in one dashboard.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreTools.map((tool) => (
            <button 
              key={tool.title}
              onClick={() => onNavClick(tool.action)}
              className="text-left bg-white p-8 rounded-3xl border border-slate-100 shadow-xl hover:shadow-2xl hover:border-amber-500/50 transition-all group h-full flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-900/5 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:bg-amber-500/10"></div>
              <div className="flex-1 relative z-10">
                <div className="w-14 h-14 bg-slate-900/5 rounded-2xl flex items-center justify-center mb-6 text-slate-900 group-hover:bg-slate-900 group-hover:text-amber-400 transition-colors duration-300 shadow-sm">
                  <tool.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 font-serif">{tool.title}</h3>
                <p className="text-slate-500 leading-relaxed">{tool.desc}</p>
              </div>
              <div className="mt-6 flex items-center text-sm font-bold text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0 duration-300">
                Launch Tool <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* KNOWLEDGE BASE */}
      <section className="py-24 bg-slate-100 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-slate-900 mb-6">Comprehensive Knowledge Base</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">Instant access to the pillars of Indian Law.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {referenceTools.map((tool) => (
              <button 
                key={tool.title}
                onClick={() => onNavClick(tool.action)}
                className="flex items-start gap-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-900/20 transition-all text-left group"
              >
                <div className="mt-1 p-3 bg-slate-900/5 rounded-xl text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors shadow-sm">
                  <tool.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1 text-slate-900 group-hover:text-slate-700 transition-colors">{tool.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{tool.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// --- 2. AUTH PAGE ---

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-slate-100">
        <div className="md:w-5/12 bg-slate-900 relative overflow-hidden p-12 text-white flex flex-col justify-between">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="bg-amber-500 p-2 rounded-lg shadow-lg"><Gavel className="w-6 h-6 text-slate-900" /></div>
              <h1 className="text-2xl font-serif font-bold tracking-tight">Nyay Saathi</h1>
            </div>
            <h2 className="text-4xl font-serif font-bold mb-6 leading-tight">Access Justice <br/>Anytime, Anywhere.</h2>
            <p className="text-slate-300 font-light text-lg">Your personal legal intelligence platform.</p>
          </div>
        </div>

        <div className="md:w-7/12 p-12 md:p-16 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full">
            <h3 className="text-3xl font-serif font-bold text-slate-900 mb-3">{isLogin ? 'Welcome Back' : 'Create Account'}</h3>
            <p className="text-slate-500 mb-10 text-lg">{isLogin ? 'Enter your credentials to access your workspace.' : 'Get started with your free legal assistant today.'}</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 ml-1">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 outline-none transition-all font-medium text-slate-800" placeholder="name@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 ml-1">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 outline-none transition-all font-medium text-slate-800" placeholder="••••••••" />
              </div>
              {error && <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>{error}</div>}
              <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:shadow-2xl hover:-translate-y-0.5 transition-all disabled:opacity-70 flex items-center justify-center gap-2 text-lg">
                {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (isLogin ? 'Sign In' : 'Create Account')}
                {!isLoading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
            <div className="mt-10 text-center">
              <span className="text-slate-500">{isLogin ? "New to Nyay Saathi? " : "Already have an account? "}</span>
              <button onClick={() => setIsLogin(!isLogin)} className="text-slate-900 font-bold hover:text-amber-600 transition-colors">{isLogin ? 'Create Account' : 'Sign In'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- NEW FEATURE 1: GAMIFIED LEGAL LITERACY ---

const LegalLiteracy = () => {
  const [activeModule, setActiveModule] = useState<any>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  const startModule = (mod: any) => {
    setActiveModule(mod);
    setCurrentQ(0);
    setScore(0);
    setShowResult(false);
  };

  const handleAnswer = (idx: number) => {
    if (idx === activeModule.questions[currentQ].ans) {
      setScore(s => s + 10);
    }
    
    if (currentQ + 1 < activeModule.questions.length) {
      setCurrentQ(c => c + 1);
    } else {
      setShowResult(true);
      if (!completedModules.includes(activeModule.id)) {
        setCompletedModules([...completedModules, activeModule.id]);
      }
    }
  };

  return (
    <PageContainer title="Nyay Vidya" subtitle="Gamified Legal Learning. Know your rights, earn badges.">
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Progress Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 bg-slate-900 text-white border-none">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-amber-500 rounded-full text-slate-900"><Trophy className="w-8 h-8"/></div>
              <div>
                <h3 className="text-xl font-bold font-serif">Your Progress</h3>
                <p className="text-amber-400 text-sm font-medium">{completedModules.length * 100} XP Earned</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Citizen Level</span>
                <span>{completedModules.length}/5 Modules</span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${(completedModules.length / 5) * 100}%` }}></div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
             <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Medal className="w-5 h-5 text-amber-500"/> Badges</h4>
             <div className="grid grid-cols-3 gap-2">
                {completedModules.length > 0 ? <div className="text-center"><div className="w-12 h-12 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-1 text-2xl">🥇</div><span className="text-xs">First Step</span></div> : <div className="text-center opacity-50"><div className="w-12 h-12 mx-auto bg-slate-100 rounded-full mb-1"></div><span className="text-xs">Locked</span></div>}
                {completedModules.length >= 3 ? <div className="text-center"><div className="w-12 h-12 mx-auto bg-slate-200 rounded-full flex items-center justify-center mb-1 text-2xl">⚖️</div><span className="text-xs">Advocate</span></div> : <div className="text-center opacity-50"><div className="w-12 h-12 mx-auto bg-slate-100 rounded-full mb-1"></div><span className="text-xs">Locked</span></div>}
                <div className="text-center opacity-50"><div className="w-12 h-12 mx-auto bg-slate-100 rounded-full mb-1"></div><span className="text-xs">Locked</span></div>
             </div>
          </Card>
        </div>

        {/* Modules Grid / Quiz Area */}
        <div className="lg:col-span-2">
          {!activeModule ? (
            <div className="grid md:grid-cols-2 gap-6">
              {LEARNING_MODULES.map((mod) => (
                <Card key={mod.id} className="p-6 hover:scale-[1.02] transition-transform cursor-pointer group" >
                   <div onClick={() => startModule(mod)}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-slate-100 rounded-xl text-slate-900 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        <mod.icon className="w-8 h-8"/>
                      </div>
                      {completedModules.includes(mod.id) && <CheckCircle2 className="w-6 h-6 text-green-500"/>}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{mod.title}</h3>
                    <p className="text-slate-500 text-sm mb-4">{mod.desc}</p>
                    <div className="text-xs font-bold text-amber-600 bg-amber-50 inline-block px-3 py-1 rounded-full">+{mod.xp} XP</div>
                   </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 h-full">
              {showResult ? (
                <div className="text-center py-10">
                  <Medal className="w-20 h-20 text-amber-500 mx-auto mb-6 animate-bounce"/>
                  <h3 className="text-3xl font-serif font-bold text-slate-900 mb-4">Module Completed!</h3>
                  <p className="text-slate-600 text-lg mb-8">You scored {score} points.</p>
                  <button onClick={() => setActiveModule(null)} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800">Back to Modules</button>
                </div>
              ) : (
                <div className="max-w-xl mx-auto">
                   <div className="flex justify-between items-center mb-8">
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Question {currentQ + 1}/{activeModule.questions.length}</span>
                      <button onClick={() => setActiveModule(null)} className="text-slate-400 hover:text-red-500"><X className="w-6 h-6"/></button>
                   </div>
                   <h3 className="text-2xl font-bold text-slate-900 mb-8 leading-snug">{activeModule.questions[currentQ].q}</h3>
                   <div className="space-y-4">
                      {activeModule.questions[currentQ].options.map((opt: string, idx: number) => (
                        <button 
                          key={idx} 
                          onClick={() => handleAnswer(idx)}
                          className="w-full text-left p-4 rounded-xl border-2 border-slate-100 hover:border-amber-500 hover:bg-amber-50 transition-all font-medium text-slate-700"
                        >
                          {opt}
                        </button>
                      ))}
                   </div>
                </div>
              )}
            </Card>
          )}
        </div>

      </div>
    </PageContainer>
  );
};

// --- NEW FEATURE 3: SMART LEGAL CHAT ---

const SmartLegalChat = () => {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: "Namaste! I am your AI Legal Assistant. You can ask me about Indian laws, filing FIRs, property disputes, or anything legal. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<any>(null);
  const { currentUser } = useAuth();

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8001/api/predict-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseDescription: userMsg, userId: currentUser?.uid })
      });
      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'ai', text: data.text }]);
      
      if (currentUser) {
        addDoc(collection(db, 'history', currentUser.uid, 'queries'), {
          type: "Chat Query", query: userMsg, response: data.text, createdAt: serverTimestamp()
        });
      }

    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "I apologize, but I am facing connection issues. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer title="Smart Legal Chat" subtitle="Chat with AI to understand your legal standing instantly.">
      <Card className="h-[70vh] flex flex-col p-0 border-t-0 bg-slate-50">
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-amber-500 text-white'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5"/> : <Bot className="w-6 h-6"/>}
              </div>
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}`}>
                {msg.text}
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
          <div ref={endRef}></div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleSend} className="flex gap-3">
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
        </div>

      </Card>
    </PageContainer>
  );
};

// --- COMPONENT: COMMUNITY FORUM ---

const CommunityForum = () => {
  const { currentUser } = useAuth();
  // Initialize with MOCK data so it's not empty, but update with real data if available
  const [posts, setPosts] = useState<any[]>(MOCK_FORUM_POSTS);
  const [filter, setFilter] = useState("All");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General' });
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ["All", "Property", "Criminal", "Corporate", "Family", "Civil", "General"];

  // 1. Fetch Posts Realtime
  useEffect(() => {
    const q = query(collection(db, "forum_posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const realPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // If we have real posts, use them. Otherwise keep showing MOCK posts + any real ones
      if (realPosts.length > 0) {
          setPosts(realPosts);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Comments when a post is expanded
  useEffect(() => {
    if (!expandedPostId) return;
    // Only try to fetch if it's a real post ID (mock IDs won't be in firestore)
    if (expandedPostId.startsWith('mock')) {
        setComments([]); 
        return;
    }
    
    const q = query(collection(db, "forum_posts", expandedPostId, "comments"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [expandedPostId]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
        alert("Please sign in to post on the forum.");
        return;
    }
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "forum_posts"), {
        ...newPost,
        author: currentUser.email?.split('@')[0] || "Anonymous",
        authorId: currentUser.uid,
        createdAt: serverTimestamp(),
        upvotes: 0,
        upvotedBy: [],
        commentCount: 0
      });
      setIsCreateModalOpen(false);
      setNewPost({ title: '', content: '', category: 'General' });
    } catch (error: any) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again. " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (post: any) => {
    if (!currentUser) return alert("Please login to vote");
    // Mock posts cannot be updated in DB
    if (post.id.toString().startsWith('mock')) return alert("This is a demo post. Create a real post to interact!");

    const postRef = doc(db, "forum_posts", post.id);
    const hasUpvoted = post.upvotedBy?.includes(currentUser.uid);
    
    try {
      if (hasUpvoted) {
        await updateDoc(postRef, {
          upvotes: increment(-1),
          upvotedBy: arrayRemove(currentUser.uid)
        });
      } else {
        await updateDoc(postRef, {
          upvotes: increment(1),
          upvotedBy: arrayUnion(currentUser.uid)
        });
      }
    } catch (error) {
      console.error("Error updating vote:", error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return alert("Please login to comment");
    if (!expandedPostId) return;
    if (expandedPostId.startsWith('mock')) return alert("This is a demo post. Create a real post to interact!");
    
    if (!newComment.trim()) return;
    
    try {
      const postRef = doc(db, "forum_posts", expandedPostId);
      await addDoc(collection(postRef, "comments"), {
        text: newComment,
        author: currentUser.email?.split('@')[0] || "Anonymous",
        authorId: currentUser.uid,
        createdAt: serverTimestamp()
      });
      await updateDoc(postRef, { commentCount: increment(1) });
      setNewComment('');
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleShare = (post: any) => {
    const text = `Check out this discussion on Nyay Saathi: "${post.title}"`;
    navigator.clipboard.writeText(text);
    alert("Link copied to clipboard!");
  };

  return (
    <PageContainer title="Nyay Manch" subtitle="The Citizen's Legal Forum. Discuss, share, and get verified advice.">
      
      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative animate-slide-up">
            <button onClick={() => setIsCreateModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X className="w-5 h-5"/></button>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Start a New Discussion</h3>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
                <input required value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl" placeholder="e.g. Property dispute with neighbor" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                <select value={newPost.category} onChange={e => setNewPost({...newPost, category: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl">
                  {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Details</label>
                <textarea required value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl h-32" placeholder="Describe your legal issue..." />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex justify-center items-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5"/> : "Post Discussion"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <button onClick={() => setIsCreateModalOpen(true)} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mb-6">
              <Plus className="w-5 h-5"/> New Discussion
            </button>
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><Filter className="w-4 h-4"/> Filter by Topic</h4>
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === cat ? 'bg-amber-100 text-amber-800' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-3 space-y-6">
          {posts.length === 0 ? (
            <div className="text-center text-slate-500 py-10">No discussions yet. Be the first to post!</div>
          ) : (
            posts.filter(p => filter === "All" || p.category === filter).map(post => (
              <Card key={post.id} className="p-0 border-l-4 border-l-slate-900 border-t-0 hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row">
                  {/* Vote Counter */}
                  <div className="bg-slate-50 p-4 flex sm:flex-col items-center justify-center gap-2 sm:gap-1 border-r border-slate-100 min-w-[80px]">
                    <button onClick={() => handleLike(post)} className={`p-2 rounded-full transition-all ${post.upvotedBy?.includes(currentUser?.uid) ? 'text-amber-600 bg-amber-100' : 'text-slate-400 hover:bg-slate-200'}`}>
                      <ThumbsUp className="w-5 h-5"/>
                    </button>
                    <span className="font-bold text-slate-900">{post.upvotes || 0}</span>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6 flex-1">
                    <div className="flex items-center gap-3 text-xs mb-3 flex-wrap">
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded font-bold uppercase tracking-wider">{post.category}</span>
                      <span className="text-slate-500">• Posted by <span className="font-bold text-slate-800">{post.author}</span></span>
                      <span className="text-slate-400">• {post.createdAt?.seconds ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : post.time || "Just now"}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 cursor-pointer hover:text-amber-600 transition-colors" onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}>{post.title}</h3>
                    <p className="text-slate-600 text-sm mb-4 leading-relaxed">{post.content}</p>
                    
                    <div className="flex items-center gap-4 border-t border-slate-100 pt-4">
                      <button onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">
                        <MessageSquare className="w-4 h-4"/> {post.commentCount || 0} Comments
                      </button>
                      <button onClick={() => handleShare(post)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">
                        <Share2 className="w-4 h-4"/> Share
                      </button>
                    </div>

                    {/* Comments Section */}
                    {expandedPostId === post.id && (
                      <div className="mt-6 pt-6 border-t border-slate-100 bg-slate-50/50 -mx-6 -mb-6 px-6 pb-6 animate-fade-in">
                        <h4 className="font-bold text-slate-900 mb-4">Comments</h4>
                        <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                          {comments.length === 0 ? (
                            <p className="text-sm text-slate-400 italic">No comments yet. Be the first to reply!</p>
                          ) : (
                            comments.map(c => (
                              <div key={c.id} className="bg-white p-3 rounded-xl border border-slate-200 text-sm">
                                <div className="flex justify-between mb-1">
                                  <span className="font-bold text-slate-800">{c.author}</span>
                                  <span className="text-xs text-slate-400">{c.createdAt?.toDate().toLocaleDateString()}</span>
                                </div>
                                <p className="text-slate-600">{c.text}</p>
                              </div>
                            ))
                          )}
                        </div>
                        <form onSubmit={handleAddComment} className="flex gap-2">
                          <input 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 p-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                          />
                          <button type="submit" disabled={!newComment.trim()} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50">
                            <Send className="w-4 h-4"/>
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

      </div>
    </PageContainer>
  );
};

// --- COMPONENT: RECENT VERDICTS ---

const RecentVerdicts = () => {
  const [verdicts, setVerdicts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVerdict, setSelectedVerdict] = useState<any>(null);

  useEffect(() => {
    const fetchVerdicts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:8001/api/recent-verdicts');
        let processedVerdicts = [];
        
        if (response.ok) {
            const result = await response.json();
            if (result.verdicts && Array.isArray(result.verdicts) && result.verdicts.length > 0) {
              processedVerdicts = result.verdicts.map((v: any, idx: number) => ({
                id: v.id ?? idx,
                caseName: v.caseName || v.title || `Verdict ${idx + 1}`,
                court: v.court || 'Supreme Court of India',
                date: v.date || new Date().toLocaleDateString(),
                summary: v.summary || v.description || v.content || 'No summary available.',
                imageUrl: v.imageUrl || v.image || getVerdictImage(v.caseName + " " + (v.summary || ""), idx),
                link: v.link || v.url || v.sourceUrl || '#'
              }));
            }
        }
        
        if (processedVerdicts.length === 0) {
            setVerdicts(MOCK_VERDICTS); 
        } else {
            setVerdicts(processedVerdicts);
        }

      } catch (err: any) { 
        console.warn("API failed, using mock data for demo.");
        setVerdicts(MOCK_VERDICTS);
      } 
      finally { setIsLoading(false); }
    };
    fetchVerdicts();
  }, []);

  return (
    <PageContainer title="Recent Verdicts" subtitle="Stay updated with the latest landmark judgments from the Supreme Court and High Courts.">
      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-6 border border-red-200">{error}</div>}
      
      {isLoading ? (
        <div className="text-center py-20 text-slate-500">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-slate-900 opacity-50"/>
          <p>Fetching latest court updates...</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {verdicts.map((v, idx) => (
            <Card key={idx} className="hover:shadow-2xl transition-all duration-300 border-l-0 border-t-0 border-b-4 border-b-slate-900 overflow-hidden group">
              <div className="flex flex-col md:flex-row h-full">
                {/* Image Section */}
                <div className="md:w-1/3 h-64 md:h-auto relative overflow-hidden group-hover:opacity-90 transition-opacity bg-slate-100">
                    <img 
                        src={v.imageUrl} 
                        alt="Verdict Thumbnail" 
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                        onError={(e:any) => e.target.src = 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=800&h=600'} 
                    />
                    <div className="absolute top-4 left-4">
                        <span className="px-3 py-1.5 bg-white/90 backdrop-blur text-slate-900 text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">Verdict #{idx + 1}</span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="md:w-2/3 p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                            <Scale className="w-3 h-3"/> Legal Update
                        </span>
                        <div className="hidden md:flex items-center gap-1 text-slate-500 text-sm font-medium"><CalendarDays className="w-4 h-4"/> {v.date}</div>
                    </div>
                    
                    <h3 className="text-2xl font-serif font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors leading-tight">
                        {v.caseName}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-slate-500 mb-6 text-sm font-medium">
                        <Gavel className="w-4 h-4 text-amber-600"/> {v.court}
                    </div>

                    <p className="text-slate-600 text-lg leading-relaxed line-clamp-3 mb-6 font-light">
                        {v.summary}
                    </p>
                  </div>

                  <button 
                    onClick={() => setSelectedVerdict(v)} 
                    className="inline-flex items-center gap-2 text-slate-900 font-bold hover:text-amber-600 transition-colors group/link w-fit border-b-2 border-transparent hover:border-amber-600 pb-0.5"
                  >
                    Read Full Judgment 
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform"/>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* VERDICT MODAL */}
      {selectedVerdict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-slide-up">
                <button onClick={() => setSelectedVerdict(null)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-10">
                    <X className="w-6 h-6 text-slate-600"/>
                </button>
                
                <div className="h-64 relative">
                    <img src={selectedVerdict.imageUrl} className="w-full h-full object-cover" alt="Verdict"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                        <h2 className="text-3xl font-serif font-bold text-white leading-tight">{selectedVerdict.caseName}</h2>
                    </div>
                </div>

                <div className="p-8">
                    <div className="flex flex-wrap gap-6 mb-8 text-sm font-medium text-slate-600 border-b border-slate-100 pb-6">
                        <span className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-amber-500"/> {selectedVerdict.date}</span>
                        <span className="flex items-center gap-2"><Gavel className="w-4 h-4 text-amber-500"/> {selectedVerdict.court}</span>
                        <span className="flex items-center gap-2"><Scale className="w-4 h-4 text-amber-500"/> Verdict ID: {selectedVerdict.id}</span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-4">Summary</h3>
                    <p className="text-slate-700 text-lg leading-relaxed mb-8">{selectedVerdict.summary}</p>
                    
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
                        <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><Globe className="w-4 h-4 text-amber-500"/> Key Impact</h4>
                        <p className="text-slate-600">This judgment sets a significant precedent for future cases regarding this subject matter. Legal experts suggest reviewing compliance protocols immediately.</p>
                    </div>

                    <a href={selectedVerdict.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">
                        View Official Source <ExternalLink className="w-4 h-4"/>
                    </a>
                </div>
            </div>
        </div>
      )}
    </PageContainer>
  );
};

// --- FUNCTIONAL COMPONENTS (CORE TOOLS) ---

const CaseLawDatabase = () => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('year');
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [bookmarkedCases, setBookmarkedCases] = useState<string[]>([]);
  const [cases, setCases] = useState<any[]>(casesData); 
  const [isDbLoading, setIsDbLoading] = useState(false);

  const categories = ['All', 'Fraud', 'Murder', 'Theft', 'Rape', 'Human Trafficking', 'Extortion'];

  const fetchCasesFromDB = async (crimeType: string) => {
    if (crimeType === 'All') { setCases(casesData); return; }
    setIsDbLoading(true);
    try {
      const response = await fetch(`http://localhost:8001/api/cases/${crimeType}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const sqlData = await response.json();
      const transformedCases = sqlData.map((c: any) => ({
          id: c.case_id,
          title: `${c.crime_type} Case - ${c.case_id}`,
          court: "High Court", year: "2023", caseNumber: c.case_id, category: c.crime_type,
          summary: `Sentence: ${c.sentence_severity}. Punishment: ${c.punishment_duration}.`,
          keyholding: c.ipc_description, relatedSections: [c.section_code],
          impact: "Significant precedent for this crime type."
      }));
      setCases(transformedCases);
    } catch (err) { setCases(casesData.filter(c => c.category === crimeType)); } 
    finally { setIsDbLoading(false); }
  };

  useEffect(() => { fetchCasesFromDB(selectedCategory); }, [selectedCategory]);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'users', currentUser.uid, 'bookmarks'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBookmarkedCases(snapshot.docs.filter(d => d.data().type === 'Case').map(d => d.data().data.id));
    });
    return () => unsubscribe();
  }, [currentUser]);

  const addBookmark = async () => {
    if (!currentUser || !selectedCase) return;
    await addDoc(collection(db, 'users', currentUser.uid, 'bookmarks'), { type: 'Case', data: selectedCase, createdAt: serverTimestamp() });
    alert('Bookmarked!');
  };

  const filteredCases = cases.filter((c: any) => {
    const matchesSearch = searchQuery.trim() === '' || c.title?.toLowerCase().includes(searchQuery.toLowerCase()) || c.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory || c.crime_type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedCases = [...filteredCases].sort((a, b) => {
    if (sortBy === 'year') return (b.year || 0) - (a.year || 0);
    if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
    return (a.court || '').localeCompare(b.court || '');
  });

  return (
    <PageContainer title="Case Law Database" subtitle="Search landmark Indian court cases and their rulings.">
      <Card className="p-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search cases..." className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-700">{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-700"><option value="year">Year</option><option value="title">Title</option><option value="court">Court</option></select>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 border-r border-slate-100 pr-6">
            <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-lg"><Scroll className="w-5 h-5 text-amber-500"/> Case List</h4>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {sortedCases.map((c: any) => (
                <button key={c.id} onClick={() => setSelectedCase(c)} className={`w-full text-left p-4 rounded-xl border transition-all hover:scale-[1.02] duration-200 ${selectedCase?.id === c.id ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-md'}`}>
                  <div className="font-bold text-sm mb-1 line-clamp-1">{c.title}</div>
                  <div className={`text-xs ${selectedCase?.id === c.id ? 'text-slate-300' : 'text-slate-500'}`}>{c.year} — {c.court}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            {selectedCase ? (
              <div className="animate-fade-in space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-3xl font-serif font-bold text-slate-900">{selectedCase.title}</h3>
                    <div className="flex gap-4 mt-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full font-medium"><CalendarDays className="w-4 h-4 text-amber-600"/> {selectedCase.year}</span>
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full font-medium"><Landmark className="w-4 h-4 text-amber-600"/> {selectedCase.court}</span>
                    </div>
                  </div>
                  <button onClick={addBookmark} className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${bookmarkedCases.includes(selectedCase.id) ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    <Bookmark className="w-4 h-4" /> {bookmarkedCases.includes(selectedCase.id) ? 'Saved' : 'Save'}
                  </button>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-8 rounded-2xl border border-blue-100 shadow-inner">
                  <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-amber-600"/> Summary</h4>
                  <p className="text-slate-700 leading-relaxed text-lg font-light">{selectedCase.summary}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                    <h4 className="font-bold text-slate-900 mb-2 text-sm uppercase tracking-wider flex items-center gap-2"><Gavel className="w-4 h-4 text-amber-600"/> Key Holding</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{selectedCase.keyholding}</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                    <h4 className="font-bold text-slate-900 mb-2 text-sm uppercase tracking-wider flex items-center gap-2"><Scale className="w-4 h-4 text-amber-600"/> Legal Impact</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{selectedCase.impact}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-10 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <BookUser className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">Select a case from the list to view full details</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </PageContainer>
  );
};

const DocumentGenerator = () => {
  const [docType, setDocType] = useState('rental-agreement');
  const [formData, setFormData] = useState<any>({});
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { currentUser } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const getFormFields = () => {
    switch (docType) {
      case 'rental-agreement':
        return (
          <>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Landlord Name</label>
              <input name="landlordName" onChange={handleInputChange} placeholder="Full Legal Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tenant Name</label>
              <input name="tenantName" onChange={handleInputChange} placeholder="Full Legal Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Property Address</label>
              <input name="address" onChange={handleInputChange} placeholder="Complete Address" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
            </div>
          </>
        );
      case 'affidavit':
        return (
          <>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Deponent Name (You)</label>
              <input name="deponentName" onChange={handleInputChange} placeholder="Your Full Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Father's Name</label>
              <input name="fatherName" onChange={handleInputChange} placeholder="Father's Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
            </div>
             <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Statement of Facts</label>
              <textarea name="facts" onChange={handleInputChange} placeholder="I solemnly affirm that..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800 h-24" />
            </div>
          </>
        );
      case 'will':
        return (
          <>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Testator Name (Person making the will)</label>
              <input name="testatorName" onChange={handleInputChange} placeholder="Full Legal Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Beneficiary Name</label>
              <input name="beneficiaryName" onChange={handleInputChange} placeholder="Who inherits?" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
            </div>
          </>
        );
      case 'power-of-attorney':
        return (
           <>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Principal Name (Grantor)</label>
              <input name="principalName" onChange={handleInputChange} placeholder="Full Legal Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Agent Name (Attorney-in-Fact)</label>
              <input name="agentName" onChange={handleInputChange} placeholder="Full Legal Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
            </div>
          </>
        );
      case 'nda':
         return (
           <>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Disclosing Party</label>
              <input name="disclosingParty" onChange={handleInputChange} placeholder="Company/Person Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Receiving Party</label>
              <input name="receivingParty" onChange={handleInputChange} placeholder="Company/Person Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
            </div>
          </>
        );
      case 'employment-contract':
         return (
           <>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Employer</label>
              <input name="employerName" onChange={handleInputChange} placeholder="Company Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Employee</label>
              <input name="employeeName" onChange={handleInputChange} placeholder="Full Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
            </div>
          </>
        );
      case 'divorce-papers':
        return (
          <>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Spouse 1 Full Name</label>
              <input name="spouse1Name" onChange={handleInputChange} placeholder="Full Legal Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Spouse 2 Full Name</label>
              <input name="spouse2Name" onChange={handleInputChange} placeholder="Full Legal Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" />
            </div>
          </>
        );
      default: return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8001/api/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType, formData })
      });
      const { text } = await response.json();
      setGeneratedDoc(text);
      if (currentUser) {
        await addDoc(collection(db, 'history', currentUser.uid, 'queries'), {
          type: "Document Generation", query: `Generated: ${docType}`, response: text, createdAt: serverTimestamp()
        });
      }
    } catch (err: any) { alert(err.message); } finally { setIsLoading(false); }
  };

  const handleDownloadPDF = () => {
    if (!generatedDoc) return;

    const doc = new jsPDF('p', 'pt', 'a4');
    const margin = 50;
    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - (margin * 2);
    
    doc.setDrawColor(0, 0, 0); 
    doc.setLineWidth(1.5);
    doc.rect(20, 20, pageWidth - 40, doc.internal.pageSize.height - 40);

    doc.setFont("times", "bold");
    doc.setFontSize(18);
    const title = docType.replace(/-/g, ' ').toUpperCase();
    doc.text(title, pageWidth / 2, 60, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont("times", "italic");
    doc.text("(Generated via Nyay Saathi AI)", pageWidth / 2, 75, { align: 'center' });

    doc.setFont("times", "normal");
    doc.setFontSize(12);
    
    const lines = doc.splitTextToSize(generatedDoc, contentWidth);
    
    let y = 100;
    const lineHeight = 16; 

    for (let i = 0; i < lines.length; i++) {
        if (y + lineHeight > doc.internal.pageSize.height - 70) {
            doc.addPage();
            doc.rect(20, 20, pageWidth - 40, doc.internal.pageSize.height - 40);
            y = 60; 
        }
        doc.text(lines[i], margin, y); 
        y += lineHeight;
    }

    y += 40;
    
    if (y + 100 > doc.internal.pageSize.height - 40) {
        doc.addPage();
        doc.rect(20, 20, pageWidth - 40, doc.internal.pageSize.height - 40);
        y = 60;
    }

    doc.setFont("times", "bold");
    
    let leftLabel = "Party A";
    let rightLabel = "Party B";

    if (docType === 'rental-agreement') { leftLabel = "Landlord"; rightLabel = "Tenant"; }
    else if (docType === 'affidavit') { leftLabel = "Deponent"; rightLabel = "Notary Public"; }
    else if (docType === 'will') { leftLabel = "Testator"; rightLabel = "Witness"; }
    else if (docType === 'power-of-attorney') { leftLabel = "Principal"; rightLabel = "Agent"; }
    else if (docType === 'nda') { leftLabel = "Disclosing Party"; rightLabel = "Receiving Party"; }
    else if (docType === 'employment-contract') { leftLabel = "Employer"; rightLabel = "Employee"; }
    else if (docType === 'divorce-papers') { leftLabel = "Spouse 1"; rightLabel = "Spouse 2"; }

    doc.text("__________________________", margin, y);
    doc.text("__________________________", pageWidth - margin - 150, y);
    
    y += 20;
    doc.text(`Signed by ${leftLabel}`, margin, y);
    doc.text(`Signed by ${rightLabel}`, pageWidth - margin - 150, y);

    // 5. FOOTER
    y += 40;
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    const today = new Date().toLocaleDateString();
    doc.text(`Date: ${today}`, margin, y);
    doc.text(`Place: __________________`, pageWidth - margin - 150, y);

    doc.save(`${docType}_Legal_Draft.pdf`);
  };

  const handleSpeak = () => {
    if (!generatedDoc) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(generatedDoc);
    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
  };

  return (
    <PageContainer title="AI Document Drafter" subtitle="Generate legally compliant drafts in seconds.">
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-8 h-fit shadow-xl">
          <div className="mb-6 flex items-center gap-3 text-slate-900">
            <div className="p-2 bg-slate-900/5 rounded-lg"><FileText className="w-6 h-6"/></div>
            <h3 className="text-xl font-bold font-serif">Input Details</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Document Type</label>
              <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800">
                <option value="rental-agreement">Rental Agreement</option>
                <option value="affidavit">General Affidavit</option>
                <option value="will">Last Will & Testament</option>
                <option value="power-of-attorney">Power of Attorney</option>
                <option value="nda">Non-Disclosure Agreement (NDA)</option>
                <option value="employment-contract">Employment Contract</option>
                <option value="divorce-papers">Divorce Papers (Mutual)</option>
              </select>
            </div>
            
            <div className="space-y-4">
              {getFormFields()}
            </div>
            
            <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/30 hover:bg-slate-800 hover:scale-[1.02] transition-all flex justify-center items-center gap-2 mt-4">
              {isLoading ? <Loader2 className="animate-spin w-5 h-5"/> : <><Zap className="w-5 h-5 text-amber-400"/> Generate Draft</>}
            </button>
          </form>
        </Card>

        {generatedDoc ? (
          <Card className="p-8 bg-slate-50/50 border-t-4 border-green-500 animate-slide-up">
            <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
              <h3 className="font-bold text-slate-900 text-xl font-serif">Document Preview</h3>
              <div className="flex gap-2">
                <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-900 rounded-lg shadow-sm text-white font-bold hover:bg-slate-800 transition-all">
                    <Download className="w-4 h-4"/> Download PDF
                </button>
                {isSpeaking ? (
                    <button onClick={() => { handleStop(); setIsSpeaking(false); }} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                        <StopCircle className="w-5 h-5"/>
                    </button>
                ) : (
                    <button onClick={() => { handleSpeak(); setIsSpeaking(true); }} className="p-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300">
                        <Volume2 className="w-5 h-5"/>
                    </button>
                )}
              </div>
            </div>
            <div className="prose prose-lg max-w-none text-slate-700 whitespace-pre-wrap font-serif leading-relaxed p-6 bg-white rounded-xl shadow-inner border border-slate-100 h-[600px] overflow-y-auto">
              {generatedDoc}
            </div>
            <LegalDisclaimer />
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-300 rounded-3xl text-slate-400 bg-slate-50/50">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-lg font-medium text-slate-500">Document preview will appear here</p>
            <p className="text-sm">Fill the details to generate your draft</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

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

const AdvocateFinder = ({ onProfileSelect }: { onProfileSelect: (lawyer: any) => void }) => {
  const [allLawyers, setAllLawyers] = useState<any[]>([]);
  
  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(db, "advocates")), (snap) => {
      setAllLawyers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <PageContainer title="Find an Advocate" subtitle="Connect with top-rated legal professionals.">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allLawyers.map(lawyer => (
          <Card key={lawyer.id} className="p-8 hover:-translate-y-2 transition-all duration-300 group">
            <div className="flex items-center gap-5 mb-6">
              <div className="relative">
                <img src={lawyer.imageUrl} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg" alt={lawyer.name} onError={(e:any)=>e.target.src='https://placehold.co/100'} />
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-slate-900">{lawyer.name}</h3>
                <p className="text-sm text-amber-600 font-bold tracking-wide uppercase mt-1">{lawyer.specialty}</p>
                <div className="flex items-center gap-1 text-sm text-slate-500 mt-1"><Home className="w-3 h-3"/> {lawyer.city}</div>
              </div>
            </div>
            <div className="flex justify-between text-sm text-slate-600 bg-slate-50 p-5 rounded-2xl mb-8 border border-slate-100">
              <div className="text-center">
                <strong className="block text-lg text-slate-900">{lawyer.experience}</strong>
                <span className="text-xs uppercase tracking-wider text-slate-400">Years</span>
              </div>
              <div className="w-px bg-slate-200 h-8 self-center"></div>
              <div className="text-center">
                <strong className="block text-lg text-slate-900">{lawyer.casesWon}</strong>
                <span className="text-xs uppercase tracking-wider text-slate-400">Won</span>
              </div>
              <div className="w-px bg-slate-200 h-8 self-center"></div>
              <div className="text-center">
                <strong className="block text-lg text-amber-500 flex items-center justify-center gap-1">{lawyer.rating} <Star className="w-3 h-3 fill-current"/></strong>
                <span className="text-xs uppercase tracking-wider text-slate-400">Rating</span>
              </div>
            </div>
            <button onClick={() => onProfileSelect(lawyer)} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]">
              View Full Profile <ArrowRight className="w-4 h-4"/>
            </button>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
};

const AdvocateProfile = ({ lawyer, onBack }: { lawyer: any, onBack: () => void }) => (
  <PageContainer title="Advocate Profile" subtitle="">
    <button onClick={onBack} className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200 w-fit">&larr; Back to Directory</button>
    <Card className="overflow-hidden shadow-2xl">
      <div className="bg-slate-900 p-12 text-white flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>
        
        <img src={lawyer.imageUrl} className="w-48 h-48 rounded-full border-8 border-white/10 shadow-2xl relative z-10" alt="" onError={(e:any)=>e.target.src='https://placehold.co/100'} />
        <div className="text-center md:text-left relative z-10">
          <h2 className="text-5xl font-serif font-bold mb-3">{lawyer.name}</h2>
          <p className="text-amber-400 text-xl font-bold tracking-wide uppercase mb-6 flex items-center justify-center md:justify-start gap-3">
            {lawyer.specialty} <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span> {lawyer.city}
          </p>
          <div className="flex gap-4 justify-center md:justify-start">
            <span className="px-5 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium border border-white/10 text-slate-200">Exp: {lawyer.experience} Years</span>
            <span className="px-5 py-2 bg-amber-500 text-white rounded-full text-sm font-bold flex items-center gap-1 shadow-lg"><Star className="w-4 h-4 fill-current"/> {lawyer.rating} Rating</span>
          </div>
        </div>
      </div>
      <div className="p-12 grid md:grid-cols-3 gap-12 bg-white">
        <div className="md:col-span-2 space-y-10">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Biography</h3>
            <p className="text-slate-600 leading-relaxed text-lg font-light">{lawyer.bio || "Experienced legal practitioner with a proven track record in high-stakes litigation..."}</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Credentials</h3>
            <ul className="list-disc pl-5 text-slate-700 space-y-2 text-lg">
              <li>{lawyer.education || "LL.B (Hons) - National Law School of India University"}</li>
              <li>Member of Bar Council of India</li>
              <li>Specialized Certification in Constitutional Law</li>
            </ul>
          </div>
        </div>
        <div>
          <div className="p-8 bg-slate-50 border border-slate-100 rounded-3xl sticky top-24">
            <h3 className="font-bold text-slate-900 mb-6 text-xl font-serif">Contact {lawyer.name.split(' ')[0]}</h3>
            <button className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all mb-4 flex items-center justify-center gap-2">
              <CalendarDays className="w-5 h-5"/> Book Consultation
            </button>
            <button className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all">Send Message</button>
            <div className="mt-6 text-center text-xs text-slate-400">Response time: usually within 24 hours</div>
          </div>
        </div>
      </div>
    </Card>
  </PageContainer>
);

const IPCLookup = () => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState(ipcData.slice(0, 50));
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    const q = search.toLowerCase();
    setResults(ipcData.filter((i:any) => i.section.toString().includes(q) || i.title.toLowerCase().includes(q)).slice(0, 50));
  }, [search]);

  return (
    <PageContainer title="IPC Lookup" subtitle="Instant access to Indian Penal Code sections.">
      <Card className="min-h-[700px] flex flex-col md:flex-row overflow-hidden border-0 shadow-2xl">
        <div className="md:w-1/3 border-r border-slate-100 p-6 bg-slate-50">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Section..." className="w-full p-4 pl-12 bg-white border border-slate-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-slate-900/10 font-medium text-slate-800" />
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {results.map((r:any) => (
              <button key={r.section} onClick={() => setSelected(r)} className={`w-full text-left p-4 rounded-xl transition-all border ${selected?.section === r.section ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white border-transparent hover:bg-white hover:border-slate-200 hover:shadow-sm'}`}>
                <div className="font-bold text-sm mb-1 flex justify-between">
                  <span>Section {r.section}</span>
                  {selected?.section === r.section && <ChevronRight className="w-4 h-4 text-amber-400"/>}
                </div>
                <div className={`text-xs truncate ${selected?.section === r.section ? 'text-slate-300' : 'text-slate-500'}`}>{r.title}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="md:w-2/3 p-12 bg-white">
          {selected ? (
            <div className="animate-fade-in h-full flex flex-col">
              <div className="inline-block px-4 py-1 bg-amber-50 text-amber-800 font-bold rounded-full text-sm mb-6 w-fit border border-amber-100">Section {selected.section}</div>
              <h3 className="text-4xl font-serif font-bold text-slate-900 mb-8 leading-tight">{selected.title}</h3>
              <div className="prose prose-lg max-w-none text-slate-600 leading-loose text-lg font-light flex-grow">
                {selected.description}
              </div>
              <div className="mt-12 pt-8 border-t border-slate-100 flex gap-4">
                <button className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2"><Download className="w-4 h-4"/> PDF</button>
                <button className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2"><Bookmark className="w-4 h-4"/> Save</button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 bg-slate-50/30 rounded-3xl border-2 border-dashed border-slate-200">
              <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-xl font-medium text-slate-600">Select a section to view details</p>
            </div>
          )}
        </div>
      </Card>
    </PageContainer>
  );
};

const PenaltyCalculator = () => (
  <PageContainer title="Penalty Calculator" subtitle="Check punishments for various offenses.">
    <Card className="p-12 text-center text-slate-500 bg-slate-50/50 border-2 border-dashed border-slate-200">
      <Scale className="w-20 h-20 mx-auto mb-6 opacity-20" />
      <p className="text-xl font-light">Select a section from the IPC Lookup tool to view detailed penalty calculations.</p>
    </Card>
  </PageContainer>
);

const HistoryPage = () => {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  useEffect(() => {
    if(!currentUser) return;
    return onSnapshot(query(collection(db, 'history', currentUser.uid, 'queries'), orderBy('createdAt', 'desc')), (snap) => {
      setHistory(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
  }, [currentUser]);

  return (
    <PageContainer title="Activity History" subtitle="Your past legal queries and generated documents.">
      <div className="space-y-6">
        {history.map(item => (
          <Card key={item.id} className="p-6 hover:shadow-lg transition-all border-l-4 border-l-amber-500 border-t-0">
            <div className="flex items-center gap-4 mb-3">
              <span className="px-4 py-1.5 bg-slate-100 rounded-full text-xs font-bold text-slate-600 uppercase tracking-wide">{item.type}</span>
              <span className="text-xs text-slate-400 font-medium">{item.createdAt?.toDate().toLocaleDateString()}</span>
            </div>
            <p className="font-medium text-slate-800 text-lg">{item.query}</p>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
};

const Bookmarks = () => (
  <PageContainer title="Saved Items" subtitle="Your bookmarked cases and sections.">
    <Card className="p-16 text-center">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Bookmark className="w-8 h-8 text-slate-300"/>
      </div>
      <p className="text-slate-500 text-lg">No bookmarks yet.</p>
    </Card>
  </PageContainer>
);

const ConstitutionalRights = () => (
  <PageContainer title="Constitutional Rights" subtitle="Know your fundamental rights.">
    <div className="grid md:grid-cols-2 gap-8">
      {constitutionalRightsData.flatMap(c => c.rights).map((r: any, i: number) => (
        <Card key={i} className="p-8 hover:shadow-2xl transition-all group border-t-0 border-b-4 border-b-transparent hover:border-b-amber-500">
          <div className="text-amber-600 font-bold text-sm tracking-widest uppercase mb-3">{r.article}</div>
          <h3 className="font-bold text-slate-900 text-xl mb-4 group-hover:text-slate-700 transition-colors">{r.title}</h3>
          <p className="text-slate-600 text-base leading-relaxed line-clamp-3">{r.description}</p>
        </Card>
      ))}
    </div>
  </PageContainer>
);

// --- 3.13 DOCUMENT ANALYZER ---

const DocumentAnalyzer = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analyzeResult, setAnalyzeResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setAnalyzeResult('');
    }
  };

  const handleAnalyzeDocument = async () => {
    if (!uploadedFile) {
      alert('Please upload a document first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await fetch('http://localhost:8001/api/analyze-document', {
        method: 'POST',
        body: formData
      });

      const { text } = await response.json();
      setAnalyzeResult(text);

      if (currentUser) {
        await addDoc(collection(db, 'history', currentUser.uid, 'queries'), {
          type: "Document Analysis",
          query: `Analyzed: ${uploadedFile.name}`,
          response: text,
          createdAt: serverTimestamp()
        });
      }
    } catch (err: any) {
      alert('Error analyzing document: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadAnalysis = () => {
    if (!analyzeResult) return;
    const doc = new jsPDF('p', 'pt', 'a4');
    const margin = 50;
    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - (margin * 2);

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1.5);
    doc.rect(20, 20, pageWidth - 40, doc.internal.pageSize.height - 40);

    doc.setFont("times", "bold");
    doc.setFontSize(18);
    doc.text("Document Analysis Report", pageWidth / 2, 60, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont("times", "italic");
    doc.text("(Generated via Nyay Saathi AI)", pageWidth / 2, 75, { align: 'center' });

    doc.setFont("times", "normal");
    doc.setFontSize(11);

    const splitText = doc.splitTextToSize(analyzeResult, contentWidth);
    doc.text(splitText, margin, 100);

    doc.save('document_analysis_report.pdf');
  };

  return (
    <PageContainer title="Document Analyzer" subtitle="Upload and analyze legal documents to understand their implications.">
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-8 h-fit shadow-xl">
          <div className="mb-6 flex items-center gap-3 text-slate-900">
            <div className="p-2 bg-slate-900/5 rounded-lg"><Upload className="w-6 h-6"/></div>
            <h3 className="text-xl font-bold font-serif">Upload Document</h3>
          </div>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:border-amber-500 hover:bg-amber-50/30 transition-all bg-slate-50/50 mb-6"
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-4 border border-slate-100">
              <Upload className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-700 font-bold mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-slate-500 text-sm">PDF, DOC, DOCX, TXT (Max 10MB)</p>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
            />
          </div>

          {uploadedFile && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-slate-700 font-medium text-sm">{uploadedFile.name}</p>
                  <p className="text-slate-500 text-xs">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <button
                onClick={() => setUploadedFile(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={handleAnalyzeDocument}
            disabled={!uploadedFile || isAnalyzing}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/30 hover:bg-slate-800 hover:scale-[1.02] transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="animate-spin w-5 h-5"/>
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 text-amber-400"/>
                Analyze Document
              </>
            )}
          </button>
        </Card>

        {analyzeResult ? (
          <Card className="p-8 bg-slate-50/50 border-t-4 border-green-500 animate-slide-up">
            <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
              <h3 className="font-bold text-slate-900 text-xl font-serif">Analysis Result</h3>
              <div className="flex gap-2">
                {isSpeaking ? (
                  <button onClick={() => { window.speechSynthesis.cancel(); setIsSpeaking(false); }} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200" title="Stop reading">
                    <StopCircle className="w-5 h-5"/>
                  </button>
                ) : (
                  <button onClick={() => { const utterance = new SpeechSynthesisUtterance(analyzeResult); utterance.onend = () => setIsSpeaking(false); window.speechSynthesis.speak(utterance); setIsSpeaking(true); }} className="p-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300" title="Read aloud">
                    <Volume2 className="w-5 h-5"/>
                  </button>
                )}
                <button onClick={handleDownloadAnalysis} className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-900 rounded-lg shadow-sm text-white font-bold hover:bg-slate-800 transition-all" title="Download as PDF">
                  <Download className="w-4 h-4"/> Download PDF
                </button>
              </div>
            </div>
            <div className="prose prose-lg max-w-none text-slate-700 whitespace-pre-wrap font-serif leading-relaxed p-6 bg-white rounded-xl shadow-inner border border-slate-100 h-[600px] overflow-y-auto">
              {analyzeResult}
            </div>
            <LegalDisclaimer />
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-300 rounded-3xl text-slate-400 bg-slate-50/50">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
              <FileSearch className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-lg font-medium text-slate-500">Analysis will appear here</p>
            <p className="text-sm">Upload a document and click analyze to get started</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

// --- 3.14 CASE PREDICTOR ---

const CasePredictor = () => {
  const [caseDescription, setCaseDescription] = useState('');
  const [prediction, setPrediction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { currentUser } = useAuth();

  // Load initial query from voice assistant if available
  useEffect(() => {
    const initialQuery = localStorage.getItem('nyaysaathi_initial_query');
    if (initialQuery) {
      setCaseDescription(initialQuery);
      localStorage.removeItem('nyaysaathi_initial_query');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseDescription.trim()) {
      alert('Please enter a case description');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8001/api/predict-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseDescription: caseDescription.trim(), userId: currentUser?.uid })
      });
      const data = await response.json();
      setPrediction(data.text);

      if (currentUser) {
        await addDoc(collection(db, 'history', currentUser.uid, 'queries'), {
          type: "Case Prediction",
          query: caseDescription,
          response: data.text,
          createdAt: serverTimestamp()
        });
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPrediction = () => {
    if (!prediction) return;
    const doc = new jsPDF('p', 'pt', 'a4');
    const margin = 50;
    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - (margin * 2);

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1.5);
    doc.rect(20, 20, pageWidth - 40, doc.internal.pageSize.height - 40);

    doc.setFont("times", "bold");
    doc.setFontSize(18);
    doc.text("Case Prediction Report", pageWidth / 2, 60, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont("times", "italic");
    doc.text("(Generated via Nyay Saathi AI)", pageWidth / 2, 75, { align: 'center' });

    doc.setFont("times", "normal");
    doc.setFontSize(12);

    const lines = doc.splitTextToSize(prediction, contentWidth);

    let y = 100;
    const lineHeight = 16;

    for (let i = 0; i < lines.length; i++) {
      if (y + lineHeight > doc.internal.pageSize.height - 70) {
        doc.addPage();
        doc.rect(20, 20, pageWidth - 40, doc.internal.pageSize.height - 40);
        y = 60;
      }
      doc.text(lines[i], margin, y);
      y += lineHeight;
    }

    doc.save('case_prediction_report.pdf');
  };

  return (
    <PageContainer title="Case Predictor" subtitle="Get AI-powered predictions on your legal case outcome and probable verdict.">
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-8 h-fit shadow-xl">
          <div className="mb-6 flex items-center gap-3 text-slate-900">
            <div className="p-2 bg-slate-900/5 rounded-lg"><BrainCircuit className="w-6 h-6"/></div>
            <h3 className="text-xl font-bold font-serif">Case Details</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Describe Your Case</label>
              <textarea
                value={caseDescription}
                onChange={(e) => setCaseDescription(e.target.value)}
                placeholder="Provide details about your case, the parties involved, the dispute, applicable laws, and what you're seeking..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800 placeholder-slate-500 h-40 resize-none"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/30 hover:bg-slate-800 hover:scale-[1.02] transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5"/>
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 text-amber-400"/>
                  Get Prediction
                </>
              )}
            </button>
          </form>
        </Card>

        {prediction ? (
          <Card className="p-8 bg-slate-50/50 border-t-4 border-green-500 animate-slide-up">
            <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
              <h3 className="font-bold text-slate-900 text-xl font-serif">Prediction Result</h3>
              <div className="flex gap-2">
                {isSpeaking ? (
                  <button onClick={() => { window.speechSynthesis.cancel(); setIsSpeaking(false); }} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200" title="Stop reading">
                    <StopCircle className="w-5 h-5"/>
                  </button>
                ) : (
                  <button onClick={() => { const utterance = new SpeechSynthesisUtterance(prediction); utterance.onend = () => setIsSpeaking(false); window.speechSynthesis.speak(utterance); setIsSpeaking(true); }} className="p-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300" title="Read aloud">
                    <Volume2 className="w-5 h-5"/>
                  </button>
                )}
                <button onClick={handleDownloadPrediction} className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-900 rounded-lg shadow-sm text-white font-bold hover:bg-slate-800 transition-all" title="Download as PDF">
                  <Download className="w-4 h-4"/> Download PDF
                </button>
              </div>
            </div>
            <div className="prose prose-lg max-w-none text-slate-700 whitespace-pre-wrap font-serif leading-relaxed p-6 bg-white rounded-xl shadow-inner border border-slate-100 h-[600px] overflow-y-auto">
              {prediction}
            </div>
            <LegalDisclaimer />
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-300 rounded-3xl text-slate-400 bg-slate-50/50">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
              <BrainCircuit className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-lg font-medium text-slate-500">Prediction will appear here</p>
            <p className="text-sm">Describe your case above and click predict to get started</p>
          </div>
        )}
      </div>
      <LegalDisclaimer />
    </PageContainer>
  );
};

// --- 4. APP SHELL & NAVIGATION ---

const App = () => {
  const { currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedLawyer, setSelectedLawyer] = useState<any>(null);

  const handleLogout = async () => { await signOut(auth); setCurrentPage('home'); };
  
  const renderPage = () => {
    if (!currentUser) return <AuthPage />;
    switch (currentPage) {
      case 'predict': return <CasePredictor />; // Removed if using smart chat as primary, keeping for direct access if needed
      case 'chat': return <SmartLegalChat />;
      case 'learn': return <LegalLiteracy />;
      case 'docs': return <DocumentGenerator />;
      case 'analyze': return <DocumentAnalyzer />;
      case 'voice': return <MultiLanguageVoice onNavigate={setCurrentPage} />;
      case 'find': return <AdvocateFinder onProfileSelect={(l) => { setSelectedLawyer(l); setCurrentPage('lawyer-profile'); }} />;
      case 'lawyer-profile': return <AdvocateProfile lawyer={selectedLawyer} onBack={() => setCurrentPage('find')} />;
      case 'ipc': return <IPCLookup />;
      case 'penalty': return <PenaltyCalculator />;
      case 'cases': return <CaseLawDatabase />;
      case 'verdicts': return <RecentVerdicts />;
      case 'history': return <HistoryPage />;
      case 'bookmarks': return <Bookmarks onNavigate={setCurrentPage} />;
      case 'const': return <ConstitutionalRights />;
      case 'community': return <CommunityForum />;
      default: return <HomePage onNavClick={setCurrentPage} />;
    }
  };

  const NavGroup = ({ title, items }: { title: string, items: {label: string, page: string, icon: any}[] }) => (
    <div className="relative group">
      <button className="px-4 py-2 text-slate-600 font-bold hover:text-slate-900 flex items-center gap-1 transition-colors text-sm uppercase tracking-wide">
        {title} <ChevronRight className="w-3 h-3 transition-transform duration-200 group-hover:rotate-90 text-amber-500" />
      </button>
      <div className="absolute top-full left-0 pt-4 w-64 hidden group-hover:block z-50 animate-fade-in-up">
        <div className="bg-white rounded-2xl shadow-xl border-t-4 border-amber-500 overflow-hidden p-2">
          {items.map((item) => (
            <button key={item.page} onClick={() => setCurrentPage(item.page)} className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl flex items-center gap-3 transition-all group/item">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm"><item.icon className="w-4 h-4" /></div>
              <span className="font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans text-slate-900 selection:bg-amber-100 selection:text-slate-900">
      {currentUser && (
        <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 transition-all duration-300">
          <nav className="container mx-auto px-6 h-20 flex justify-between items-center">
            
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentPage('home')}>
              <div className="bg-slate-900 p-2.5 rounded-xl text-white shadow-lg shadow-slate-900/20 group-hover:scale-105 transition-transform"><Gavel className="w-6 h-6" /></div>
              <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight group-hover:text-slate-700 transition-colors">Nyay Saathi</h1>
            </div>
            
            <div className="hidden lg:flex items-center gap-1">
              <button onClick={() => setCurrentPage('home')} className={`px-5 py-2 rounded-full font-bold text-sm uppercase tracking-wide transition-all ${currentPage === 'home' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>Home</button>
              <NavGroup title="AI Tools" items={[{ label: "Smart Chat", page: "chat", icon: MessageCircle }, { label: "Doc Generator", page: "docs", icon: FileText }, { label: "Doc Analyzer", page: "analyze", icon: FileSearch }, { label: "Voice Assistant", page: "voice", icon: Mic }]} />
              <NavGroup title="Resources" items={[{ label: "IPC Lookup", page: "ipc", icon: Search }, { label: "Case Laws", page: "cases", icon: Landmark }, { label: "Penalties", page: "penalty", icon: Scale }, { label: "Find Advocate", page: "find", icon: Users }, { label: "Recent Verdicts", page: "verdicts", icon: Scroll }, { label: "Community", page: "community", icon: Users }]} />
              <div className="h-8 w-px bg-slate-200 mx-4"></div>
              <button onClick={() => setCurrentPage('history')} className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all" title="History"><History className="w-5 h-5" /></button>
              <button onClick={() => setCurrentPage('bookmarks')} className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all" title="Bookmarks"><Bookmark className="w-5 h-5" /></button>
              <button onClick={handleLogout} className="ml-4 px-6 py-2.5 bg-slate-900 text-white rounded-full font-bold hover:bg-amber-500 hover:text-white transition-all shadow-lg hover:shadow-xl text-sm">Logout</button>
            </div>
            <div className="lg:hidden"><button className="text-slate-900 p-2"><Menu className="w-7 h-7" /></button></div>
          </nav>
        </header>
      )}
      <main className="flex-grow">{renderPage()}</main>
      {currentUser && (
        <footer className="bg-slate-900 text-white pt-24 pb-12 mt-auto relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-white to-amber-500 opacity-30"></div>
          <div className="container mx-auto px-6 text-center relative z-10">
            <div className="flex justify-center items-center gap-4 mb-8">
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm"><Gavel className="w-8 h-8 text-amber-400" /></div>
              <span className="text-4xl font-serif font-bold tracking-tight text-white">Nyay Saathi</span>
            </div>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-16 font-light leading-relaxed">
              Democratizing legal knowledge for every Indian citizen through Ethical AI. 
              <br/>Bridging the gap between complexity and clarity.
            </p>
            <div className="h-px w-full bg-white/10 mb-8"></div>
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 gap-6">
              <p>&copy; 2025 Nyay Saathi. All rights reserved.</p>
              <div className="flex gap-8">
                <a href="#" className="hover:text-amber-400 transition-colors font-medium">Privacy Policy</a>
                <a href="#" className="hover:text-amber-400 transition-colors font-medium">Terms of Service</a>
                <a href="#" className="hover:text-amber-400 transition-colors font-medium">Contact Support</a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;