'use client';

import { useEffect, useRef } from 'react';
import gsap, { scrollReveal } from '@/lib/gsap';

const VillaDescription = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {

    const ctx = gsap.context(() => {
      // Scroll reveal animations
      scrollReveal(textRef.current, {
        x: -60,
        opacity: 0,
        duration: 1.2,
      });

      scrollReveal(imageRef.current, {
        x: 60,
        opacity: 0,
        duration: 1.2,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="villa-section-padding"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="villa-container">
        <div className="villa-grid">
          {/* Image - Show first on mobile, second on desktop */}
          <div ref={imageRef} className="relative order-1 lg:order-2">
            <div className="aspect-[1/1] relative rounded-lg overflow-hidden">
              <img
                src="/assets/images/room/room-section-1.webp"
                alt="Villa Kamaya - Modern Tropical Design"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </div>
          </div>

          {/* Text Content - Show second on mobile, first on desktop */}
          <div ref={textRef} className="space-y-6 order-2 lg:order-1 mt-8 lg:mt-0">
            <h2 
              className="text-2xl md:text-4xl lg:text-5xl font-bold mb-6"
              style={{
                fontFamily: 'Analogue, serif',
                color: 'var(--text-primary)',
                lineHeight: 1.2
              }}
            >
              Thoughtfully Designed for Island Living
            </h2>
            
            <div className="space-y-4">
              <p
                className="leading-relaxed text-sm md:text-base"
                style={{
                  fontFamily: 'var(--font-montserrat)',
                  lineHeight: 1.7,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em'
                }}
              >
                This 60sqm modern tropical villa seamlessly blends contemporary comfort with Siargao's natural beauty. Wake to birdsong and ocean breezes, work remotely with high-speed Starlink WiFi, and end your day with a sunset dip in your private infinity pool. Perfect for couples, digital nomads, or solo travelers seeking a peaceful base to explore Siargao's world-class waves, island-hopping adventures, and vibrant local culture.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VillaDescription;