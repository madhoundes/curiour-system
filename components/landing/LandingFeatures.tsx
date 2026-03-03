'use client';

import * as React from 'react';
import { DollarSign, Map, Layers, Headphones, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
}

const features: Feature[] = [
  {
    title: "Transparent Pricing",
    description: "No hidden fees or surprises. Get real-time quotes and pay only for what you ship. Up to 40% cheaper than major carriers.",
    icon: DollarSign
  },
  {
    title: "Real-Time Tracking",
    description: "Track every package in real-time with GPS updates. Share tracking links with customers and get delivery proof instantly.",
    icon: Map
  },
  {
    title: "Easy Integration",
    description: "Connect with your e-commerce platform in minutes. Supports major platforms with automatic order syncing and fulfillment.",
    icon: Layers
  },
  {
    title: "Dedicated Support",
    description: "Get help when you need it. Our support team is here to ensure your shipments arrive on time, every time.",
    icon: Headphones
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 20 }
  }
};

const LandingFeatures: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-3"
          >
            Features
          </motion.h2>
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-heading font-bold text-slate-900"
          >
            Everything You Need to <br className="hidden md:block" /> Ship with Confidence
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto"
          >
            Powerful features designed specifically for small businesses and growing merchants.
          </motion.p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={item}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group p-8 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-colors duration-300 cursor-default"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + (idx * 0.1), type: "spring" }}
                className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-50 group-hover:text-brand-600 transition-all duration-300 text-slate-600"
              >
                <feature.icon size={28} />
              </motion.div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default LandingFeatures;
