/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Gallery from "./components/Gallery";
import Services from "./components/Services";
import InquiryForm from "./components/InquiryForm";
import AIAssistant from "./components/AIAssistant";

export default function App() {
  return (
    <div className="min-h-screen bg-studio-black overflow-x-hidden selection:bg-studio-gold selection:text-white">
      <Navbar />
      
      <main>
        <Hero />
        
        <section id="about" className="py-24 px-6 md:px-12 border-y border-white/5 bg-studio-gray/30">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-[10px] uppercase tracking-[0.4em] text-studio-gold mb-8 block font-bold">The Philosophy</span>
              <h2 className="font-serif text-3xl md:text-5xl italic leading-tight mb-12">
                "Photography is not about what is seen, but about how it is felt."
              </h2>
              <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-2xl mx-auto italic font-serif">
                Akta Studio was founded on the belief that every image should tell a story that transcends the moment. We specialize in finding the ethereal quality in every subject, blending classical techniques with modern artistic vision.
              </p>
            </motion.div>
          </div>
        </section>

        <Gallery />
        <Services />
        
        <section className="py-24 bg-studio-black border-y border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] font-serif italic text-white whitespace-nowrap">AKTA EST. 2012</div>
          </div>
          <div className="relative z-10 text-center">
             <h2 className="font-serif text-4xl italic mb-6">Experience Art in Motion</h2>
             <p className="text-white/40 text-xs uppercase tracking-widest mb-12">Global availability for editorial and private commissions</p>
             <a href="#contact" className="btn-luxury">Start a Collaboration</a>
          </div>
        </section>

        <InquiryForm />
      </main>

      <footer className="py-12 px-6 border-t border-white/5 bg-studio-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <span className="font-serif text-xl italic tracking-widest">AKTA</span>
            <p className="text-white/30 text-[10px] uppercase tracking-widest mt-2">© 2024 Akta Photo Studio. All Rights Reserved.</p>
          </div>
          
          <div className="flex gap-8 text-[10px] uppercase tracking-widest font-bold text-white/40">
            <a href="#" className="hover:text-studio-gold transition-colors">Privacy</a>
            <a href="#" className="hover:text-studio-gold transition-colors">Terms</a>
            <a href="#" className="hover:text-studio-gold transition-colors">Press</a>
          </div>
          
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer">
              <span className="text-xs">IG</span>
            </div>
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer">
              <span className="text-xs">FB</span>
            </div>
          </div>
        </div>
      </footer>

      <AIAssistant />
    </div>
  );
}

