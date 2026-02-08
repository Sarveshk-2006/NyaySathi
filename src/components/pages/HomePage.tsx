import React from 'react';
import { 
  FileText, BrainCircuit, Users, Gavel, MessageCircle, Trophy, Mic, 
  Search, Scale, BookUser, MessageSquare, Scroll, Landmark, ChevronRight,
  ArrowRight, Upload, CheckCircle2, Users as UsersIcon, Shield
} from 'lucide-react';

export const HomePage = ({
  onNavClick,
  userRole
}: {
  onNavClick: (page: string) => void;
  userRole?: 'citizen' | 'court' | null;
}) => {
  const isCourt = userRole === 'court';

  const coreTools = isCourt
    ? [
        { title: "Judge Dashboard", desc: "Daily overview of cases, hearings, and court activity.", icon: Gavel, action: 'court-dashboard' },
        { title: "Case Management", desc: "Track case statuses, priorities, and timelines.", icon: FileText, action: 'court-cases' },
        { title: "Notice Generator", desc: "Create official court notices and orders quickly.", icon: Scroll, action: 'court-notices' },
        { title: "Hearing Analytics", desc: "Measure hearing success rate and performance.", icon: BrainCircuit, action: 'court-analytics' },
        { title: "Court Calendar", desc: "Smart scheduling and hearing timeline view.", icon: Search, action: 'court-dashboard' },
      ]
    : [
        { title: "Smart Chat", desc: "Chat with AI to solve legal queries instantly.", icon: MessageCircle, action: 'chat' },
        { title: "Outcome Predictor", desc: "AI + Database powered case outcome prediction.", icon: BrainCircuit, action: 'outcome' },
        { title: "Doc Generator", desc: "Create rental agreements, affidavits & wills.", icon: FileText, action: 'docs' },
        { title: "Nyay Vidya", desc: "Gamified learning. Earn badges by learning law.", icon: Trophy, action: 'learn' },
        { title: "Voice Assistant", desc: "Speak in Hindi, Marathi, or English.", icon: Mic, action: 'voice' },
      ];

  const referenceTools = isCourt
    ? [
        { title: "Status Tracking", desc: "Realtime updates across all active cases.", icon: CheckCircle2, action: 'court-cases' },
        { title: "Issued Notices", desc: "Review generated notices and templates.", icon: Scroll, action: 'court-notices' },
        { title: "Hearing Schedule", desc: "View today’s hearings and upcoming slots.", icon: Gavel, action: 'court-dashboard' },
        { title: "Performance Reports", desc: "Download analytics reports for review.", icon: BrainCircuit, action: 'court-analytics' },
        { title: "Audit & Security", desc: "Secure access with role-based controls.", icon: Shield, action: 'court-dashboard' },
        { title: "Document Signatures", desc: "Digitally sign and verify court documents.", icon: FileText, action: 'court-notices' },
        { title: "Citizen Sync", desc: "Bidirectional updates to citizen portal.", icon: Users, action: 'court-dashboard' },
      ]
    : [
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
            {isCourt ? 'Court Portal' : 'Nyay Saathi v2.0 Live'}
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-extrabold mb-8 tracking-tight leading-tight animate-slide-up drop-shadow-2xl text-white">
            {isCourt ? (
              <>
                Court, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Digitized.</span>
              </>
            ) : (
              <>
                Justice, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Simplified.</span>
              </>
            )}
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {isCourt
              ? 'A unified digital workspace for judges and court staff to manage hearings, notices, and case flow.'
              : 'Your intelligent legal companion. Decode Indian law, generate documents, and find expert advocates with the power of Ethical AI.'}
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {/* Primary Action Button - Gold */}
            <button 
              onClick={() => onNavClick(isCourt ? 'court-dashboard' : 'chat')}
              className="group relative px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg rounded-full shadow-lg shadow-amber-500/30 transition-all hover:scale-105 flex items-center justify-center gap-3"
            >
              {isCourt ? 'Open Court Dashboard' : 'Start Free Consultation'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            {/* Secondary Action Button - Transparent/Glass */}
            <button 
              onClick={() => onNavClick(isCourt ? 'court-cases' : 'find')}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold text-lg rounded-full transition-all hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
            >
              <UsersIcon className="w-5 h-5" />
              {isCourt ? 'Open Case Management' : 'Find a Lawyer'}
            </button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-slate-800 text-white relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-5"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-white mb-4">{isCourt ? 'How Court Portal Works' : 'How Nyay Saathi Works'}</h2>
            <div className="h-1.5 w-20 bg-amber-500 mx-auto rounded-full shadow-lg"></div>
            <p className="text-slate-300 mt-6 text-lg max-w-2xl mx-auto font-light">
              {isCourt
                ? 'Streamline hearings, notices, and case progress in three simple steps.'
                : 'Legal assistance used to be complicated. We made it a three-step conversation.'}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {(isCourt
              ? [
                  { title: "1. Create & Assign", desc: "Register cases, assign priorities, and set hearing schedules.", icon: Upload },
                  { title: "2. Manage Hearings", desc: "Track case progress, update status, and issue notices.", icon: Gavel },
                  { title: "3. Conclude & Sync", desc: "Record outcomes and sync updates to citizen portal.", icon: CheckCircle2 },
                ]
              : [
                  { title: "1. Ask or Upload", desc: "Type your query, speak in your language, or upload a document.", icon: Upload },
                  { title: "2. AI Processing", desc: "Our engine scans the Constitution, IPC, and Case Laws instantly.", icon: BrainCircuit },
                  { title: "3. Instant Solution", desc: "Receive a simple explanation, a drafted document, or next steps.", icon: CheckCircle2 },
                ]
            ).map((step, idx) => (
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
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-2">
              {isCourt ? 'Court Power Tools' : 'Legal Power Tools'}
            </h2>
            <p className="text-slate-600 mt-4 text-lg">
              {isCourt
                ? 'Everything you need to manage court operations, in one dashboard.'
                : 'Everything you need to navigate the legal system, in one dashboard.'}
            </p>
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
            <h2 className="text-4xl font-serif font-bold text-slate-900 mb-6">
              {isCourt ? 'Court Operations Suite' : 'Comprehensive Knowledge Base'}
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              {isCourt ? 'A focused toolkit for case flow, notices, and compliance.' : 'Instant access to the pillars of Indian Law.'}
            </p>
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

export default HomePage;
