'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from '@/lib/gsap';

const BookingCallout = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animation du logo slide in depuis la droite
      if (logoRef.current) {
        gsap.set(logoRef.current, {
          x: 200,
          opacity: 0
        });

        gsap.to(logoRef.current, {
          x: 0,
          opacity: 1,
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            end: "top 30%",
            scrub: 1
          }
        });
      }

      // Animation lettre par lettre
      if (textRef.current) {
        // Fonction récursive pour wrapper chaque caractère en préservant la structure
        const wrapTextNodes = (element: Node): void => {
          if (element.nodeType === Node.TEXT_NODE) {
            const text = element.textContent || '';
            if (text.trim()) {
              const wrappedChars = text.split('').map(char => {
                if (char === ' ') {
                  return ' '; // Préserver les espaces
                } else if (char === '\n') {
                  return '\n'; // Préserver les retours à la ligne
                }
                return `<span style="color: rgba(29, 34, 58, 0.3);">${char}</span>`;
              }).join('');
              
              const wrapper = document.createElement('span');
              wrapper.innerHTML = wrappedChars;
              element.parentNode?.replaceChild(wrapper, element);
            }
          } else {
            Array.from(element.childNodes).forEach(child => wrapTextNodes(child));
          }
        };
        
        wrapTextNodes(textRef.current);
        
        const charElements = textRef.current.querySelectorAll('span span');
        
        // Animation progressive des lettres au scroll
        gsap.timeline({
          scrollTrigger: {
            trigger: textRef.current,
            start: "top 80%",
            end: "bottom 40%",
            scrub: 1,
            onUpdate: (self) => {
              const progress = self.progress;
              const totalChars = charElements.length;
              const currentCharIndex = Math.floor(progress * totalChars);
              
              charElements.forEach((char, index) => {
                if (index <= currentCharIndex) {
                  gsap.set(char, { color: 'var(--text-primary)' });
                } else {
                  gsap.set(char, { color: 'rgba(29, 34, 58, 0.3)' });
                }
              });
            }
          }
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="booking-section-padding"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="villa-container">
        <div className="flex flex-col md:grid md:grid-cols-2 gap-16 md:gap-8 items-center">
          {/* Logo - premier sur mobile, deuxième sur desktop */}
          <div className="flex justify-center items-center order-1 md:order-2">
            <div ref={logoRef}>
              <Image
                src="/assets/logos/logo-shape.svg"
                alt="Kamaya Villa"
                width={80}
                height={80}
                className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24"
              />
            </div>
          </div>

          {/* Text - deuxième sur mobile, premier sur desktop */}
          <div className="order-2 md:order-1">
            <p
              ref={textRef}
              className="text-3xl md:text-4xl leading-tight text-left max-w-[620px]"
              style={{
                fontFamily: 'Analogue, serif',
                lineHeight: 1,
                letterSpacing: '-0.01em'
              }}
            >
              Ready to experience this slice of heaven? <span className="icon-Vector"></span> Book your stay at Kamaya Villa today and step into a world where every moment is a treasure waiting to be discovered. Don't just dream about paradise, live it!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingCallout;