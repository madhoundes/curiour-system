'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Box, ChevronDown, Check, Layers, Loader2, AlertCircle } from 'lucide-react';
import { LandingButton } from './LandingButton';
import { motion, AnimatePresence } from 'framer-motion';
import { quotesService } from '@/lib/api/quotes';
import type { QuoteOptionItem } from '@/lib/api/types';
import { buildQuoteOptionsFromPostal, getDeliverySpeedLabel } from '@/lib/zone-pricing';
import { SERVICE_AREA_LABEL_SHORT } from '@/lib/service-area';

// UI-facing package labels mapped to the backend's ``PackageSize`` enum.
// Envelope -> small, Box -> medium, Pallet -> large.
const PACKAGE_TYPE_TO_API_SIZE: Record<string, 'small' | 'medium' | 'large'> = {
  Envelope: 'small',
  Box: 'medium',
  Pallet: 'large',
};

interface EstimateResult {
  destinationPostalCode: string;
  options: QuoteOptionItem[];
  inSpecialZone: boolean;
}

const validateWeight = (val: string): number | null => {
  const w = parseFloat(val);
  if (isNaN(w) || w < 0.1) return null;
  if (w > 50) return null; // backend hard limit is 50kg
  return w;
};

const LandingRateCalculator: React.FC = () => {
  const [origin, setOrigin] = useState('');
  const [dest, setDest] = useState('');
  const [weight, setWeight] = useState('');
  const [packageType, setPackageType] = useState('Box');

  const [estimate, setEstimate] = useState<EstimateResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [weightError, setWeightError] = useState<string>('');
  const [destError, setDestError] = useState<string>('');
  const [apiError, setApiError] = useState<string>('');
  const [hasCalculated, setHasCalculated] = useState(false);

  const [isPackageOpen, setIsPackageOpen] = useState(false);
  const packageRef = useRef<HTMLDivElement>(null);
  const packageOptions = ['Box', 'Envelope', 'Pallet'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (packageRef.current && !packageRef.current.contains(event.target as Node)) {
        setIsPackageOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setWeight(val);
    const w = parseFloat(val);
    if (!val) {
      setWeightError('');
    } else if (isNaN(w) || w < 0.1) {
      setWeightError('Min 0.1 kg');
    } else if (w > 50) {
      setWeightError('Max 50 kg');
    } else {
      setWeightError('');
    }
  };

  const handleDestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDest(e.target.value);
    if (destError) setDestError('');
    if (apiError) setApiError('');
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();

    const w = validateWeight(weight);
    if (w === null) {
      setWeightError('Please enter a valid weight (0.1 – 50 kg)');
      return;
    }
    setWeightError('');

    const trimmedDest = dest.trim();
    if (!trimmedDest) {
      setDestError('Destination postal code required');
      return;
    }
    if (!quotesService.isValidPostalCode(trimmedDest)) {
      setDestError('Use Canadian format: A1A 1A1');
      return;
    }
    if (!quotesService.isPostalCodeInServiceArea(trimmedDest)) {
      setDestError(`Service area: ${SERVICE_AREA_LABEL_SHORT} only`);
      return;
    }
    setDestError('');
    setApiError('');

    setIsLoading(true);
    setEstimate(null);

    try {
      const apiSize = PACKAGE_TYPE_TO_API_SIZE[packageType] ?? 'medium';
      const response = await quotesService.getOptions(
        buildQuoteOptionsFromPostal(apiSize, w, trimmedDest),
      );

      setEstimate({
        destinationPostalCode: trimmedDest.toUpperCase(),
        options: response.options,
        inSpecialZone: response.in_special_zone,
      });
      setHasCalculated(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to estimate right now. Please try again in a moment.';
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const lowestPrice = estimate
    ? Math.min(...estimate.options.map((option) => option.estimated_price))
    : null;

  return (
    <section id="calculator" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-heading font-bold text-slate-900 mb-6">
              Get an Instant Rate Estimate
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              See how much you can save with Parcego. No signup required.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm text-brand-600">
                  <Box />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Any Package Type</h4>
                  <p className="text-sm text-slate-500">From envelopes to pallets, we handle it all with care.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm text-violet-600">
                  <Layers />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Zone-Based Pricing</h4>
                  <p className="text-sm text-slate-500">
                    Downtown Toronto deliveries get flat next-day and 2–3 day rates. {SERVICE_AREA_LABEL_SHORT} (outside downtown) use size and weight pricing.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-8 border border-slate-100 relative"
          >
            <form onSubmit={handleCalculate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">From (Postal Code)</label>
                  <input
                    type="text"
                    value={origin}
                    onChange={e => setOrigin(e.target.value)}
                    placeholder="M5V 3A8"
                    className="w-full rounded-xl border-slate-200 focus:border-brand-500 focus:ring-brand-500 bg-slate-50 p-3 font-medium transition-shadow focus:shadow-md outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">To (Postal Code)</label>
                  <input
                    type="text"
                    value={dest}
                    onChange={handleDestChange}
                    placeholder="L4W 5J8"
                    className={`w-full rounded-xl border bg-slate-50 p-3 font-medium transition-shadow focus:shadow-md outline-none ${
                      destError ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500'
                    }`}
                  />
                  <AnimatePresence>
                    {destError && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-red-500 text-xs mt-1 flex items-center gap-1 font-medium"
                      >
                        <AlertCircle size={12} /> {destError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative" ref={packageRef}>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Package Type</label>
                  <button
                    type="button"
                    onClick={() => setIsPackageOpen(!isPackageOpen)}
                    className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 font-medium text-slate-900 transition-all hover:bg-slate-100 focus:shadow-md focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                  >
                    <span>{packageType}</span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isPackageOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isPackageOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 mt-1 w-full rounded-xl border border-slate-100 bg-white shadow-lg shadow-slate-200/50 p-1 overflow-hidden"
                      >
                        {packageOptions.map((option) => (
                          <div
                            key={option}
                            onClick={() => { setPackageType(option); setIsPackageOpen(false); }}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors ${
                              packageType === option
                                ? 'bg-brand-50 text-brand-700 font-medium'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            {option}
                            {packageType === option && <Check size={14} className="text-brand-600" />}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Weight (kg)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={weight}
                    onChange={handleWeightChange}
                    placeholder="2.5"
                    className={`w-full rounded-xl border bg-slate-50 p-3 font-medium transition-shadow focus:shadow-md outline-none ${
                      weightError ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500'
                    }`}
                  />
                  <AnimatePresence>
                    {weightError && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-red-500 text-xs mt-1 flex items-center gap-1 font-medium"
                      >
                        <AlertCircle size={12} /> {weightError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <LandingButton type="submit" className="w-full mt-4" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    Calculating...
                  </span>
                ) : (
                  hasCalculated ? 'Update Estimate' : 'Get Estimate'
                )}
              </LandingButton>
            </form>

            <AnimatePresence mode="wait">
              {apiError && !isLoading && (
                <motion.div
                  key="api-error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
                  role="alert"
                >
                  <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={18} />
                  <p className="text-red-700 text-sm font-medium leading-relaxed">{apiError}</p>
                </motion.div>
              )}
              {estimate && !isLoading && !apiError && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="mt-8 bg-brand-50 border border-brand-200 rounded-2xl p-6 shadow-[0_8px_30px_rgb(14,165,233,0.15)] relative overflow-hidden"
                  aria-live="polite"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-100 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none opacity-60" />

                  {estimate.inSpecialZone && estimate.options.length > 1 ? (
                    <div className="relative z-10 space-y-4">
                      <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                          Downtown Zone Rates
                        </p>
                        <p className="text-sm text-brand-800">
                          Flat rates from ${lowestPrice?.toFixed(2)} before tax
                        </p>
                      </div>
                      {estimate.options.map((option) => (
                        <div
                          key={option.delivery_speed}
                          className="flex justify-between items-center py-3 border-b border-brand-200/60 last:border-0"
                        >
                          <div>
                            <p className="font-semibold text-slate-900">
                              {getDeliverySpeedLabel(option.delivery_speed)}
                            </p>
                            <p className="text-xs text-slate-600">{option.eta}</p>
                          </div>
                          <p className="text-2xl font-bold text-brand-600">
                            ${option.estimated_price.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-between items-end mb-6 relative z-10">
                      <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Estimated Cost</p>
                        <p className="text-5xl font-bold text-brand-600 tracking-tight leading-none">
                          ${estimate.options[0]?.estimated_price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right pb-1">
                        <p className="text-brand-600 font-bold text-sm uppercase tracking-wide">Parcego</p>
                        <p className="text-sm text-slate-600 leading-tight mt-1">Size &amp; weight pricing</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-brand-200/60 relative z-10 mt-4">
                    <p className="text-slate-500 text-xs flex justify-between">
                      <span>Based on {weight}kg {packageType} to {estimate.destinationPostalCode}</span>
                      <span className="italic">Taxes calculated at checkout</span>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LandingRateCalculator;
