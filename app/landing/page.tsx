import LandingHero from '@/components/landing/LandingHero';
import LandingFeatures from '@/components/landing/LandingFeatures';
import LandingSteps from '@/components/landing/LandingSteps';
import LandingRateCalculator from '@/components/landing/LandingRateCalculator';
import LandingTestimonials from '@/components/landing/LandingTestimonials';
import LandingComparisonTable from '@/components/landing/LandingComparisonTable';
import LandingCTA from '@/components/landing/LandingCTA';

const LandingPage = () => {
  return (
    <>
      <LandingHero />
      <LandingFeatures />
      <LandingSteps />
      <LandingRateCalculator />
      <LandingTestimonials />
      <LandingComparisonTable />
      <LandingCTA />
    </>
  );
};

export default LandingPage;
