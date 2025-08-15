'use client';

import { useState, useEffect } from 'react';
import Hero from '@/components/sections/Hero';
import BookingCallout from '@/components/sections/BookingCallout';
import VillaDescription from '@/components/sections/VillaDescription';
import VillaDescription2 from '@/components/sections/VillaDescription2';
import AmenitiesShowcase from '@/components/sections/AmenitiesShowcase';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Footer from '@/components/layout/Footer';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <>
      <div>
        <Hero />
        <BookingCallout />
        <VillaDescription2 />
        <VillaDescription />
        <AmenitiesShowcase />
        {/* Section vide pour espacement */}
        <section className="py-16 lg:py-24" style={{ backgroundColor: 'var(--bg-primary)' }}></section>
      </div>
      <Footer />
    </>
  );
}
