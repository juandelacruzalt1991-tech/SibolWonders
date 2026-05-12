import React, { useState } from 'react';
import { Mail, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending
    setTimeout(() => setSent(true), 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-brand-text">Get in Touch</h1>
        <p className="text-xl text-brand-text/70 leading-relaxed max-w-2xl mx-auto">
          We’re here to help, listen, and connect. Send us a message or find us on social media.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white rounded-[3rem] p-8 md:p-12 border border-brand-peach/50 shadow-sm">
        
        {/* Contact Form */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
          {sent ? (
            <div className="bg-brand-green/30 text-brand-text p-6 rounded-2xl border border-brand-green">
              <h3 className="font-bold flex items-center gap-2 mb-2">
                <span className="text-xl">🙌</span> Message sent!
              </h3>
              <p>Thank you for reaching out. We will get back to you as soon as possible.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Name</label>
                <input 
                  type="text" 
                  required 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-peach-dark"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Email</label>
                <input 
                  type="email" 
                  required 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-peach-dark"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Message</label>
                <textarea 
                  required 
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-peach-dark resize-none"
                  placeholder="How can we help?"
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="w-full bg-brand-peach-dark text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity"
              >
                Send Message
              </button>
            </form>
          )}
        </div>

        {/* Socials & Info */}
        <div className="flex flex-col justify-center">
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Connect with us</h2>
            <p className="text-brand-text/70 mb-6">Follow our journey and join our online communities.</p>
            <div className="flex gap-4">
              <a href="#" className="p-4 bg-brand-cream rounded-full text-brand-peach-dark hover:bg-brand-peach-dark hover:text-white transition-colors">
                <Facebook size={24} />
              </a>
              <a href="#" className="p-4 bg-brand-cream rounded-full text-brand-peach-dark hover:bg-brand-peach-dark hover:text-white transition-colors">
                <Instagram size={24} />
              </a>
              <a href="#" className="p-4 bg-brand-cream rounded-full text-brand-peach-dark hover:bg-brand-peach-dark hover:text-white transition-colors">
                <Twitter size={24} />
              </a>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-4">Direct Contact</h2>
            <div className="flex items-center gap-3 text-brand-text/80 mb-2">
              <Mail size={20} className="text-brand-peach-dark" />
              <a href="mailto:hello@sibolwonders.com" className="hover:underline">hello@sibolwonders.com</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
