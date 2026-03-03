'use client';

import * as React from 'react';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle, Package } from 'lucide-react';
import { LandingButton } from './LandingButton';
import { motion, useScroll, useTransform } from 'framer-motion';

const LandingHero: React.FC = () => {
  const router = useRouter();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const yBackground = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section ref={containerRef} className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-slate-50/30">
      <motion.div
        style={{ y: yBackground }}
        className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden"
      >
        <svg
          className="absolute w-[150%] h-[150%] -top-[20%] -right-[20%] opacity-70 md:w-[1200px] md:h-[1200px] md:-top-[10%] md:-right-[10%]"
          viewBox="0 0 1000 1000"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="featherGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#bae6fd" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="featherGradAccent" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ede9fe" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <filter id="blurSoft" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="80" />
            </filter>
          </defs>
          <path
            d="M100,900 C100,900 -100,400 300,150 C600,-50 900,100 950,300 C1000,500 1100,800 700,900 C500,950 100,900 100,900 Z"
            fill="url(#featherGrad)"
            filter="url(#blurSoft)"
          />
          <path
            d="M300,800 C300,800 200,500 400,300 C600,100 800,200 850,400 C900,600 800,800 300,800 Z"
            fill="url(#featherGradAccent)"
            filter="url(#blurSoft)"
            transform="translate(100, -50)"
          />
        </svg>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8 hover:border-brand-200 transition-colors cursor-default"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
            </span>
            <span className="text-sm font-medium text-slate-600">New: Real-Time GPS Tracking</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="text-5xl md:text-7xl font-heading font-extrabold text-slate-900 tracking-tight mb-6 leading-tight"
          >
            Affordable Courier Services <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-violet-600">Built for Small Businesses</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Ship smarter with transparent pricing, real-time tracking, and seamless integrations. No hidden fees, no surprises—just reliable delivery at prices you can afford.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12 items-center"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <LandingButton
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
                icon={<ArrowRight size={20} />}
                onClick={() => router.push('/login')}
              >
                Get Started Free
              </LandingButton>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <LandingButton
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
                icon={<Package size={20} />}
                onClick={() => router.push('/track-package')}
              >
                Track your shipment
              </LandingButton>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-6 md:gap-12 text-sm font-semibold text-slate-500"
          >
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-brand-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-brand-500" />
              <span>Free account setup</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-brand-500" />
              <span>Cancel anytime</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingHero;
