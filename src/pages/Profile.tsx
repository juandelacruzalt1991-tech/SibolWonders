import React, { useEffect, useState } from 'react';
import { useFirebase } from '../components/FirebaseProvider';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Award, Settings, LogOut, Edit3, MessageCircle, FileText } from 'lucide-react';

export default function Profile() {
  const { user, profile } = useFirebase();
  const navigate = useNavigate();
  const [activityStats, setActivityStats] = useState({ topics: 0, messages: 0 });

  useEffect(() => {
    if (!user) return;
    
    // Fetch user's forum topics count
    const fetchTopics = async () => {
      const q = query(collection(db, 'forums'), where('creatorId', '==', user.uid));
      const snap = await getDocs(q);
      const topicsCount = snap.size;
      
      setActivityStats(prev => ({ ...prev, topics: topicsCount }));
    };

    // Listen to messages sent
    const qMessages = query(collection(db, 'messages'), where('senderId', '==', user.uid));
    const unsubscribeMessages = onSnapshot(qMessages, (snap) => {
      setActivityStats(prev => ({ ...prev, messages: snap.size }));
    });
    
    fetchTopics();
    return () => unsubscribeMessages();
  }, [user]);

  if (!user) {
    return <div className="p-8 text-center mt-12 bg-white rounded-3xl max-w-md mx-auto shadow-sm">Please log in to view your profile.</div>;
  }

  const handleSignout = async () => {
    await signOut(auth);
    navigate('/');
  };

  // Compute dynamic rewards based on activity (10 pts per topic, 2 pts per message)
  const computedRewards = (profile?.rewardPoints || 0) + (activityStats.topics * 10) + (activityStats.messages * 2);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-brand-peach/50 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-peach/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-green/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">
          <div className="w-32 h-32 rounded-full bg-brand-peach/50 p-2 overflow-hidden shrink-0">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover rounded-full" />
            ) : (
              <div className="w-full h-full bg-brand-peach flex items-center justify-center text-4xl text-brand-peach-dark rounded-full font-bold">
                {profile?.displayName?.charAt(0) || user.email?.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2 text-brand-text">{profile?.displayName || 'User'}</h1>
            <p className="text-brand-text/70 mb-6">{user.email}</p>
            
            <div className="inline-flex items-center gap-2 bg-brand-green/30 text-brand-text px-4 py-2 rounded-2xl font-bold mb-8 border border-brand-green">
              <Award size={20} className="text-brand-peach-dark" />
              Community Points: {computedRewards}
            </div>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-8">
              <div className="flex items-center gap-2 text-sm text-brand-text/70 bg-brand-cream px-3 py-1.5 rounded-full">
                <FileText size={16} /> {activityStats.topics} Topics Created
              </div>
              <div className="flex items-center gap-2 text-sm text-brand-text/70 bg-brand-cream px-3 py-1.5 rounded-full">
                <MessageCircle size={16} /> {activityStats.messages} Messages Sent
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <button className="flex items-center gap-2 px-6 py-3 bg-brand-text text-white rounded-full font-bold hover:bg-black transition-colors">
                <Edit3 size={18} /> Edit Profile
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-white text-brand-text border border-gray-200 rounded-full font-bold hover:bg-gray-50 transition-colors">
                <Settings size={18} /> Settings
              </button>
              <button onClick={handleSignout} className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-full font-bold hover:bg-red-100 transition-colors">
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
