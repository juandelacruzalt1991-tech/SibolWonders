import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, where, or } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useFirebase } from '../components/FirebaseProvider';
import { Link } from 'react-router-dom';
import { Send, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: any;
}

export default function Messages() {
  const { user } = useFirebase();
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [receiverId, setReceiverId] = useState(''); // Simplified: normally this would be a user picker

  useEffect(() => {
    if (!user) return;
    
    // Get messages where user is sender or receiver
    const q = query(
      collection(db, 'messages'), 
      or(
        where('senderId', '==', user.uid),
        where('receiverId', '==', user.uid)
      ),
      orderBy('createdAt', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(data);
    });
    return unsubscribe;
  }, [user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim() || !receiverId.trim()) return;

    try {
      await addDoc(collection(db, 'messages'), {
        senderId: user.uid,
        receiverId,
        content,
        createdAt: serverTimestamp()
      });
      setContent('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-white p-12 rounded-[3rem] border border-brand-peach/50 shadow-sm">
          <MessageCircle size={48} className="mx-auto text-brand-peach-dark mb-4" />
          <h2 className="text-3xl font-bold mb-4">Messages</h2>
          <p className="text-brand-text/70 mb-8">Sign in to connect directly with other members.</p>
          <Link to="/login" className="bg-brand-peach-dark text-white px-8 py-3 rounded-full font-bold">Sign In to Continue</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Direct Messages</h1>
      
      <div className="bg-white rounded-[2.5rem] border border-gray-200 overflow-hidden shadow-sm flex flex-col h-[600px] md:h-[700px]">
        {/* Simplified User Picker Header */}
        <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-4">
          <div className="font-medium text-sm text-brand-text/60 shrink-0">Send to (User ID):</div>
          <input 
            type="text" 
            value={receiverId}
            onChange={e => setReceiverId(e.target.value)}
            className="flex-1 bg-white border border-gray-200 px-4 py-2 rounded-xl focus:outline-none focus:border-brand-peach-dark text-sm"
            placeholder="Paste a user's ID here..."
          />
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fdfbf7]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-brand-text/50">
              <MessageCircle size={40} className="mb-4 text-gray-300" />
              <p>No messages yet.</p>
              <p className="text-sm mt-2">Enter a User ID above and send a message to start.</p>
            </div>
          ) : (
            messages.map(msg => {
              const isMine = msg.senderId === user.uid;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-6 py-3 shadow-sm ${
                    isMine 
                      ? 'bg-brand-peach-dark text-white rounded-br-sm' 
                      : 'bg-white border border-gray-100 text-brand-text rounded-bl-sm'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                   <div className={`text-[10px] mt-1 text-right ${isMine ? 'text-white/70' : 'text-gray-400'}`}>
                     {msg.createdAt?.toDate ? formatDistanceToNow(msg.createdAt.toDate(), { addSuffix: true }) : ''}
                   </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-white border-t border-gray-100">
          <form onSubmit={handleSend} className="flex gap-3">
            <input 
              type="text" 
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-50 border border-gray-200 px-6 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-peach-dark"
            />
            <button 
              type="submit"
              disabled={!content.trim() || !receiverId.trim()}
              className="bg-brand-text text-white w-14 h-14 rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-black transition-colors shrink-0"
            >
              <Send size={20} className="-mr-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
