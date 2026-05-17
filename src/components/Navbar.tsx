import { motion } from "motion/react";
import { Camera, Instagram, Facebook, Twitter } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-6 py-8 flex justify-between items-center mix-blend-difference">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2"
      >
        <span className="font-serif text-2xl tracking-widest font-bold italic">AKTA</span>
      </motion.div>
      
      <div className="hidden md:flex gap-12 font-sans text-xs uppercase tracking-[0.2em] font-medium">
        <a href="#about" className="hover:text-studio-gold transition-colors">About</a>
        <a href="#gallery" className="hover:text-studio-gold transition-colors">Gallery</a>
        <a href="#services" className="hover:text-studio-gold transition-colors">Services</a>
        <a href="#contact" className="hover:text-studio-gold transition-colors">Contact</a>
      </div>

      <div className="flex gap-6">
        <Instagram size={18} className="cursor-pointer hover:text-studio-gold transition-colors" />
        <Facebook size={18} className="cursor-pointer hover:text-studio-gold transition-colors" />
      </div>
    </nav>
  );
}
