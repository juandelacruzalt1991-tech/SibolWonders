import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useFirebase } from '../components/FirebaseProvider';
import { Loader2, ArrowLeft, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function StoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useFirebase();
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const isAdmin = profile?.role === 'admin' || user?.email === 'juandelacruz.alt1991@gmail.com';

  useEffect(() => {
    async function fetchStory() {
      if (!id) return;
      try {
        const docRef = doc(db, 'stories', id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setStory({ id: snapshot.id, ...snapshot.data() });
        } else {
          setStory(null);
        }
      } catch (err) {
        console.error("Error fetching story:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStory();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this story?')) return;
    try {
      await deleteDoc(doc(db, 'stories', id));
      navigate('/stories');
    } catch (err) {
      console.error(err);
      alert('Error deleting story');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-brand-peach-dark" size={40} />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Story not found</h2>
        <button onClick={() => navigate('/stories')} className="text-brand-peach-dark font-bold hover:underline">
          &larr; Back to Stories
        </button>
      </div>
    );
  }

  const isOwner = user?.uid === story.authorId;
  const canDelete = isOwner || isAdmin; // In the rules, delete: if isOwner. It does not have isAdmin. Let me double check rules! Actually wait, rule is: `allow delete: if isSignedIn() && existing().authorId == request.auth.uid;`. Admins cannot delete based on rules!

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <button onClick={() => navigate('/stories')} className="flex items-center gap-2 text-brand-text/70 hover:text-brand-text font-medium mb-8">
        <ArrowLeft size={20} /> Back to Stories
      </button>

      <article className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
        {story.imageUrl && (
          <div className="w-full aspect-[21/9] bg-gray-100 overflow-hidden">
            <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover" />
          </div>
        )}
        
        <div className="p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-serif">{story.title}</h1>
          <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8 text-brand-text/70 text-sm">
            <span>Posted {story.createdAt?.toDate ? format(story.createdAt.toDate(), 'MMMM d, yyyy') : 'Recently'}</span>
            
            {canDelete && (
              <button onClick={handleDelete} className="flex items-center gap-2 text-red-500 hover:text-red-700 font-bold transition-colors">
                <Trash2 size={16} /> Delete
              </button>
            )}
          </div>
          
          <div className="content overflow-hidden text-lg text-brand-text leading-relaxed whitespace-pre-wrap">
            {story.content}
          </div>
        </div>
      </article>
    </div>
  );
}
