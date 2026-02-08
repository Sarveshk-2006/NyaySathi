import React, { useState, useEffect } from 'react';
import { Scroll, Bookmark, FileText, Scale, Info } from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { PageContainer, Card, LegalDisclaimer } from '../shared';
import penaltyData from '../../data/penalties.json';

const PenaltyCalculator = () => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('section');
  const [selectedPenalty, setSelectedPenalty] = useState<any | null>(null);
  const [bookmarkedPenalties, setBookmarkedPenalties] = useState<string[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'users', currentUser.uid, 'bookmarks'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBookmarkedPenalties(snapshot.docs.filter(d => d.data().type === 'IPCSection').map(d => d.data().data.section));
    });
    return () => unsubscribe();
  }, [currentUser]);

  const addBookmark = async () => {
    if (!currentUser || !selectedPenalty) return;
    try {
      await addDoc(collection(db, 'users', currentUser.uid, 'bookmarks'), { 
        type: 'IPCSection', 
        data: selectedPenalty, 
        createdAt: serverTimestamp() 
      });
      alert('Section bookmarked successfully!');
    } catch (err) {
      console.error('Error bookmarking:', err);
    }
  };

  const filteredPenalties = penaltyData.filter((p: any) => {
    const matchesSearch = searchQuery.trim() === '' || 
      p.section?.toString().toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const sortedPenalties = [...filteredPenalties].sort((a, b) => {
    if (sortBy === 'section') {
      const aNum = parseInt(a.section?.toString() || '0');
      const bNum = parseInt(b.section?.toString() || '0');
      return aNum - bNum;
    }
    if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
    return 0;
  });

  return (
    <PageContainer title="IPC Database" subtitle="Complete Indian Penal Code sections with detailed descriptions and legal implications.">
      <Card className="p-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="Search by section number, title, or description..." 
            className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800" 
          />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)} 
            className="p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-700 min-w-[150px]"
          >
            <option value="section">By Section Number</option>
            <option value="title">By Title</option>
          </select>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 border-r border-slate-100 pr-6">
            <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-lg">
              <Scroll className="w-5 h-5 text-amber-500"/> IPC Sections ({sortedPenalties.length})
            </h4>
            <div className="space-y-3 max-h-[650px] overflow-y-auto pr-2 custom-scrollbar">
              {sortedPenalties.map((p: any, idx: number) => (
                <button 
                  key={idx} 
                  onClick={() => setSelectedPenalty({...p, id: idx})} 
                  className={`w-full text-left p-4 rounded-xl border transition-all hover:scale-[1.02] duration-200 ${
                    selectedPenalty?.id === idx 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20' 
                      : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <div className="font-bold text-sm mb-1 line-clamp-2">Section {p.section}: {p.title}</div>
                  <div className={`text-xs ${selectedPenalty?.id === idx ? 'text-slate-300' : 'text-slate-500'}`}>
                    {p.description?.substring(0, 40)}...
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            {selectedPenalty ? (
              <div className="animate-fade-in space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-3xl font-serif font-bold text-slate-900">Section {selectedPenalty.section}</h3>
                    <p className="text-xl text-amber-600 font-semibold mt-2">{selectedPenalty.title}</p>
                  </div>
                  <button 
                    onClick={addBookmark} 
                    className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${
                      bookmarkedPenalties.includes(selectedPenalty.section) 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" /> {bookmarkedPenalties.includes(selectedPenalty.section) ? 'Saved' : 'Save'}
                  </button>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-8 rounded-2xl border border-blue-100 shadow-inner">
                  <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-amber-600"/> Description</h4>
                  <p className="text-slate-700 leading-relaxed text-base font-light">{selectedPenalty.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                    <h4 className="font-bold text-slate-900 mb-2 text-sm uppercase tracking-wider flex items-center gap-2"><Scale className="w-4 h-4 text-amber-600"/> Section Details</h4>
                    <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                      Section {selectedPenalty.section}
                    </p>
                    <p className="text-slate-500 text-xs mt-2">Refer to Indian Penal Code for detailed legal interpretation and amendments</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                    <h4 className="font-bold text-slate-900 mb-2 text-sm uppercase tracking-wider flex items-center gap-2"><Info className="w-4 h-4 text-amber-600"/> Legal Reference</h4>
                    <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                      Indian Penal Code, 1860
                    </p>
                    <p className="text-slate-500 text-xs mt-2">Consult a legal professional for case-specific advice</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-10 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <Scroll className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">Select an IPC section from the list to view details</p>
                <p className="text-sm mt-2">Total {sortedPenalties.length} sections available in the Indian Penal Code</p>
              </div>
            )}
          </div>
        </div>
      </Card>
      <LegalDisclaimer />
    </PageContainer>
  );
};

export default PenaltyCalculator;
