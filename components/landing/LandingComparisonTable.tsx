'use client';

import * as React from 'react';
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

const rows = [
  { feature: 'Transparent Pricing', parcego: true, other: false },
  { feature: 'Quick Quote Calculator', parcego: true, other: false },
  { feature: 'Real-Time GPS Tracking', parcego: true, other: 'Limited' },
  { feature: 'Photo Proof of Delivery', parcego: true, other: false },
  { feature: 'Easy Integration', parcego: true, other: 'Complex' },
  { feature: '24/7 Support', parcego: true, other: 'Business Hours' },
] as const;

const LandingComparisonTable: React.FC = () => {
  return (
    <section id="comparison" className="py-20 bg-brand-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-3"
          >
            Why Choose Parcego?
          </motion.h2>
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-heading font-bold text-slate-900"
          >
            See how we compare to traditional courier services
          </motion.h3>
        </div>

        <div className="overflow-x-auto pb-2">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="min-w-[800px] bg-white rounded-3xl shadow-xl shadow-brand-900/5 overflow-hidden border border-slate-100"
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 align-bottom">
                  <th className="p-6 text-slate-500 font-medium uppercase text-xs tracking-wider w-1/3">Feature Comparison</th>
                  <th className="px-6 py-6 bg-brand-600 text-white font-bold text-lg w-1/3 text-center md:rounded-t-xl">
                    <div className="flex flex-col items-center justify-end h-full gap-2">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="bg-violet-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wide ring-1 ring-white/20"
                      >
                        Better Choice
                      </motion.div>
                      <span>Parcego</span>
                    </div>
                  </th>
                  <th className="p-6 text-slate-400 font-semibold text-lg w-1/3 text-center align-bottom pb-7">Traditional Carriers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-6 font-medium text-slate-700">{row.feature}</td>
                    <td className="p-6 text-center bg-brand-50/30 border-x border-brand-100/50">
                      <div className="flex justify-center">
                        <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center">
                          <Check size={20} strokeWidth={3} />
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex justify-center items-center h-8">
                        {row.other === false ? (
                          <X size={20} className="text-slate-300" />
                        ) : (
                          <span className="text-slate-400 font-medium text-sm bg-slate-100 px-3 py-1 rounded-full">
                            {row.other}
                          </span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LandingComparisonTable;
