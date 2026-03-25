import React from 'react';
import Hero from '../components/home/Hero';
import InteractiveHighlights from '../components/home/InteractiveHighlights';
import InnovationLab from '../components/home/InnovationLab';
import Services from '../components/home/Services';
import News from '../components/home/News';
import Testimonials from '../components/home/Testimonials';
import Pricing from '../components/home/Pricing';
import FAQ from '../components/home/FAQ';
import CTA from '../components/home/CTA';
import Constitution from '../components/home/Constitution';

export default function Home() {
  return (
    <div className="font-sans antialiased overflow-x-hidden">
      <Hero />
      <InteractiveHighlights />
      <InnovationLab />
      <Services />
      <Constitution />
      <Pricing />
      <News />
      <Testimonials />
      <FAQ />
      <CTA />
    </div>
  );
}
