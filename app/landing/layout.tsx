'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div id="parcego-merchant-landing-container" className="min-h-screen bg-background flex flex-col">
      {/* Navigation Header */}
      <header id="parcego-landing-header" className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center gap-2">
            <Link href="/landing">
              <Image
                src="/Logo/Master-logo.svg"
                alt="Parcego Logo"
                width={180}
                height={52}
                className="h-12 w-auto"
                priority
              />
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/landing#features" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/landing#how-it-works" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link href="/landing#pricing" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-[#155dfc] hover:bg-[#1250e0] text-white">
                Get Started Free
              </Button>
            </Link>
          </nav>
          <div className="md:hidden">
            <Link href="/login">
              <Button size="sm" className="bg-[#155dfc] hover:bg-[#1250e0] text-white">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer id="parcego-landing-footer" className="border-t bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Image
                src="/Logo/Master-logo.svg"
                alt="Parcego Logo"
                width={160}
                height={46}
                className="h-10 w-auto mb-4"
              />
              <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                Affordable, transparent courier services built for small businesses. 
                Ship smarter with real-time tracking and seamless integrations.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold text-foreground">Company</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/support" className="text-muted-foreground hover:text-foreground transition-colors">
                    Support
                  </Link>
                </li>
                <li>
                  <Link href="/landing/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/landing/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold text-foreground">Quick Links</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/track-package" className="text-muted-foreground hover:text-foreground transition-colors">
                    Track Package
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-muted-foreground hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Parcego. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
