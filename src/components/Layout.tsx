import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Heart, BookOpen, Calendar, Map, Users, MessageCircle, Menu, X, User as UserIcon, Shield } from 'lucide-react';
import { useFirebase } from './FirebaseProvider';

export default function Layout() {
  const { user } = useFirebase();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const navLinks = [
    { to: '/stories', icon: BookOpen, label: 'Stories' },
    { to: '/resources', icon: Map, label: 'Resources' },
    { to: '/events', icon: Calendar, label: 'Events' },
    { to: '/forums', icon: Users, label: 'Community' },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="bg-white border-b border-brand-peach/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-24 items-center">
            <Link to="/" className="flex items-center gap-1 -ml-2">
              <img src="/new_logo.jpeg" alt="Sibol Wonders Logo" className="h-16 md:h-20 w-auto mix-blend-multiply transform scale-[1.35] origin-left" />
              <div className="graffiti-text-wrapper text-2xl md:text-3xl font-normal leading-none transform -rotate-2 ml-4 md:ml-6">
                <span className="graffiti-text-green lowercase">sibol</span>
                <span className="graffiti-text-blue lowercase">wonders</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-2 font-semibold text-brand-text/80 hover:text-brand-peach-dark transition-colors"
                >
                  <link.icon size={18} />
                  {link.label}
                </Link>
              ))}
              <div className="w-px h-6 bg-gray-200" />
              {user ? (
                <div className="flex items-center gap-4">
                  {(user.email === 'juandelacruz.alt1991@gmail.com' || (user as any).profile?.role === 'admin') && (
                    <Link to="/admin" className="text-brand-text/80 hover:text-brand-peach-dark transition-colors font-semibold mr-2 flex items-center gap-1">
                      <Shield size={18} /> Admin
                    </Link>
                  )}
                  <Link to="/messages" className="text-brand-text/80 hover:text-brand-peach-dark transition-colors">
                    <MessageCircle size={24} />
                  </Link>
                  <Link to="/profile" className="flex items-center gap-2 bg-brand-green/50 px-4 py-2 rounded-full font-semibold text-brand-text hover:bg-brand-green transition-colors">
                    <UserIcon size={18} />
                    Profile
                  </Link>
                </div>
              ) : (
                <Link to="/login" className="bg-brand-peach-dark text-white px-6 py-2.5 rounded-full font-bold hover:opacity-90 transition-opacity shadow-sm">
                  Join Us
                </Link>
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-brand-text"
            >
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-brand-cream font-medium"
                >
                  <link.icon size={20} className="text-brand-peach-dark" />
                  {link.label}
                </Link>
              ))}
              <div className="my-4 border-t border-gray-100" />
              {user ? (
                <>
                  {(user.email === 'juandelacruz.alt1991@gmail.com' || (user as any).profile?.role === 'admin') && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-brand-cream font-medium text-brand-peach-dark">
                      <Shield size={20} />
                      Admin Dashboard
                    </Link>
                  )}
                  <Link to="/messages" onClick={() => setMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-brand-cream font-medium">
                    <MessageCircle size={20} className="text-brand-peach-dark" />
                    Messages
                  </Link>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-brand-green/30 font-medium">
                    <UserIcon size={20} className="text-brand-text" />
                    My Profile
                  </Link>
                </>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block w-full text-center bg-brand-peach-dark text-white px-6 py-3 rounded-2xl font-bold">
                  Join Us
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-brand-peach/50 mt-20 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center gap-1 -ml-2 mb-6">
                <img src="/new_logo.jpeg" alt="Sibol Wonders Logo" className="h-16 md:h-20 w-auto mix-blend-multiply transform scale-[1.35] origin-left" />
                <div className="graffiti-text-wrapper text-3xl font-normal leading-none transform -rotate-2 ml-4 md:ml-6">
                  <span className="graffiti-text-green lowercase">sibol</span>
                  <span className="graffiti-text-blue lowercase">wonders</span>
                </div>
              </Link>
              <p className="text-brand-text/70 mb-6 max-w-sm">
                A safe digital community space where families feel understood, supported, and connected.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-brand-text">Explore</h3>
              <ul className="space-y-3 text-brand-text/70">
                <li><Link to="/stories" className="hover:text-brand-peach-dark">Stories</Link></li>
                <li><Link to="/resources" className="hover:text-brand-peach-dark">Resources</Link></li>
                <li><Link to="/events" className="hover:text-brand-peach-dark">Events</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-brand-text">Community</h3>
              <ul className="space-y-3 text-brand-text/70">
                <li><Link to="/forums" className="hover:text-brand-peach-dark">Forums</Link></li>
                <li><Link to="/contact" className="hover:text-brand-peach-dark">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 text-center text-sm text-brand-text/50">
            &copy; {new Date().getFullYear()} Sibol Wonders. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
