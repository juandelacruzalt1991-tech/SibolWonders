import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useFirebase } from '../components/FirebaseProvider';
import { Link } from 'react-router-dom';
import { MessageSquare, Plus, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ForumTopic {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  createdAt: any;
  updatedAt: any;
}

export default function Forums() {
  const { user } = useFirebase();
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!user) return; // Must be signed in to see forums based on rules
    
    const q = query(collection(db, 'forums'), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ForumTopic));
      setTopics(data);
    });
    return unsubscribe;
  }, [user]);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !description.trim()) return;

    try {
      await addDoc(collection(db, 'forums'), {
        title,
        description,
        creatorId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setTitle('');
      setDescription('');
      setShowNew(false);
    } catch (error) {
      console.error("Error creating topic:", error);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-white p-12 rounded-[3rem] border border-brand-peach/50 shadow-sm">
          <MessageSquare size={48} className="mx-auto text-brand-peach-dark mb-4" />
          <h2 className="text-3xl font-bold mb-4">Community Forums</h2>
          <p className="text-brand-text/70 mb-8">Please join our community to view and participate in discussions.</p>
          <Link to="/login" className="bg-brand-peach-dark text-white px-8 py-3 rounded-full font-bold">Sign In to Continue</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-brand-text">Community Forums</h1>
          <p className="text-xl text-brand-text/70">Connect, ask questions, and share advice with other families.</p>
        </div>
        <button 
          onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-2 bg-brand-text text-white px-6 py-3 rounded-full font-bold hover:bg-black transition-colors"
        >
          {showNew ? 'Cancel' : <><Plus size={20} /> New Topic</>}
        </button>
      </div>

      {showNew && (
        <div className="bg-brand-cream border border-brand-peach/50 p-8 rounded-[2rem] mb-12 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Start a new discussion</h2>
          <form onSubmit={handleCreateTopic} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Topic Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-peach-dark"
                placeholder="What would you like to discuss?"
                maxLength={200}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Details</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required 
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-peach-dark resize-none"
                placeholder="Provide some background..."
                maxLength={10000}
              ></textarea>
            </div>
            <button 
              type="submit" 
              className="bg-brand-peach-dark text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              Post Topic
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm">
        {topics.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-brand-text/70 mb-4">No discussions started yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {topics.map(topic => (
              <Link 
                to={`/forums/${topic.id}`} 
                key={topic.id} 
                className="block p-6 hover:bg-brand-cream/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-brand-peach/20 p-3 rounded-2xl shrink-0 mt-1">
                    <MessageSquare size={24} className="text-brand-peach-dark" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-brand-peach-dark transition-colors">{topic.title}</h3>
                    <p className="text-brand-text/70 line-clamp-2 mb-3">{topic.description}</p>
                    <div className="flex items-center gap-4 text-sm text-brand-text/50">
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> 
                        {topic.updatedAt?.toDate ? formatDistanceToNow(topic.updatedAt.toDate(), { addSuffix: true }) : 'Just now'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
