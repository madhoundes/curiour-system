'use client';

import * as React from 'react';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

interface Testimonial {
  id: number;
  content: string;
  author: string;
  role: string;
  company: string;
  avatarUrl: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    content: "Parcego cut our shipping costs by 35% while improving delivery times. The real-time tracking keeps our customers happy and informed.",
    author: "Sarah Mitchell",
    role: "Owner",
    company: "Artisan Crafts Co.",
    avatarUrl: "https://picsum.photos/100/100?random=10"
  },
  {
    id: 2,
    content: "The integration with our online store was seamless. We now ship 200+ orders per week without any hassle. Best decision for our business.",
    author: "James Chen",
    role: "Co-Founder",
    company: "TechGear Plus",
    avatarUrl: "https://picsum.photos/100/100?random=11"
  },
  {
    id: 3,
    content: "Finally, a courier service that understands small businesses. Transparent pricing, fast delivery, and amazing support. Highly recommend!",
    author: "Emily Parker",
    role: "Founder",
    company: "Green Beauty Box",
    avatarUrl: "https://picsum.photos/100/100?random=12"
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 40, damping: 15 }
  }
};

const LandingTestimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-24 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-3"
          >
            Testimonials
          </motion.h2>
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-heading font-bold text-slate-900"
          >
            Trusted by Growing Businesses
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-slate-600"
          >
            See what merchants are saying about Parcego.
          </motion.p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial) => (
            <motion.div key={testimonial.id} variants={item} className="relative flex flex-col p-8 bg-slate-50 rounded-3xl hover:shadow-xl transition-all duration-300 border border-slate-100 group">
              <Quote className="absolute top-6 right-6 text-brand-100 rotate-180 transition-colors group-hover:text-brand-200" size={48} />

              <div className="flex-grow">
                <div className="flex gap-1 text-amber-400 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                </div>
                <p className="text-slate-700 text-lg leading-relaxed mb-8 relative z-10">&ldquo;{testimonial.content}&rdquo;</p>
              </div>

              <motion.div
                initial={{ x: -10, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-4"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={testimonial.avatarUrl} alt={testimonial.author} className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{testimonial.author}</h4>
                  <p className="text-xs text-slate-500">{testimonial.role}, {testimonial.company}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default LandingTestimonials;
