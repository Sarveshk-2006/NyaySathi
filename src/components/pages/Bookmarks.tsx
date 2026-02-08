import React, { useState, useEffect } from 'react';
import { Bookmark as BookmarkIcon, X } from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { PageContainer } from '../layout/PageContainer';
import { Card } from '../shared';

const Bookmarks = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'users', currentUser.uid, 'bookmarks'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [currentUser]);

  const removeBookmark = async (id: string) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'bookmarks', id));
    } catch (err) {
      console.error('Failed to remove bookmark', err);
    }
  };

  const renderTitle = (item: any) => {
    if (item.type === 'Case') return item.data?.title || 'Case';
    if (item.type === 'IPCSection') return `Section ${item.data?.section}: ${item.data?.title || ''}`;
    return item.type || 'Bookmark';
  };

  const renderMeta = (item: any) => {
    if (item.type === 'Case') return item.data?.court || item.data?.category || '';
    if (item.type === 'IPCSection') return item.data?.description?.slice(0, 120) || '';
    return '';
  };

  const empty = !items.length;

  return (
    <PageContainer title="Saved Items" subtitle="Your bookmarked cases and sections.">
      {empty ? (
        <Card className="p-16 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookmarkIcon className="w-8 h-8 text-slate-300"/>
          </div>
          <p className="text-slate-500 text-lg">No bookmarks yet.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="p-5 flex flex-col gap-3 border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wide">{item.type}</span>
                <button onClick={() => removeBookmark(item.id)} className="text-slate-400 hover:text-red-500 transition-colors"><X className="w-4 h-4"/></button>
              </div>
              <h3 className="font-bold text-slate-900 text-lg leading-tight">{renderTitle(item)}</h3>
              <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">{renderMeta(item)}</p>
              <div className="flex gap-2 mt-auto">
                {item.type === 'Case' && (
                  <button onClick={() => onNavigate('cases')} className="px-3 py-2 bg-slate-900 text-white text-xs rounded-lg font-bold hover:bg-slate-800">Open Cases</button>
                )}
                {item.type === 'IPCSection' && (
                  <button onClick={() => onNavigate('penalty')} className="px-3 py-2 bg-slate-900 text-white text-xs rounded-lg font-bold hover:bg-slate-800">Open IPC</button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default Bookmarks;
