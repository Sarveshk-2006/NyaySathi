import React from 'react';
import { 
  FileText, BrainCircuit, Gavel, FileSearch, Calendar, 
  Scale, ChevronRight, ArrowRight, Upload, CheckCircle2,
  BarChart3, Bell, Users, Clock, Database, Mic, Shield
} from 'lucide-react';

export const CourtHomePage = ({ onNavClick }: { onNavClick: (page: string) => void }) => {
  const coreTools = [
    { title: "Case Management", desc: "Track, update, and manage all court cases efficiently.", icon: FileSearch, action: 'court-cases' },
    { title: "Notice Generator", desc: "AI-powered legal notice and order generation.", icon: FileText, action: 'court-notices' },
    { title: "Analytics Dashboard", desc: "Insights on case trends and hearing success rates.", icon: BrainCircuit, action: 'court-analytics' },
    { title: "Hearing Schedule", desc: "Manage court calendar and hearing schedules.", icon: Calendar, action: 'court-dashboard' },
  ];

  const referenceTools = [
    { title: "Case Database", desc: "Search and access complete case records.", icon: Database, action: 'court-cases' },
    { title: "Legal Research", desc: "Access precedents and case laws.", icon: Scale, action: 'court-analytics' },
    { title: "Performance Metrics", desc: "Track disposal rates and case outcomes.", icon: BarChart3, action: 'court-analytics' },
    { title: "Audio Recording", desc: "Record and transcribe court proceedings.", icon: Mic, action: 'court-dashboard' },
    { title: "Notifications", desc: "Manage court updates and alerts.", icon: Bell, action: 'court-dashboard' },
    { title: "User Management", desc: "Manage court staff and roles.", icon: Users, action: 'court-dashboard' },
    { title: "e-Signature", desc: "Digitally sign orders and judgments.", icon: Shield, action: 'court-dashboard' },
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
            Court Portal Live
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-extrabold mb-8 tracking-tight leading-tight animate-slide-up drop-shadow-2xl text-white">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Justice</span>, Digitized.
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Your intelligent court management system. Streamline case tracking, automate notices, and deliver justice efficiently with AI-powered tools.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {/* Primary Action Button - Gold */}
            <button 
              onClick={() => onNavClick('court-cases')}
              className="group relative px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg rounded-full shadow-lg shadow-amber-500/30 transition-all hover:scale-105 flex items-center justify-center gap-3"
            >
              Manage Cases 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            {/* Secondary Action Button - Transparent/Glass */}
            <button 
              onClick={() => onNavClick('court-dashboard')}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold text-lg rounded-full transition-all hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
            >
              <Calendar className="w-5 h-5" />
              View Calendar
            </button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-slate-800 text-white relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-5"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-white mb-4">How Court Portal Works</h2>
            <div className="h-1.5 w-20 bg-amber-500 mx-auto rounded-full shadow-lg"></div>
            <p className="text-slate-300 mt-6 text-lg max-w-2xl mx-auto font-light">Modern court management made simple with intelligent automation.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "1. Access Cases", desc: "View all assigned cases with real-time updates and notifications.", icon: Gavel },
              { title: "2. AI Processing", desc: "Generate notices, analyze trends, and get intelligent recommendations.", icon: BrainCircuit },
              { title: "3. Track Progress", desc: "Monitor case status, hearing outcomes, and performance metrics.", icon: CheckCircle2 },
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
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-2">Court Management Tools</h2>
            <p className="text-slate-600 mt-4 text-lg">Everything you need to manage court operations efficiently, in one dashboard.</p>
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

      {/* ADDITIONAL FEATURES */}
      <section className="py-24 bg-slate-100 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-slate-900 mb-6">Additional Features</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">Extended tools for comprehensive court management.</p>
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

export default CourtHomePage;
