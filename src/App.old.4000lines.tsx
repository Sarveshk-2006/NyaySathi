import React, { useState } from 'react';
import { 
  ChevronRight, Menu, Bookmark, History, LogOut, MessageCircle,
  BrainCircuit, FileText, Trophy, Mic, Search, Landmark, Scale,
  BookUser, Users, MessageSquare, Scroll
} from 'lucide-react';

// --- IMPORTS ---
import { auth } from './firebase'; 
import { signOut } from 'firebase/auth';
import { useAuth } from './contexts/AuthContext'; 

// Page Component Imports
import { 
  HomePage, AuthPage, LegalLiteracy, SmartLegalChat, CommunityForum,
  RecentVerdicts, CaseLawDatabase, DocumentGenerator, IPCLookup,
  PenaltyCalculator, HistoryPage, Bookmarks, ConstitutionalRights,
  DocumentAnalyzer, CasePredictor, CaseOutcomePredictor
} from './components/pages';

// Feature Component Imports
import {
  AdvocateFinder, AdvocateProfile, MultiLanguageVoice
} from './components/features';

const LOGO_URL = "/logo.png";

// --- APP SHELL & NAVIGATION ---

const App = () => {
  const { currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedLawyer, setSelectedLawyer] = useState<any>(null);

  const handleLogout = async () => { await signOut(auth); setCurrentPage('home'); };
  
  const renderPage = () => {
    if (!currentUser) return <AuthPage />;
    switch (currentPage) {
      case 'predict': return <CasePredictor />;
      case 'outcome': return <CaseOutcomePredictor />;
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
              <div className="bg-white p-2 rounded-xl shadow-lg shadow-slate-900/10 border border-slate-200 group-hover:scale-105 transition-transform">
                <img src={LOGO_URL} alt="Nyay Saathi logo" className="w-10 h-10 object-contain" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight group-hover:text-slate-700 transition-colors">Nyay Saathi</h1>
            </div>
            
            <div className="hidden lg:flex items-center gap-1">
              <button onClick={() => setCurrentPage('home')} className={`px-5 py-2 rounded-full font-bold text-sm uppercase tracking-wide transition-all ${currentPage === 'home' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>Home</button>
              <NavGroup title="AI Tools" items={[{ label: "Smart Chat", page: "chat", icon: MessageCircle }, { label: "Outcome Predictor", page: "outcome", icon: BrainCircuit }, { label: "Doc Generator", page: "docs", icon: FileText }, { label: "Doc Analyzer", page: "analyze", icon: FileText }, { label: "Voice Assistant", page: "voice", icon: Mic }]} />
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
              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/20">
                <img src={LOGO_URL} alt="Nyay Saathi logo" className="w-12 h-12 object-contain" />
              </div>
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
