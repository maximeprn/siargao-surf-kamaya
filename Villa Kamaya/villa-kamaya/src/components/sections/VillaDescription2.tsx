'use client';

import { useEffect, useRef } from 'react';
import gsap, { scrollReveal } from '@/lib/gsap';

const VillaDescription2 = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Scroll reveal animations
      scrollReveal(textRef.current, {
        x: 60,
        opacity: 0,
        duration: 1.2,
      });

      scrollReveal(imageRef.current, {
        x: -60,
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
          {/* Image - Show first on mobile, first on desktop */}
          <div ref={imageRef} className="relative order-1 lg:order-1">
            <div className="aspect-[1/1] relative rounded-lg overflow-hidden">
              <img
                src="/assets/images/villa/vignette-landing-2 copy.webp"
                alt="Villa Kamaya - Private Infinity Pool & Outdoor Living"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </div>
          </div>

          {/* Text Content - Show second on mobile, second on desktop */}
          <div ref={textRef} className="space-y-6 order-2 lg:order-2 mt-8 lg:mt-0">
            <h2 
              className="text-2xl md:text-4xl lg:text-5xl font-bold mb-6"
              style={{
                fontFamily: 'Analogue, serif',
                color: 'var(--text-primary)',
                lineHeight: 1.2
              }}
            >
              Private Infinity Pool & Outdoor Living
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
                Dive into luxury with your private infinity pool that seamlessly blends with the horizon. The outdoor terrace features comfortable lounging areas, perfect for morning coffee or sunset cocktails. Experience the ultimate in tropical relaxation with panoramic views of Siargao's pristine landscape and azure waters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VillaDescription2;