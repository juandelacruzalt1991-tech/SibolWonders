import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MapPin, Phone, Building } from 'lucide-react';

interface Resource {
  id: string;
  name: string;
  description: string;
  contactInfo: string;
  location: string;
  category: 'schools' | 'therapy' | 'ngos';
}

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filter, setFilter] = useState<'all' | 'schools' | 'therapy' | 'ngos'>('all');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'resources'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource));
      setResources(data);
    }, (error) => {
      console.error("Error fetching resources:", error);
    });
    return unsubscribe;
  }, []);

  const filtered = filter === 'all' ? resources : resources.filter(r => r.category === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-brand-text">Directory & Resources</h1>
        <p className="text-xl text-brand-text/70 leading-relaxed">
          Find inclusive schools, therapy centers, and non-profits in your area.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 justify-center mb-12">
        {(['all', 'schools', 'therapy', 'ngos'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-6 py-3 rounded-full font-bold capitalize transition-colors ${
              filter === cat 
                ? 'bg-brand-peach-dark text-white shadow-md' 
                : 'bg-white text-brand-text hover:bg-brand-peach/30 border border-brand-peach/50'
            }`}
          >
            {cat === 'all' ? 'All Resources' : cat}
          </button>
        ))}
      </div>

      {resources.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2rem] border border-brand-peach/50">
          <p className="text-brand-text/70">No resources found. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(res => (
            <div key={res.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-brand-peach/30 hover:shadow-md transition-shadow">
              <div className="mb-4 inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-green/50 text-brand-text">
                {res.category}
              </div>
              <h3 className="text-xl font-bold mb-2">{res.name}</h3>
              <p className="text-brand-text/70 mb-6">{res.description}</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm text-brand-text/80">
                  <MapPin size={18} className="text-brand-peach-dark shrink-0" />
                  <span>{res.location}</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-brand-text/80">
                  <Phone size={18} className="text-brand-peach-dark shrink-0" />
                  <span>{res.contactInfo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
