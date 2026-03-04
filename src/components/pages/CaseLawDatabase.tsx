import React, { useState, useEffect } from 'react';
import { Search, Scroll, CalendarDays, Landmark, FileText, Gavel, Scale, Bookmark, BookUser } from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { PageContainer } from '../layout/PageContainer';
import { Card } from '../shared';
import casesDataSource from '../../data/cases.json';

const casesData = casesDataSource || [];

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

export default CaseLawDatabase;
