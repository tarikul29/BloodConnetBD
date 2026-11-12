'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import RequestModal from '@/components/RequestModal';
import Footer from '@/components/Footer';
import { Ticker, HowItWorks, PhotoFeature, Eligibility, FinalCTA } from '@/components/HomeSections';

export default function HomePage() {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Header />
      
      <main className="flex-1">
        <Hero onEmergencyClick={() => setModalOpen(true)} />
        <Ticker />
        <HowItWorks />
        <PhotoFeature />
        <Eligibility />
        <FinalCTA />
        <RequestModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            // TODO: toast + redirect
          }}
        />
      </main>

      <Footer />
    </div>
  );
}