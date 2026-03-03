import { Inter, Outfit } from 'next/font/google';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

const inter = Inter({ subsets: ['latin'] });
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['500', '600', '700', '800'],
});

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      id="parcego-merchant-landing-container"
      className={`${inter.className} ${outfit.variable} min-h-screen bg-slate-50 selection:bg-brand-200 selection:text-brand-900`}
    >
      <LandingHeader />
      <main>{children}</main>
      <LandingFooter />
    </div>
  );
}
