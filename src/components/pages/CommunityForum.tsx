import React, { useState, useEffect } from 'react';
import { Plus, Filter, ThumbsUp, MessageSquare, Share2, X, Send, Loader2 } from 'lucide-react';
import { db } from '../../firebase';
import { 
  collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, 
  doc, updateDoc, increment, arrayUnion, arrayRemove 
} from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { PageContainer } from '../layout/PageContainer';
import { Card } from '../shared';

const CommunityForum = () => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General' });
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ["All", "Property", "Criminal", "Corporate", "Family", "Civil", "General"];

  // 1. Fetch Posts Realtime
  useEffect(() => {
    const q = query(collection(db, "forum_posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const realPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(realPosts);
      setIsPostsLoading(false);
    }, () => setIsPostsLoading(false));
    return () => unsubscribe();
  }, []);

  // 2. Fetch Comments when a post is expanded
  useEffect(() => {
    if (!expandedPostId) return;
    // Only try to fetch if it's a real post ID (mock IDs won't be in firestore)
    if (expandedPostId.startsWith('mock')) {
        setComments([]); 
        return;
    }
    
    const q = query(collection(db, "forum_posts", expandedPostId, "comments"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [expandedPostId]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
        alert("Please sign in to post on the forum.");
        return;
    }

    // Validate form
    if (!newPost.title.trim()) {
        alert("Please enter a title for your discussion.");
        return;
    }
    if (!newPost.content.trim()) {
        alert("Please enter details for your discussion.");
        return;
    }
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "forum_posts"), {
        ...newPost,
        author: currentUser.email?.split('@')[0] || "Anonymous",
        authorId: currentUser.uid,
        createdAt: serverTimestamp(),
        upvotes: 0,
        upvotedBy: [],
        commentCount: 0
      });
      setIsCreateModalOpen(false);
      setNewPost({ title: '', content: '', category: 'General' });
    } catch (error: any) {
      console.error("Error creating post:", error);
      const errorMsg = error.code === 'permission-denied' 
        ? "You don't have permission to post. Please ensure Firestore rules are updated correctly."
        : error.message;
      alert("Failed to create post. Please try again. " + errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (post: any) => {
    if (!currentUser) return alert("Please login to vote");
    // Mock posts cannot be updated in DB
    if (post.id.toString().startsWith('mock')) return alert("This is a demo post. Create a real post to interact!");

    const postRef = doc(db, "forum_posts", post.id);
    const hasUpvoted = post.upvotedBy?.includes(currentUser.uid);
    
    try {
      if (hasUpvoted) {
        await updateDoc(postRef, {
          upvotes: increment(-1),
          upvotedBy: arrayRemove(currentUser.uid)
        });
      } else {
        await updateDoc(postRef, {
          upvotes: increment(1),
          upvotedBy: arrayUnion(currentUser.uid)
        });
      }
    } catch (error) {
      console.error("Error updating vote:", error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return alert("Please login to comment");
    if (!expandedPostId) return;
    if (expandedPostId.startsWith('mock')) return alert("This is a demo post. Create a real post to interact!");
    
    if (!newComment.trim()) return;
    
    try {
      const postRef = doc(db, "forum_posts", expandedPostId);
      await addDoc(collection(postRef, "comments"), {
        text: newComment,
        author: currentUser.email?.split('@')[0] || "Anonymous",
        authorId: currentUser.uid,
        createdAt: serverTimestamp()
      });
      await updateDoc(postRef, { commentCount: increment(1) });
      setNewComment('');
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleShare = (post: any) => {
    const text = `Check out this discussion on Nyay Saathi: "${post.title}"`;
    navigator.clipboard.writeText(text);
    alert("Link copied to clipboard!");
  };

  return (
    <PageContainer title="Nyay Manch" subtitle="The Citizen's Legal Forum. Discuss, share, and get verified advice.">
      
      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative animate-slide-up">
            <button onClick={() => setIsCreateModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X className="w-5 h-5"/></button>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Start a New Discussion</h3>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
                <input required value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl" placeholder="e.g. Property dispute with neighbor" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                <select value={newPost.category} onChange={e => setNewPost({...newPost, category: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl">
                  {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Details</label>
                <textarea required value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl h-32" placeholder="Describe your legal issue..." />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex justify-center items-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5"/> : "Post Discussion"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <button onClick={() => setIsCreateModalOpen(true)} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mb-6">
              <Plus className="w-5 h-5"/> New Discussion
            </button>
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><Filter className="w-4 h-4"/> Filter by Topic</h4>
              <div className="grid grid-cols-1 gap-2">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-semibold transition-all shadow-sm ${
                      filter === cat
                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/15'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400 hover:bg-amber-50/60'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`w-2 h-2 rounded-full ${filter === cat ? 'bg-amber-300' : 'bg-slate-200'}`}></span>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-3 space-y-6">
          {isPostsLoading ? (
            <div className="text-center text-slate-500 py-10">Loading discussions...</div>
          ) : posts.length === 0 ? (
            <div className="text-center text-slate-500 py-10">No discussions yet. Be the first to post!</div>
          ) : (
            posts.filter(p => filter === "All" || p.category === filter).map(post => (
              <Card key={post.id} className="p-0 border-l-4 border-l-slate-900 border-t-0 hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row">
                  {/* Vote Counter */}
                  <div className="bg-slate-50 p-4 flex sm:flex-col items-center justify-center gap-2 sm:gap-1 border-r border-slate-100 min-w-[80px]">
                    <button onClick={() => handleLike(post)} className={`p-2 rounded-full transition-all ${post.upvotedBy?.includes(currentUser?.uid) ? 'text-amber-600 bg-amber-100' : 'text-slate-400 hover:bg-slate-200'}`}>
                      <ThumbsUp className="w-5 h-5"/>
                    </button>
                    <span className="font-bold text-slate-900">{post.upvotes || 0}</span>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6 flex-1">
                    <div className="flex items-center gap-3 text-xs mb-3 flex-wrap">
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded font-bold uppercase tracking-wider">{post.category}</span>
                      <span className="text-slate-500">• Posted by <span className="font-bold text-slate-800">{post.author}</span></span>
                      <span className="text-slate-400">• {post.createdAt?.seconds ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : post.createdAt?.toDate?.().toLocaleDateString?.() || post.time || "Just now"}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 cursor-pointer hover:text-amber-600 transition-colors" onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}>{post.title}</h3>
                    <p className="text-slate-600 text-sm mb-4 leading-relaxed">{post.content}</p>
                    
                    <div className="flex items-center gap-4 border-t border-slate-100 pt-4">
                      <button onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">
                        <MessageSquare className="w-4 h-4"/> {expandedPostId === post.id ? comments.length : (post.commentCount || 0)} Comments
                      </button>
                      <button onClick={() => handleShare(post)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">
                        <Share2 className="w-4 h-4"/> Share
                      </button>
                    </div>

                    {/* Comments Section */}
                    {expandedPostId === post.id && (
                      <div className="mt-6 pt-6 border-t border-slate-100 bg-slate-50/50 -mx-6 -mb-6 px-6 pb-6 animate-fade-in">
                        <h4 className="font-bold text-slate-900 mb-4">Comments</h4>
                        <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                          {comments.length === 0 ? (
                            <p className="text-sm text-slate-400 italic">No comments yet. Be the first to reply!</p>
                          ) : (
                            comments.map(c => (
                              <div key={c.id} className="bg-white p-3 rounded-xl border border-slate-200 text-sm">
                                <div className="flex justify-between mb-1">
                                  <span className="font-bold text-slate-800">{c.author}</span>
                                  <span className="text-xs text-slate-400">{c.createdAt?.toDate().toLocaleDateString()}</span>
                                </div>
                                <p className="text-slate-600">{c.text}</p>
                              </div>
                            ))
                          )}
                        </div>
                        <form onSubmit={handleAddComment} className="flex gap-2">
                          <input 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 p-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                          />
                          <button type="submit" disabled={!newComment.trim()} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50">
                            <Send className="w-4 h-4"/>
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

      </div>
    </PageContainer>
  );
};

export default CommunityForum;
