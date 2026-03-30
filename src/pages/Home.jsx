import React from 'react';
import Hero from '../components/home/Hero';
import InteractiveHighlights from '../components/home/InteractiveHighlights';
import Services from '../components/home/Services';
import News from '../components/home/News';
import Pricing from '../components/home/Pricing';
import FAQ from '../components/home/FAQ';
import CTA from '../components/home/CTA';
import Constitution from '../components/home/Constitution';

export default function Home() {
  return (
    <div className="font-sans antialiased overflow-x-hidden bg-[var(--color-surface-50)] dark:bg-[var(--color-surface-900)]">
      <Hero />
      <InteractiveHighlights />
      <Services />
      <Constitution />
      <Pricing />
      <News />
      <FAQ />
      <CTA />
    </div>
  );
}
