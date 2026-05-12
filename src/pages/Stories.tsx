import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Story {
  id: string;
  title: string;
  content: string;
  authorId: string;
  imageUrl: string;
  createdAt: any;
}

export default function Stories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
      setStories(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching stories:", error);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-brand-text">Family Stories</h1>
        <p className="text-xl text-brand-text/70 leading-relaxed mb-6">
          Read real experiences, challenges, and beautiful milestones from families in our community.
        </p>
        <Link to="/stories/new" className="inline-block bg-brand-peach-dark text-white px-8 py-4 rounded-full font-bold hover:-translate-y-1 hover:shadow-lg transition-all">
          Share Your Story
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Heart size={40} className="text-brand-peach-dark animate-pulse fill-brand-peach-dark" />
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2rem] border border-brand-peach/50">
          <h3 className="text-2xl font-bold mb-2">No stories yet.</h3>
          <p className="text-brand-text/70 mb-6">Be the first to share your family's journey.</p>
          <Link to="/stories/new" className="bg-brand-peach-dark text-white px-6 py-3 rounded-full font-bold">
            Share Your Story
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map(story => (
            <Link to={`/stories/${story.id}`} key={story.id} className="group flex flex-col bg-white rounded-[2rem] overflow-hidden border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                {story.imageUrl && (
                  <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-2xl font-bold mb-3 group-hover:text-brand-peach-dark transition-colors">{story.title}</h3>
                <p className="text-brand-text/70 line-clamp-3 mb-6 flex-1">
                  {story.content}
                </p>
                <div className="text-sm font-medium text-brand-peach-dark uppercase tracking-wider">
                  Read More
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
