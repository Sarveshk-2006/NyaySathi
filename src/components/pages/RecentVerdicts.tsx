import React, { useState, useEffect } from 'react';
import { Loader2, Scale, CalendarDays, Gavel, ArrowRight, X, ExternalLink, Globe } from 'lucide-react';
import { PageContainer } from '../layout/PageContainer';
import { Card } from '../shared';
import { getVerdictImage, MOCK_VERDICTS } from '../../utils/mockData';

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

export default RecentVerdicts;
