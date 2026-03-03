'use client';

import * as React from 'react';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingFooter: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      id="footer"
      className="bg-slate-900 text-slate-400 py-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 text-white mb-6">
              <Package size={28} className="text-brand-500" />
              <span className="font-heading font-bold text-2xl">Parcego</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Affordable, transparent courier services built for small businesses. Ship smarter with real-time tracking and seamless integrations.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/support" className="hover:text-brand-400 transition-colors">Support</Link></li>
              <li><Link href="/landing/terms" className="hover:text-brand-400 transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link href="/landing/privacy" className="hover:text-brand-400 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/login" className="hover:text-brand-400 transition-colors">Login</Link></li>
              <li><Link href="/track-package" className="hover:text-brand-400 transition-colors">Track Package</Link></li>
              <li><Link href="/support" className="hover:text-brand-400 transition-colors">Help Center</Link></li>
            </ul>
          </div>

          <div className="md:col-span-1">
            <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700">
              <h4 className="text-white font-bold mb-2">Need Help?</h4>
              <p className="text-sm text-slate-400 mb-4">Our dedicated support team is available 24/7 to assist you.</p>
              <Link href="/support" className="text-brand-400 font-medium hover:text-brand-300 flex items-center gap-1 text-sm">
                Contact Support &rarr;
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>&copy; {new Date().getFullYear()} Parcego. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
};

export default LandingFooter;
