import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useFirebase } from '../components/FirebaseProvider';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, User as UserIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ForumPost {
  id: string;
  topicId: string;
  content: string;
  authorId: string;
  createdAt: any;
  updatedAt: any;
}

export default function ForumTopic() {
  const { id } = useParams<{ id: string }>();
  const { user } = useFirebase();
  const [topic, setTopic] = useState<any>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!id || !user) return;

    // Fetch topic details
    getDoc(doc(db, 'forums', id)).then(snap => {
      if (snap.exists()) {
        setTopic({ id: snap.id, ...snap.data() });
      }
    });

    // Subcollection listener
    const q = query(collection(db, 'forums', id, 'posts'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ForumPost));
      setPosts(data);
    });

    return unsubscribe;
  }, [id, user]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !content.trim()) return;

    try {
      await addDoc(collection(db, 'forums', id, 'posts'), {
        topicId: id,
        content,
        authorId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setContent('');
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  if (!user || !topic) {
    return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-brand-text/70">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/forums" className="inline-flex items-center gap-2 text-brand-peach-dark font-medium mb-8 hover:underline">
        <ArrowLeft size={16} /> Back to Forums
      </Link>

      <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-brand-peach/50 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{topic.title}</h1>
        <p className="text-lg text-brand-text/80 whitespace-pre-wrap">{topic.description}</p>
        <div className="mt-6 text-sm text-brand-text/50">
          Posted {topic.createdAt?.toDate ? formatDistanceToNow(topic.createdAt.toDate(), { addSuffix: true }) : ''}
        </div>
      </div>

      <div className="space-y-6 mb-12">
        <h3 className="text-xl font-bold ml-4">{posts.length} {posts.length === 1 ? 'Reply' : 'Replies'}</h3>
        
        {posts.map(post => (
          <div key={post.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex gap-4 md:gap-6">
            <div className="w-12 h-12 bg-gray-100 rounded-full shrink-0 flex items-center justify-center p-2 mt-1">
              <UserIcon className="text-gray-400 w-full h-full" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-brand-text/50 mb-3">
                {post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
              </div>
              <p className="text-brand-text/90 whitespace-pre-wrap leading-relaxed">{post.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-brand-cream border border-brand-peach/50 p-8 rounded-[2rem] shadow-sm">
        <h3 className="text-xl font-bold mb-4">Add a Reply</h3>
        <form onSubmit={handleReply} className="space-y-4">
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required 
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-peach-dark resize-none"
            placeholder="Share your thoughts or advice..."
            maxLength={10000}
          ></textarea>
          <div className="flex justify-end">
            <button 
              type="submit" 
              className="bg-brand-text text-white font-bold px-8 py-3 rounded-full hover:bg-black transition-colors"
            >
              Post Reply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
