import { Camera, Heart, Film, Users } from "lucide-react";
import { motion } from "motion/react";

const services = [
  {
    title: "Editorial Portrait",
    icon: Camera,
    desc: "Artistic, high-fashion storytelling through fine art photography.",
    price: "Starts at $800"
  },
  {
    title: "Cinematic Wedding",
    icon: Heart,
    desc: "Candid, emotive coverage of your most significant milestone.",
    price: "Starts at $3,500"
  },
  {
    title: "Brand Content",
    icon: Film,
    desc: "Elevated visuals for modern brands and creative agencies.",
    price: "Custom Quote"
  },
  {
    title: "Exclusive Events",
    icon: Users,
    desc: "Sophisticated event coverage for galas, launches and premieres.",
    price: "Starts at $1,500"
  }
];

export default function Services() {
  return (
    <section id="services" className="py-24 px-4 bg-studio-black">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="font-serif text-5xl italic mb-6">Our Services</h2>
          <div className="w-12 h-px bg-studio-gold mx-auto mb-6"></div>
          <p className="text-white/40 text-xs uppercase tracking-widest">Crafting visual legacies</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-8 border border-white/5 hover:border-studio-gold/30 hover:bg-white/5 transition-all duration-500 rounded-2xl"
            >
              <item.icon className="text-studio-gold mb-8 opacity-60 group-hover:opacity-100 transition-opacity" size={24} />
              <h3 className="font-serif text-xl italic mb-4">{item.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-6 h-12">
                {item.desc}
              </p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-white/30 group-hover:text-studio-gold transition-colors">
                {item.price}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
