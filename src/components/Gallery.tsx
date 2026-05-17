import { motion } from "motion/react";

const portfolioItems = [
  {
    title: "Ethereal Portraits",
    category: "Fine Art",
    image: "/src/assets/images/portfolio_portrait_1779034717388.png",
    span: "col-span-2 md:col-span-1 border-r border-white/5"
  },
  {
    title: "Eternal Bonds",
    category: "Wedding",
    image: "/src/assets/images/portfolio_wedding_1779034734096.png",
    span: "col-span-2 md:col-span-1"
  },
  {
    title: "The Workshop",
    category: "Commercial",
    image: "/src/assets/images/portfolio_studio_1779034750721.png",
    span: "col-span-2 border-t border-white/5"
  }
];

export default function Gallery() {
  return (
    <section id="gallery" className="py-24 px-4 md:px-12 bg-studio-black">
      <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="font-serif text-4xl italic mb-4">The Collection</h2>
          <p className="text-white/50 max-w-md text-sm leading-relaxed">
            A curated selection of moments, captured through a lens of artistic precision and emotional depth.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase tracking-[0.3em] text-studio-gold font-bold">2024 Gallery</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/5 overflow-hidden">
        {portfolioItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2 }}
            className={`relative group bg-studio-black aspect-[4/5] md:aspect-auto ${item.span} h-[60vh] md:h-[80vh] overflow-hidden`}
          >
            <img 
              src={item.image} 
              alt={item.title}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-100 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-studio-black via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
            <div className="absolute bottom-12 left-12">
              <span className="text-[10px] uppercase tracking-widest text-studio-gold mb-2 block font-bold">{item.category}</span>
              <h3 className="font-serif text-2xl italic tracking-tight">{item.title}</h3>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
