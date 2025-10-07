'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MerchantLandingPage = () => {
  const [rateEstimate, setRateEstimate] = React.useState<{
    cost: number;
    deliveryTime: string;
  } | null>(null);

  const handleGetEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    setRateEstimate({
      cost: 12.99,
      deliveryTime: '2-3 business days',
    });
  };

  return (
    <>
      {/* Hero Section */}
      <section id="parcego-hero-section" className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              Affordable Courier Services
              <span className="block text-[#155dfc] mt-2">Built for Small Businesses</span>
            </h1>
            <p className="mt-8 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Ship smarter with transparent pricing, real-time tracking, and seamless integrations. 
              No hidden fees, no surprises—just reliable delivery at prices you can afford.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/login">
                <Button id="parcego-hero-cta-primary" size="lg" className="text-base px-8 bg-[#155dfc] hover:bg-[#1250e0] text-white">
                  Get Started Free
                </Button>
              </Link>
              <Button id="parcego-hero-cta-secondary" variant="outline" size="lg" className="text-base border-[#155dfc] text-[#155dfc] hover:bg-[#155dfc]/10">
                See How It Works
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              No credit card required • Free account setup • Cancel anytime
            </p>
          </div>
        </div>
        
        {/* Background Decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl" aria-hidden="true">
            <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#155dfc]/20 to-[#155dfc]/10 opacity-30" />
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section id="parcego-features-section" className="py-20 sm:py-28 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything You Need to Ship with Confidence
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Powerful features designed specifically for small businesses and growing merchants.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card id="parcego-feature-card-pricing" className="border-2 hover:border-[#155dfc]/50 transition-colors">
              <CardHeader>
                <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-[#155dfc]/10 p-3">
                  <span className="lucide-icon-dollar-sign" data-icon="dollar-sign" aria-hidden="true">
                    <svg className="h-6 w-6 text-[#155dfc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                </div>
                <CardTitle>Transparent Pricing</CardTitle>
                <CardDescription>
                  No hidden fees or surprises. Get real-time quotes and pay only for what you ship. Up to 40% cheaper than major carriers.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card id="parcego-feature-card-tracking" className="border-2 hover:border-[#155dfc]/50 transition-colors">
              <CardHeader>
                <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-[#155dfc]/10 p-3">
                  <span className="lucide-icon-map-pin" data-icon="map-pin" aria-hidden="true">
                    <svg className="h-6 w-6 text-[#155dfc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                </div>
                <CardTitle>Real-Time Tracking</CardTitle>
                <CardDescription>
                  Track every package in real-time with GPS updates. Share tracking links with customers and get delivery proof instantly.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card id="parcego-feature-card-integration" className="border-2 hover:border-[#155dfc]/50 transition-colors">
              <CardHeader>
                <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-[#155dfc]/10 p-3">
                  <span className="lucide-icon-zap" data-icon="zap" aria-hidden="true">
                    <svg className="h-6 w-6 text-[#155dfc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </span>
                </div>
                <CardTitle>Easy Integration</CardTitle>
                <CardDescription>
                  Connect with your e-commerce platform in minutes. Supports major platforms with automatic order syncing and fulfillment.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card id="parcego-feature-card-support" className="border-2 hover:border-[#155dfc]/50 transition-colors">
              <CardHeader>
                <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-[#155dfc]/10 p-3">
                  <span className="lucide-icon-headphones" data-icon="headphones" aria-hidden="true">
                    <svg className="h-6 w-6 text-[#155dfc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </span>
                </div>
                <CardTitle>Dedicated Support</CardTitle>
                <CardDescription>
                  Get help when you need it. Our support team is here to ensure your shipments arrive on time, every time.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="parcego-how-it-works-section" className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ship in 3 Simple Steps
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              From label creation to delivery confirmation, we make shipping effortless.
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-3">
            <div id="parcego-step-1" className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#155dfc] text-2xl font-bold text-white">
                1
              </div>
              <h3 className="mb-3 text-xl font-semibold text-foreground">Create Your Shipment</h3>
              <p className="text-muted-foreground leading-relaxed">
                Enter package details, get an instant quote, and purchase your shipping label—all in under 2 minutes.
              </p>
            </div>

            <div id="parcego-step-2" className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#155dfc] text-2xl font-bold text-white">
                2
              </div>
              <h3 className="mb-3 text-xl font-semibold text-foreground">Drop Off Your Package</h3>
              <p className="text-muted-foreground leading-relaxed">
                Find a convenient drop-off location near you. Our couriers scan and pick up your package the same day.
              </p>
            </div>

            <div id="parcego-step-3" className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#155dfc] text-2xl font-bold text-white">
                3
              </div>
              <h3 className="mb-3 text-xl font-semibold text-foreground">Track & Deliver</h3>
              <p className="text-muted-foreground leading-relaxed">
                Watch your package move in real-time. Get photo proof of delivery the moment it arrives at your customer's door.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rate Calculator */}
      <section id="parcego-rate-calculator-section" className="py-20 sm:py-28 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Get an Instant Rate Estimate
              </h2>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                See how much you can save with Parcego. No signup required.
              </p>
            </div>

            <Card id="parcego-rate-calculator-card">
              <CardContent className="pt-6">
                <form onSubmit={handleGetEstimate} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="from-location">From (Postal Code)</Label>
                      <Input
                        id="from-location"
                        placeholder="M5V 3A8"
                        defaultValue="M5V 3A8"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="to-location">To (Postal Code)</Label>
                      <Input
                        id="to-location"
                        placeholder="L4W 5J8"
                        defaultValue="L4W 5J8"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="package-type">Package Type</Label>
                      <Select defaultValue="box">
                        <SelectTrigger id="package-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="box">Box</SelectItem>
                          <SelectItem value="envelope">Envelope</SelectItem>
                          <SelectItem value="pallet">Pallet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        placeholder="2.5"
                        defaultValue="2.5"
                        step="0.1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service-type">Service</Label>
                      <Select defaultValue="standard">
                        <SelectTrigger id="service-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="express">Express</SelectItem>
                          <SelectItem value="same-day">Same Day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-[#155dfc] hover:bg-[#1250e0] text-white" size="lg">
                    Get Estimate
                  </Button>
                </form>

                {rateEstimate && (
                  <div className="mt-6 rounded-lg bg-[#155dfc]/10 p-6 border-2 border-[#155dfc]/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Estimated Cost</p>
                        <p className="text-3xl font-bold text-[#155dfc]">${rateEstimate.cost}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Delivery Time</p>
                        <p className="text-lg font-semibold text-foreground">{rateEstimate.deliveryTime}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">
                      This is an estimate. Final cost calculated at checkout.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="parcego-testimonials-section" className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Trusted by Growing Businesses
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              See what merchants are saying about Parcego.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <Card id="parcego-testimonial-1">
              <CardContent className="pt-6">
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="lucide-icon-star" data-icon="star">
                      <svg className="h-5 w-5 fill-[#155dfc] text-[#155dfc]" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </span>
                  ))}
                </div>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  "Parcego cut our shipping costs by 35% while improving delivery times. The real-time tracking keeps our customers happy and informed."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#155dfc]/10 flex items-center justify-center font-semibold text-[#155dfc]">
                    SM
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Sarah Mitchell</p>
                    <p className="text-sm text-muted-foreground">Owner, Artisan Crafts Co.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card id="parcego-testimonial-2">
              <CardContent className="pt-6">
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="lucide-icon-star" data-icon="star">
                      <svg className="h-5 w-5 fill-[#155dfc] text-[#155dfc]" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </span>
                  ))}
                </div>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  "The integration with our online store was seamless. We now ship 200+ orders per week without any hassle. Best decision for our business."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#155dfc]/10 flex items-center justify-center font-semibold text-[#155dfc]">
                    JC
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">James Chen</p>
                    <p className="text-sm text-muted-foreground">Co-Founder, TechGear Plus</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card id="parcego-testimonial-3">
              <CardContent className="pt-6">
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="lucide-icon-star" data-icon="star">
                      <svg className="h-5 w-5 fill-[#155dfc] text-[#155dfc]" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </span>
                  ))}
                </div>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  "Finally, a courier service that understands small businesses. Transparent pricing, fast delivery, and amazing support. Highly recommend!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#155dfc]/10 flex items-center justify-center font-semibold text-[#155dfc]">
                    EP
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Emily Parker</p>
                    <p className="text-sm text-muted-foreground">Founder, Green Beauty Box</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section id="parcego-comparison-section" className="py-20 sm:py-28 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Why Choose Parcego?
              </h2>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                See how we compare to traditional courier services.
              </p>
            </div>

            <div className="overflow-hidden rounded-lg border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Feature</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-[#155dfc]">Parcego</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-muted-foreground">Others</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="px-6 py-4 text-sm text-foreground">Transparent Pricing</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#155dfc]/10 text-[#155dfc]">
                          ✓
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
                          ✗
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-foreground">Real-Time GPS Tracking</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#155dfc]/10 text-[#155dfc]">
                          ✓
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-muted-foreground">Limited</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-foreground">Photo Proof of Delivery</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#155dfc]/10 text-[#155dfc]">
                          ✓
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
                          ✗
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-foreground">Easy Integration</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#155dfc]/10 text-[#155dfc]">
                          ✓
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-muted-foreground">Complex</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-foreground">24/7 Support</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#155dfc]/10 text-[#155dfc]">
                          ✓
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-muted-foreground">Business Hours</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="parcego-final-cta-section" className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="relative isolate overflow-hidden rounded-3xl bg-[#155dfc] px-6 py-20 text-center shadow-2xl sm:px-16">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Transform Your Shipping?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-white/90">
              Join thousands of merchants who trust Parcego for their courier needs. 
              Start shipping smarter today—no credit card required.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/login">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-[#155dfc] hover:bg-white/90"
                >
                  Get Started Free
                </Button>
              </Link>
              <Link href="/support" className="text-sm font-semibold leading-6 text-white hover:text-white/80 transition-colors">
                Contact Sales <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default MerchantLandingPage;

