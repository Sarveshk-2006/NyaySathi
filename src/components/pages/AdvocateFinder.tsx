import React, { useState, useEffect } from 'react';
import { Home, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { PageContainer, Card } from '../shared';

interface AdvocateFinderProps {
  onProfileSelect: (lawyer: any) => void;
}

const AdvocateFinder = ({ onProfileSelect }: AdvocateFinderProps) => {
  const [allLawyers, setAllLawyers] = useState<any[]>([]);
  const [filteredLawyers, setFilteredLawyers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  
  useEffect(() => {
    const fetchAdvocates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:8001/api/advocates');
        if (!response.ok) {
          const errResult = await response.json().catch(() => null);
          throw new Error(errResult?.error || 'Failed to load advocates');
        }
        const result = await response.json();
        if (result?.error) throw new Error(result.error);
        const lawyers = Array.isArray(result.advocates) ? result.advocates : [];
        setAllLawyers(lawyers);
        setFilteredLawyers(lawyers);
        setSourceUrl(result.sourceUrl || '');
      } catch (err: any) {
        setError(err?.message || 'Unable to load advocates list. Please try again.');
        setAllLawyers([]);
        setFilteredLawyers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdvocates();
  }, []);

  useEffect(() => {
    let results = allLawyers;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(lawyer => 
        lawyer.name?.toLowerCase().includes(query) ||
        lawyer.city?.toLowerCase().includes(query) ||
        lawyer.specialty?.toLowerCase().includes(query) ||
        lawyer.enrollmentNo?.toLowerCase().includes(query)
      );
    }
    
    if (selectedSpecialty !== 'all') {
      results = results.filter(lawyer => lawyer.specialty === selectedSpecialty);
    }
    
    setFilteredLawyers(results);
  }, [searchQuery, selectedSpecialty, allLawyers]);

  const specialties = Array.from(new Set(allLawyers.map(l => l.specialty).filter(Boolean)));

  return (
    <PageContainer title="Find Verified Advocates" subtitle="Connect with experienced legal professionals near you.">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16">
          <Loader2 className="w-12 h-12 animate-spin text-slate-900 mb-4" />
          <p className="text-slate-600 text-lg font-medium">Loading advocates directory...</p>
        </div>
      ) : error ? (
        <Card className="p-12 text-center bg-red-50 border-red-200">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Unable to Load Advocates</h3>
          <p className="text-slate-600">{error}</p>
        </Card>
      ) : (
        <div>
          <Card className="p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, city, enrollment no..."
                className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 font-medium text-slate-800"
              />
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 font-medium text-slate-800 min-w-[200px]"
              >
                <option value="all">All Specialties</option>
                {specialties.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
            {(searchQuery || selectedSpecialty !== 'all') && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedSpecialty('all'); }}
                className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all"
              >
                Clear Filters
              </button>
            )}
          </Card>

          <div className="mb-4 text-sm text-slate-500">
            Showing {filteredLawyers.length} of {allLawyers.length} advocates
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredLawyers.map(lawyer => (
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
                <div className="text-sm text-slate-600 bg-slate-50 p-5 rounded-2xl mb-8 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-slate-400">Enrollment</span>
                    <strong className="text-slate-900">{lawyer.enrollmentNo || 'N/A'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-slate-400">Phone</span>
                    <strong className="text-slate-900">{lawyer.phone || 'N/A'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-slate-400">Location</span>
                    <strong className="text-slate-900">{lawyer.city || 'N/A'}</strong>
                  </div>
                </div>
                <button onClick={() => onProfileSelect(lawyer)} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]">
                  View Full Profile <ArrowRight className="w-4 h-4"/>
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default AdvocateFinder;
