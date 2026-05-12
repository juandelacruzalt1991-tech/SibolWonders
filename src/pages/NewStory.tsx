import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useFirebase } from '../components/FirebaseProvider';
import { ImagePlus, Loader2 } from 'lucide-react';

export default function NewStory() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useFirebase();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const newStoryRef = doc(collection(db, 'stories'));
      await setDoc(newStoryRef, {
        title,
        content,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1544365558-35aa4afcf11f?auto=format&fit=crop&q=80&w=1000',
        authorId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      navigate('/stories');
    } catch (err) {
      console.error(err);
      alert('Error saving story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Please log in to share a story</h2>
        <button onClick={() => navigate('/login')} className="bg-brand-peach-dark text-white px-8 py-3 rounded-full font-bold">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Share Your Story</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Story Title</label>
          <input 
            type="text" 
            required 
            maxLength={200}
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-peach-dark"
            placeholder="A short, catchy title"
          />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Your Story</label>
          <textarea 
            required 
            maxLength={100000}
            rows={10}
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-peach-dark resize-y"
            placeholder="Share your experiences, challenges, or milestones..."
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Image (Optional)</label>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input 
              type="url" 
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-peach-dark"
              placeholder="https://example.com/image.jpg or Upload Base64"
            />
            <label className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors whitespace-nowrap">
              <ImagePlus size={20} />
              <span>Upload File</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      if (event.target?.result) {
                        setImageUrl(event.target.result as string);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>
          {imageUrl && (
             <div className="mt-4 aspect-video rounded-xl overflow-hidden bg-gray-100 relative">
               <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
             </div>
          )}
        </div>
        
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-brand-peach-dark text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-peach transition-colors disabled:opacity-70"
        >
          {isSubmitting ? (
            <><Loader2 size={20} className="animate-spin" /> Publishing...</>
          ) : (
            'Publish Story'
          )}
        </button>
      </form>
    </div>
  );
}
