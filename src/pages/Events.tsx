import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Calendar, Link as LinkIcon, CalendarPlus } from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id: string;
  name: string;
  date: string; // ISO date string
  description: string;
  registrationLink: string;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'events'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      // could orderBy date in query, but doing it here for simplicity
      const sorted = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setEvents(sorted);
    }, (error) => {
      console.error("Error fetching events:", error);
    });
    return unsubscribe;
  }, []);

  const getGoogleCalendarUrl = (event: Event) => {
    const text = encodeURIComponent(event.name);
    const details = encodeURIComponent(event.description);
    const startDate = new Date(event.date);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Assume 2 hours
    
    const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&dates=${formatDate(startDate)}/${formatDate(endDate)}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-brand-text">Upcoming Events</h1>
        <p className="text-xl text-brand-text/70 leading-relaxed">
          Seminars, parent meetups, and neuro-inclusive playdates in the community.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2rem] border border-brand-peach/50">
          <p className="text-brand-text/70">No upcoming events are scheduled at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-[2rem] p-8 border border-brand-peach/50 shadow-sm flex flex-col md:flex-row gap-8 items-start">
              <div className="bg-brand-peach/30 rounded-2xl p-6 text-center min-w-[120px] flex flex-col items-center justify-center">
                <Calendar size={32} className="text-brand-peach-dark mb-2" />
                <span className="text-xl font-bold text-brand-text">
                  {format(new Date(event.date), 'MMM d')}
                </span>
                <span className="text-sm font-medium text-brand-text/70">
                  {format(new Date(event.date), 'yyyy')}
                </span>
              </div>
              
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">{event.name}</h3>
                <p className="text-brand-text/70 mb-6">{event.description}</p>
                <div className="flex flex-wrap gap-4">
                  {event.registrationLink && (
                    <a 
                      href={event.registrationLink} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-brand-text text-white px-5 py-2.5 rounded-full font-bold hover:bg-black transition-colors"
                    >
                      <LinkIcon size={16} /> Register Now
                    </a>
                  )}
                  <a
                    href={getGoogleCalendarUrl(event)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-brand-text border border-gray-200 px-5 py-2.5 rounded-full font-bold hover:bg-gray-50 transition-colors"
                  >
                    <CalendarPlus size={16} className="text-brand-peach-dark" /> Add to Calendar
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
