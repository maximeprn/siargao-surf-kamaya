'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap, { scrollReveal } from '@/lib/gsap';

const BookingCallout = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Scroll reveal animations
      scrollReveal(logoRef.current, {
        y: 30,
        opacity: 0,
        duration: 1,
      });

      scrollReveal(textRef.current, {
        y: 40,
        opacity: 0,
        duration: 1.2,
        delay: 0.2,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="booking-section-padding"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="booking-container">
        {/* Logo */}
        <div ref={logoRef} className="mb-16 flex justify-center">
          <Image
            src="/assets/logos/logo-shape.svg"
            alt="Kamaya Villa"
            width={24}
            height={24}
            className="h-6 w-auto"
          />
        </div>

        {/* Text */}
        <p
          ref={textRef}
          className="text-center leading-relaxed max-w-3xl mx-auto text-lg md:text-lg lg:text-xl"
          style={{
            fontFamily: 'var(--font-montserrat)',
            lineHeight: 1.7,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em'
          }}
        >
          Ready to experience this slice of heaven? Book your stay at Kamaya Villa today and step into a world where every moment is a treasure waiting to be discovered. Don't just dream about paradise, live it!
        </p>
      </div>
    </section>
  );
};

export default BookingCallout;