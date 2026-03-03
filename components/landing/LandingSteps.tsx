'use client';

import * as React from 'react';
import { PackagePlus, MapPin, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingSteps: React.FC = () => {
  return (
    <section id="steps" className="py-24 bg-brand-900 relative overflow-hidden text-white">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brand-800/50 blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-violet-900/50 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-brand-300 font-semibold tracking-wide uppercase text-sm mb-3"
          >
            How It Works
          </motion.h2>
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-heading font-bold mb-6"
          >
            Ship in 3 Simple Steps
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-brand-100/80 max-w-2xl mx-auto"
          >
            From label creation to delivery confirmation, we make shipping effortless.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-12 left-[16%] w-[68%] h-0.5 bg-brand-800 z-0 overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-brand-700 via-brand-400 to-brand-700"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative flex flex-col items-center text-center group z-10"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-24 h-24 rounded-3xl bg-brand-800 border border-brand-700 flex items-center justify-center mb-8 text-brand-300 shadow-lg shadow-black/20 z-10 transition-colors duration-300"
            >
              <PackagePlus size={40} />
            </motion.div>
            <h4 className="text-2xl font-bold mb-4">1. Create Your Shipment</h4>
            <p className="text-brand-100/80 leading-relaxed">
              Enter package details, get an instant quote, and purchase your shipping label—all in under 2 minutes.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative flex flex-col items-center text-center group z-10"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: -5 }}
              className="w-24 h-24 rounded-3xl bg-brand-800 border border-brand-700 flex items-center justify-center mb-8 text-brand-300 shadow-lg shadow-black/20 z-10 transition-colors duration-300"
            >
              <MapPin size={40} />
            </motion.div>
            <h4 className="text-2xl font-bold mb-4">2. Drop Off Your Package</h4>
            <p className="text-brand-100/80 leading-relaxed">
              Find a convenient drop-off location near you. Our couriers scan and pick up your package the same day.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative flex flex-col items-center text-center group z-10"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-24 h-24 rounded-3xl bg-brand-800 border border-brand-700 flex items-center justify-center mb-8 text-brand-300 shadow-lg shadow-black/20 z-10 transition-colors duration-300"
            >
              <Smartphone size={40} />
            </motion.div>
            <h4 className="text-2xl font-bold mb-4">3. Track & Deliver</h4>
            <p className="text-brand-100/80 leading-relaxed">
              Watch your package move in real-time. Get photo proof of delivery the moment it arrives at your customer&apos;s door.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LandingSteps;
