import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useFirebase } from '../components/FirebaseProvider';
import { Trash2, Plus, ShieldAlert, Calendar, MapPin, Users as UsersIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { user, profile } = useFirebase();
  const [activeTab, setActiveTab] = useState<'events' | 'resources' | 'forums' | 'users'>('events');
  const [events, setEvents] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [forums, setForums] = useState<any[]>([]);

  // Event Form State
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventLink, setEventLink] = useState('');

  // Resource Form State
  const [resName, setResName] = useState('');
  const [resDescription, setResDescription] = useState('');
  const [resContact, setResContact] = useState('');
  const [resLocation, setResLocation] = useState('');
  const [resCategory, setResCategory] = useState('schools');

  const isOnlyAdmin = user?.email === 'juandelacruz.alt1991@gmail.com' || profile?.role === 'admin';
  const isModerator = profile?.role === 'moderator';
  const isStaff = isOnlyAdmin || isModerator;

  useEffect(() => {
    if (!isStaff) return;
    
    if (!isOnlyAdmin && activeTab === 'events') {
      setActiveTab('resources');
    }

    let unsubEvents: any;
    let unsubResources: any;
    let unsubUsers: any;
    let unsubForums: any;

    if (isOnlyAdmin) {
      unsubEvents = onSnapshot(query(collection(db, 'events')), (snap) => {
        setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
        setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    }

    unsubResources = onSnapshot(collection(db, 'resources'), (snap) => {
      setResources(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    unsubForums = onSnapshot(query(collection(db, 'forums'), orderBy('updatedAt', 'desc')), (snap) => {
      setForums(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      if (unsubEvents) unsubEvents();
      if (unsubResources) unsubResources();
      if (unsubUsers) unsubUsers();
      if (unsubForums) unsubForums();
    };
  }, [isStaff, isOnlyAdmin]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'events'), {
        name: eventName,
        date: new Date(eventDate).toISOString(),
        description: eventDescription,
        registrationLink: eventLink,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setEventName(''); setEventDate(''); setEventDescription(''); setEventLink('');
    } catch (err) {
      console.error(err);
      alert('Error adding event');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Delete this event?')) return;
    await deleteDoc(doc(db, 'events', id));
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'resources'), {
        name: resName,
        description: resDescription,
        contactInfo: resContact,
        location: resLocation,
        category: resCategory,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setResName(''); setResDescription(''); setResContact(''); setResLocation('');
    } catch (err) {
      console.error(err);
      alert('Error adding resource');
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!window.confirm('Delete this resource?')) return;
    await deleteDoc(doc(db, 'resources', id));
  };

  const handleDeleteForum = async (id: string) => {
    if (!window.confirm('Delete this forum topic and all its posts?')) return;
    try {
      await deleteDoc(doc(db, 'forums', id));
      // NOTE: For a real app, you'd also need a Cloud Function or batch to delete subcollections like 'posts'.
      // With these rules, at least the topic is gone.
    } catch (err) {
      console.error(err);
      alert('Error deleting forum topic');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!window.confirm(`Change this user's role to ${newRole}?`)) return;
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
      alert('Error updating role');
    }
  };

  if (!isStaff) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <ShieldAlert size={48} className="mx-auto text-brand-peach-dark mb-4" />
        <h2 className="text-3xl font-bold mb-4">Access Denied</h2>
        <p className="text-brand-text/70">You need administrator privileges to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200 pb-4">
        {isOnlyAdmin && (
          <button 
            onClick={() => setActiveTab('events')} 
            className={`font-bold px-4 py-2 rounded-xl transition-colors ${activeTab === 'events' ? 'bg-brand-peach-dark text-white' : 'bg-gray-100 text-brand-text/70'}`}
          >
            Manage Events
          </button>
        )}
        <button 
          onClick={() => {
            if (!isOnlyAdmin && activeTab === 'events') setActiveTab('resources');
            setActiveTab('resources')
          }} 
          className={`font-bold px-4 py-2 rounded-xl transition-colors ${activeTab === 'resources' || (!isOnlyAdmin && activeTab === 'events') ? 'bg-brand-peach-dark text-white' : 'bg-gray-100 text-brand-text/70'}`}
        >
          Manage Resources
        </button>
        <button 
          onClick={() => setActiveTab('forums')} 
          className={`font-bold px-4 py-2 rounded-xl transition-colors ${activeTab === 'forums' ? 'bg-brand-peach-dark text-white' : 'bg-gray-100 text-brand-text/70'}`}
        >
          Manage Forums
        </button>
        {isOnlyAdmin && (
          <button 
            onClick={() => setActiveTab('users')} 
            className={`font-bold px-4 py-2 rounded-xl transition-colors ${activeTab === 'users' ? 'bg-brand-peach-dark text-white' : 'bg-gray-100 text-brand-text/70'}`}
          >
            Manage Users
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Form Column */}
        {activeTab !== 'users' && activeTab !== 'forums' && (
          <div className="lg:col-span-1 bg-brand-cream border border-brand-peach/50 p-6 rounded-3xl h-max">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Plus size={24} /> Add {activeTab === 'events' ? 'Event' : 'Resource'}
            </h2>

            {activeTab === 'events' && isOnlyAdmin ? (
              <form onSubmit={handleAddEvent} className="space-y-4">
                <input required value={eventName} onChange={e => setEventName(e.target.value)} type="text" placeholder="Event Name" className="w-full px-4 py-3 rounded-xl border border-gray-200" />
                <input required value={eventDate} onChange={e => setEventDate(e.target.value)} type="datetime-local" className="w-full px-4 py-3 rounded-xl border border-gray-200" />
                <textarea required value={eventDescription} onChange={e => setEventDescription(e.target.value)} rows={3} placeholder="Description" className="w-full px-4 py-3 rounded-xl border border-gray-200 resize-none" />
                <input value={eventLink} onChange={e => setEventLink(e.target.value)} type="url" placeholder="Registration Link (Optional)" className="w-full px-4 py-3 rounded-xl border border-gray-200" />
                <button type="submit" className="w-full bg-brand-text text-white font-bold py-3 rounded-xl">Create Event</button>
              </form>
            ) : (
              <form onSubmit={handleAddResource} className="space-y-4">
                <input required value={resName} onChange={e => setResName(e.target.value)} type="text" placeholder="Resource Name" className="w-full px-4 py-3 rounded-xl border border-gray-200" />
                <select value={resCategory} onChange={e => setResCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white">
                  <option value="schools">Schools</option>
                  <option value="therapy">Therapy Centers</option>
                  <option value="ngos">NGOs</option>
                </select>
                <textarea required value={resDescription} onChange={e => setResDescription(e.target.value)} rows={3} placeholder="Description" className="w-full px-4 py-3 rounded-xl border border-gray-200 resize-none" />
                <input required value={resContact} onChange={e => setResContact(e.target.value)} type="text" placeholder="Contact Info (Phone/Email)" className="w-full px-4 py-3 rounded-xl border border-gray-200" />
                <input required value={resLocation} onChange={e => setResLocation(e.target.value)} type="text" placeholder="Location/Address" className="w-full px-4 py-3 rounded-xl border border-gray-200" />
                <button type="submit" className="w-full bg-brand-text text-white font-bold py-3 rounded-xl">Create Resource</button>
              </form>
            )}
          </div>
        )}

        {/* List Column */}
        <div className={`lg:col-span-${activeTab === 'users' || activeTab === 'forums' ? '3' : '2'} space-y-4`}>
          <h2 className="text-2xl font-bold mb-6">
            Current {activeTab === 'events' ? 'Events' : activeTab === 'resources' ? 'Resources' : activeTab === 'forums' ? 'Forums' : 'Users'}
          </h2>
          
          {activeTab === 'events' && isOnlyAdmin ? (
            events.map(ev => (
              <div key={ev.id} className="bg-white p-6 rounded-2xl border border-gray-100 flex justify-between items-center gap-4">
                <div>
                  <h3 className="font-bold text-lg">{ev.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-brand-text/70 mt-1">
                    <Calendar size={14} /> {format(new Date(ev.date), 'PPpp')}
                  </div>
                </div>
                <button onClick={() => handleDeleteEvent(ev.id)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100">
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          ) : activeTab === 'users' && isOnlyAdmin ? (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 font-bold text-gray-600">User</th>
                    <th className="p-4 font-bold text-gray-600">Email</th>
                    <th className="p-4 font-bold text-gray-600">Role</th>
                    <th className="p-4 font-bold text-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        {u.photoURL ? (
                          <img src={u.photoURL} alt="" className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center font-bold text-brand-peach-dark">
                            {u.displayName?.substring(0, 2).toUpperCase() || 'U'}
                          </div>
                        )}
                        <span className="font-bold">{u.displayName || 'Unknown User'}</span>
                      </td>
                      <td className="p-4 text-brand-text/70">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          u.role === 'admin' ? 'bg-red-100 text-red-700' : 
                          u.role === 'moderator' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {u.role || 'member'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <select 
                          value={u.role || 'member'} 
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-peach-dark"
                        >
                          <option value="member">Member</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="p-8 text-center text-brand-text/50">No users found.</div>
              )}
            </div>
          ) : activeTab === 'forums' ? (
            <div className="grid grid-cols-1 gap-4">
              {forums.map(forum => (
                <div key={forum.id} className="bg-white p-6 rounded-2xl border border-gray-100 flex justify-between items-center gap-4">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{forum.title}</h3>
                    <p className="text-brand-text/70 line-clamp-1">{forum.description}</p>
                    <div className="flex items-center gap-2 text-sm text-brand-text/50 mt-2">
                       <Clock size={14} /> 
                       {forum.updatedAt?.toDate ? format(forum.updatedAt.toDate(), 'PPpp') : 'Recent'}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteForum(forum.id)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 flex-shrink-0">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          ) : activeTab === 'resources' ? (
            resources.map(res => (
              <div key={res.id} className="bg-white p-6 rounded-2xl border border-gray-100 flex justify-between items-center gap-4">
                <div>
                  <div className="text-xs font-bold uppercase text-brand-peach-dark mb-1">{res.category}</div>
                  <h3 className="font-bold text-lg">{res.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-brand-text/70 mt-1">
                    <MapPin size={14} /> {res.location}
                  </div>
                </div>
                <button onClick={() => handleDeleteResource(res.id)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100">
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          ) : null}

          {((activeTab === 'events' && events.length === 0 && isOnlyAdmin) || 
            (activeTab === 'resources' && resources.length === 0) || 
            (activeTab === 'forums' && forums.length === 0)) && (
            <div className="text-center py-12 text-brand-text/50 bg-white rounded-2xl border border-gray-100">
              No items found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
