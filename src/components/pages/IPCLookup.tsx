import React, { useState, useEffect } from 'react';
import { Scroll, Search, ChevronRight, Download, Bookmark } from 'lucide-react';
import { PageContainer, Card } from '../shared';
import ipcData from '../../data/ipc.json';

const IPCLookup = () => {
  const [mode, setMode] = useState<'explore' | 'incident'>('explore');
  const [search, setSearch] = useState('');
  const [results, setResults] = useState(ipcData.slice(0, 50));
  const [selected, setSelected] = useState<any>(null);
  const [incidentText, setIncidentText] = useState('');
  const [incidentMatches, setIncidentMatches] = useState<any[]>([]);
  const [incidentAnalyzed, setIncidentAnalyzed] = useState(false);
  const ranges = [
    { label: 'All', min: 0, max: 9999 },
    { label: '1-100', min: 1, max: 100 },
    { label: '101-200', min: 101, max: 200 },
    { label: '201-300', min: 201, max: 300 },
    { label: '301-400', min: 301, max: 400 },
    { label: '401-500', min: 401, max: 500 },
  ];
  const [rangeFilter, setRangeFilter] = useState('All');

  useEffect(() => {
    const q = search.toLowerCase();
    const range = ranges.find(r => r.label === rangeFilter) || ranges[0];
    setResults(
      ipcData
        .filter((i: any) => {
          const sectionNum = Number(i.section);
          const inRange = sectionNum >= range.min && sectionNum <= range.max;
          const matches =
            i.section.toString().includes(q) ||
            i.title.toLowerCase().includes(q) ||
            i.description?.toLowerCase().includes(q);
          return inRange && (q ? matches : true);
        })
        .slice(0, 80)
    );
  }, [search, rangeFilter]);

  const analyzeIncident = () => {
    const text = incidentText.trim().toLowerCase();
    setIncidentAnalyzed(true);
    if (!text) {
      setIncidentMatches([]);
      setSelected(null);
      return;
    }

    const keywords = text.split(/\s+/).filter(w => w.length > 3);
    const scored = ipcData
      .map((i: any) => {
        const hay = `${i.section} ${i.title} ${i.description || ''}`.toLowerCase();
        const score = keywords.reduce((s, k) => s + (hay.includes(k) ? 1 : 0), 0);
        return { ...i, _score: score };
      })
      .filter((i: any) => i._score > 0)
      .sort((a: any, b: any) => b._score - a._score)
      .slice(0, 8);
    setIncidentMatches(scored);
    setSelected(scored[0] || null);
  };

  return (
    <PageContainer title="IPC Lookup" subtitle="Explore IPC sections visually with filters and spotlight view.">
      <Card className="overflow-hidden border-0 shadow-2xl">
        <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500 rounded-xl text-slate-900"><Scroll className="w-6 h-6"/></div>
            <div>
              <h3 className="text-2xl font-serif font-bold">IPC Section Explorer</h3>
              <p className="text-slate-300 text-sm">Explore sections or find likely sections from an incident.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('explore')}
              className={`px-4 py-2 rounded-full text-xs font-bold ${mode === 'explore' ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-200'}`}
            >
              Explore Sections
            </button>
            <button
              onClick={() => setMode('incident')}
              className={`px-4 py-2 rounded-full text-xs font-bold ${mode === 'incident' ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-200'}`}
            >
              Incident Finder
            </button>
          </div>
        </div>

        {mode === 'explore' ? (
          <>
            <div className="p-6 border-b border-slate-100 bg-white">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by section, title, or keyword..."
                    className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 font-medium text-slate-800"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {ranges.map(r => (
                    <button
                      key={r.label}
                      onClick={() => setRangeFilter(r.label)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${rangeFilter === r.label ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3">
              <div className="lg:col-span-2 p-6 bg-white">
                <div className="grid md:grid-cols-2 gap-4">
                  {results.map((r: any) => (
                    <button
                      key={r.section}
                      onClick={() => setSelected(r)}
                      className={`text-left p-4 rounded-2xl border transition-all hover:shadow-md ${selected?.section === r.section ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold ${selected?.section === r.section ? 'text-amber-300' : 'text-amber-600'}`}>Section {r.section}</span>
                        <ChevronRight className={`w-4 h-4 ${selected?.section === r.section ? 'text-amber-300' : 'text-slate-300'}`} />
                      </div>
                      <div className={`font-semibold mb-1 ${selected?.section === r.section ? 'text-white' : 'text-slate-900'}`}>{r.title}</div>
                      <div className={`text-xs line-clamp-2 ${selected?.section === r.section ? 'text-slate-200' : 'text-slate-500'}`}>{r.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-1 p-6 bg-slate-50 border-l border-slate-100">
                {selected ? (
                  <div className="animate-fade-in h-full flex flex-col">
                    <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 font-bold rounded-full text-xs mb-4 w-fit">Spotlight</div>
                    <div className="text-sm font-bold text-slate-500 mb-2">Section {selected.section}</div>
                    <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4 leading-tight">{selected.title}</h3>
                    <div className="text-slate-600 text-sm leading-relaxed flex-grow">
                      {selected.description}
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col gap-2">
                      <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2"><Download className="w-4 h-4"/> Download</button>
                      <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2"><Bookmark className="w-4 h-4"/> Save</button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 bg-white/70 rounded-2xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                      <Search className="w-7 h-7 text-slate-300" />
                    </div>
                    <p className="text-sm font-medium text-slate-600 text-center">Select a section to view spotlight details</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="p-6 bg-white">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <label className="text-sm font-bold text-slate-700 mb-2 block">Describe the incident</label>
                <textarea
                  value={incidentText}
                  onChange={(e) => setIncidentText(e.target.value)}
                  placeholder="Example: Someone stole my phone on the bus and the person threatened me when I asked for help."
                  className="w-full min-h-[160px] p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={analyzeIncident}
                    className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold"
                  >
                    Find Relevant Sections
                  </button>
                  <button
                    onClick={() => { setIncidentText(''); setIncidentMatches([]); setIncidentAnalyzed(false); setSelected(null); }}
                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold"
                  >
                    Clear
                  </button>
                </div>
                <div className="mt-6">
                  {incidentAnalyzed && incidentMatches.length === 0 && (
                    <div className="text-sm text-slate-500">No strong matches found. Try adding more details.</div>
                  )}
                  <div className="grid md:grid-cols-2 gap-4">
                    {incidentMatches.map((r: any) => (
                      <button
                        key={r.section}
                        onClick={() => setSelected(r)}
                        className={`text-left p-4 rounded-2xl border transition-all hover:shadow-md ${selected?.section === r.section ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-bold ${selected?.section === r.section ? 'text-amber-300' : 'text-amber-600'}`}>Section {r.section}</span>
                          <div className={`text-[10px] font-bold ${selected?.section === r.section ? 'text-slate-300' : 'text-slate-400'}`}>Match {r._score}</div>
                        </div>
                        <div className={`font-semibold mb-1 ${selected?.section === r.section ? 'text-white' : 'text-slate-900'}`}>{r.title}</div>
                        <div className={`text-xs line-clamp-2 ${selected?.section === r.section ? 'text-slate-200' : 'text-slate-500'}`}>{r.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1 p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                {selected ? (
                  <div className="animate-fade-in h-full flex flex-col">
                    <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 font-bold rounded-full text-xs mb-4 w-fit">Suggested Section</div>
                    <div className="text-sm font-bold text-slate-500 mb-2">Section {selected.section}</div>
                    <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4 leading-tight">{selected.title}</h3>
                    <div className="text-slate-600 text-sm leading-relaxed flex-grow">
                      {selected.description}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">Enter an incident to get suggested IPC sections.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </PageContainer>
  );
};

export default IPCLookup;
