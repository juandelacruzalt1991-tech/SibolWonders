import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useFirebase } from '../components/FirebaseProvider';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Home() {
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const { profile, user } = useFirebase();
  const isAdmin = profile?.role === 'admin' || user?.email === 'juandelacruz.alt1991@gmail.com';

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'app_settings', 'global'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.logoUrl) {
            setLogoImage(data.logoUrl);
          }
        }
      },
      (error) => {
        console.error("Error fetching logo:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isAdmin && profile) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const result = event.target?.result as string;
        try {
          setLogoImage(result);
          await setDoc(doc(db, 'app_settings', 'global'), {
            logoUrl: result,
            updatedAt: serverTimestamp(),
            updatedBy: profile.displayName || profile.email || 'Admin',
          });
        } catch (error) {
          console.error("Error saving logo to Firestore", error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-24 pb-20">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto rounded-[3rem] bg-brand-peach/30 overflow-hidden relative border border-brand-peach/50 flex flex-col md:flex-row items-center p-8 md:p-16 gap-12">
          
          <div className="flex-1 space-y-8 z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-brand-peach-dark font-medium text-sm shadow-sm">
              <Heart size={16} className="fill-brand-peach-dark" />
              Welcome to Sibol Wonders
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-brand-text leading-[1.1]">
              A safe space for <span className="text-brand-peach-dark">autism awareness</span>.
            </h1>
            
            <p className="text-xl md:text-2xl text-brand-text/70 max-w-xl leading-relaxed">
              Support and community connection for families navigating neurodiversity together.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/stories" className="bg-brand-peach-dark text-white px-8 py-4 rounded-full font-bold hover:shadow-lg hover:-translate-y-1 transition-all text-lg text-center">
                Explore Stories
              </Link>
              <Link to="/forums" className="bg-white text-brand-text border border-gray-200 px-8 py-4 rounded-full font-bold hover:bg-gray-50 transition-colors text-lg text-center">
                Get Support
              </Link>
            </div>
          </div>

          <div className="flex-1 relative w-full max-w-[16rem] md:max-w-sm mx-auto bg-transparent flex items-center justify-center group">
            {logoImage ? (
              <img src={logoImage} alt="Custom Logo" className="w-full h-auto object-contain mix-blend-multiply transform scale-[1.35]" />
            ) : (
              <img src="/new_logo.jpeg" alt="Sibol Wonders Logo" className="w-full h-auto object-contain mix-blend-multiply transform scale-[1.35]" />
            )}

            {isAdmin && (
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-full z-20 backdrop-blur-sm">
                <span className="text-white font-bold px-6 py-3 bg-brand-peach-dark rounded-full shadow-lg">Upload Your Logo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
            )}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-brand-text">What is Sibol Wonders?</h2>
        <p className="text-xl text-brand-text/80 leading-relaxed">
          We believe in a world where neurodivergent children and their families are embraced, understood, and supported. Sibol means 'to grow', and our mission answers a simple question: "How can we grow together as a community?"
        </p>
      </section>

      {/* Stories Preview */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2">Real Family Stories</h2>
            <p className="text-brand-text/70">Shared experiences from our community</p>
          </div>
          <Link to="/stories" className="hidden md:flex items-center gap-2 text-brand-peach-dark font-semibold hover:gap-3 transition-all">
            View All <ArrowRight size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
             <div key={i} className="group cursor-pointer">
               <div className="aspect-[4/3] rounded-3xl overflow-hidden mb-6 bg-gray-100">
                 <img 
                    src={`https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=600&auto=format&fit=crop&sig=${i}`}
                    alt="Story"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                 />
               </div>
               <h3 className="text-xl font-bold mb-2 group-hover:text-brand-peach-dark transition-colors">Finding our rhythm in a neurotypical world</h3>
               <p className="text-brand-text/70 line-clamp-2">Our journey started with a hundred questions, but finding this community gave us the answers and the confidence we needed...</p>
             </div>
          ))}
        </div>
      </section>

      {/* Highlights / Features Banner */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-white">
          <div className="bg-brand-blue rounded-[3rem] p-12 text-brand-text flex flex-col justify-center items-start">
            <h3 className="text-3xl font-bold mb-4">Discover Resources</h3>
            <p className="text-lg opacity-80 mb-8 max-w-md">Find therapy centers, inclusive schools, and trusted NGOs in our curated directory.</p>
            <Link to="/resources" className="bg-white px-6 py-3 rounded-full font-bold shadow-sm hover:scale-105 transition-transform">
              Explore Directory
            </Link>
          </div>
          <div className="bg-brand-green rounded-[3rem] p-12 text-brand-text flex flex-col justify-center items-start">
            <h3 className="text-3xl font-bold mb-4">Upcoming Events</h3>
            <p className="text-lg opacity-80 mb-8 max-w-md">Join playdates, parent support groups, and workshops coming up near you.</p>
            <Link to="/events" className="bg-white px-6 py-3 rounded-full font-bold shadow-sm hover:scale-105 transition-transform">
              View Calendar
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto text-center px-4">
        <h2 className="text-4xl font-bold mb-6">You don't have to journey alone.</h2>
        <p className="text-xl text-brand-text/70 mb-10">Join our growing community to connect with other parents, ask questions, and share milestones.</p>
        <Link to="/login" className="bg-brand-peach-dark text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all inline-block hover:-translate-y-1">
          Join the Community
        </Link>
      </section>
    </div>
  );
}
