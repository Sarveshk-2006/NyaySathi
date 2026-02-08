import React, { useState } from 'react';
import { History as HistoryIcon } from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { PageContainer } from '../layout/PageContainer';
import { Card } from '../shared';
import { useEffect } from 'react';

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

export default HistoryPage;
