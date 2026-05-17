import React, { useState } from "react";
import { motion } from "motion/react";

export default function InquiryForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      setStatus("idle");
    }
  };

  return (
    <section id="contact" className="py-24 px-4 bg-studio-gray/50">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-16">
        <div>
          <h2 className="font-serif text-5xl italic mb-8">Let's Create <br /> Something Timeless.</h2>
          <p className="text-white/50 mb-12 text-sm leading-relaxed max-w-sm">
            Whether you have a specific vision or want us to guide you, we're here to capture your most precious moments.
          </p>
          
          <div className="space-y-4 text-sm font-medium tracking-wide">
            <p className="text-studio-gold">contact@aktastudio.com</p>
            <p>+1 (555) 012 3456</p>
            <p className="text-white/30 pt-4">Los Angeles, CA / New York, NY</p>
          </div>
        </div>

        <div className="glass-morphism p-10 rounded-3xl">
          {status === 'success' ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <h3 className="font-serif text-3xl italic mb-4 text-studio-gold">Thank You.</h3>
              <p className="text-white/60">Your message has been received. Our team will reach out shortly.</p>
              <button 
                onClick={() => setStatus('idle')}
                className="mt-8 text-xs uppercase tracking-widest underline decoration-studio-gold underline-offset-8"
              >
                Send another message
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-white/40 block mb-2">Name</label>
                <input 
                  type="text" 
                  required
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-white/5 border-b border-white/10 py-3 px-4 outline-none focus:border-studio-gold transition-colors text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-white/40 block mb-2">Email</label>
                <input 
                  type="email" 
                  required
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full bg-white/5 border-b border-white/10 py-3 px-4 outline-none focus:border-studio-gold transition-colors text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-white/40 block mb-2">Message</label>
                <textarea 
                  rows={4}
                  required
                  value={form.message}
                  onChange={e => setForm({...form, message: e.target.value})}
                  className="w-full bg-white/5 border-b border-white/10 py-3 px-4 outline-none focus:border-studio-gold transition-colors text-sm resize-none"
                ></textarea>
              </div>
              <button 
                disabled={status === 'loading'}
                className="w-full btn-luxury mt-4"
              >
                {status === 'loading' ? 'Sending...' : 'Send Inquiry'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
