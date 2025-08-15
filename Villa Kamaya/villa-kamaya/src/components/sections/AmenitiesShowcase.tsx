'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from '@/lib/gsap';

const AmenitiesShowcase = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const boxRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRef = useRef<HTMLDivElement>(null);

  const amenities = [
    {
      icon: '/assets/logos/pool-icon.svg',
      title: 'Private pool'
    },
    {
      icon: '/assets/logos/garden-icon.svg',
      title: 'Private lush garden'
    },
    {
      icon: '/assets/logos/beach-icon.svg',
      title: 'Few Steps from beach'
    },
    {
      icon: '/assets/logos/wave-icon.svg',
      title: 'Home Surf Spot'
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768;
      
      if (isMobile) {
        // Mobile: Simple 2x2 grid layout - no cascade animation
        boxRefs.current.forEach((box, index) => {
          if (box) {
            gsap.set(box, {
              y: 0,
              opacity: 1
            });
          }
        });

        // Mobile: Don't animate image position, let CSS handle spacing

        // Simple fade-in animation for mobile
        gsap.fromTo(boxRefs.current, 
          { opacity: 0, y: 20 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.8, 
            stagger: 0.2,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse"
            }
          }
        );
      } else {
        // Desktop: Keep the original cascade animation
        const screenHeight = window.innerHeight;
        const boxHeight = 120;
        const topPadding = 128;
        const availableHeight = screenHeight - topPadding - boxHeight;
        const cascadeSpacing = availableHeight / 8;

        // Set initial cascade positions for the 4 boxes
        boxRefs.current.forEach((box, index) => {
          if (box) {
            const initialOffset = index * cascadeSpacing;
            gsap.set(box, {
              y: initialOffset,
              opacity: 1
            });
          }
        });

        // Create timeline with pinning to control the image scroll
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=300vh",
            scrub: 0.5,
            pin: true,
          }
        });

        // Set initial position for image section
        if (imageRef.current) {
          const box4Offset = 3 * cascadeSpacing;
          const imagePadding = 48;
          gsap.set(imageRef.current, {
            y: box4Offset + imagePadding,
            opacity: 1
          });
        }

        // Original cascade animation for desktop
        tl.to(boxRefs.current[0], { y: 0, duration: 1, ease: "none" }, 0);
        tl.to(boxRefs.current[1], { y: 0, duration: 1, ease: "none" }, 0);
        tl.to(boxRefs.current[2], { y: cascadeSpacing, duration: 1, ease: "none" }, 0);
        
        tl.to([boxRefs.current[3], imageRef.current], { 
          y: index => index === 0 ? 2 * cascadeSpacing : 2 * cascadeSpacing + 48,
          duration: 1, 
          ease: "none" 
        }, 0);

        tl.to(boxRefs.current[2], { y: 0, duration: 1, ease: "none" }, 1);
        
        tl.to([boxRefs.current[3], imageRef.current], { 
          y: index => index === 0 ? cascadeSpacing : cascadeSpacing + 48,
          duration: 1, 
          ease: "none" 
        }, 1);

        tl.to([boxRefs.current[3], imageRef.current], { 
          y: index => index === 0 ? 0 : 48,
          duration: 1, 
          ease: "none" 
        }, 2);
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="relative" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Amenities boxes section */}
      <section 
        className="amenities-section-padding"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <div className="villa-container">
          <div className="amenities-grid">
            {amenities.map((amenity, index) => (
            <div 
              key={index} 
              ref={(el) => {
                if (el) boxRefs.current[index] = el;
              }}
              className="relative"
            >
              {/* Box 1: Left line + content */}
              {index === 0 && (
                <>
                  {/* Left dotted line for box 1 */}
                  <div 
                    className="absolute top-0 -left-4 lg:-left-6 w-px h-full transform hidden lg:block"
                    style={{
                      borderLeft: '1px dashed var(--text-primary)',
                      opacity: 1
                    }}
                  />
                  <div className="text-center space-y-8">
                    <div className="flex justify-center">
                      <Image
                        src={amenity.icon}
                        alt={amenity.title}
                        width={70}
                        height={70}
                        className="w-12 h-12 md:w-14 md:h-14"
                      />
                    </div>
                    <h3
                      className="text-amenity"
                    >
                      {amenity.title}
                    </h3>
                  </div>
                </>
              )}

              {/* Box 2: Right line from box 1 + content */}
              {index === 1 && (
                <>
                  {/* Right line from box 1 */}
                  <div 
                    className="absolute top-0 -left-4 lg:-left-6 w-px h-full transform hidden lg:block"
                    style={{
                      borderLeft: '1px dashed var(--text-primary)',
                      opacity: 1
                    }}
                  />
                  <div className="text-center space-y-8">
                    <div className="flex justify-center">
                      <Image
                        src={amenity.icon}
                        alt={amenity.title}
                        width={70}
                        height={70}
                        className="w-12 h-12 md:w-14 md:h-14"
                      />
                    </div>
                    <h3
                      className="text-amenity"
                    >
                      {amenity.title}
                    </h3>
                  </div>
                </>
              )}

              {/* Box 3: Right line from box 2 + content */}
              {index === 2 && (
                <>
                  {/* Right line from box 2 */}
                  <div 
                    className="absolute top-0 -left-4 lg:-left-6 w-px h-full transform hidden lg:block"
                    style={{
                      borderLeft: '1px dashed var(--text-primary)',
                      opacity: 1
                    }}
                  />
                  <div className="text-center space-y-8">
                    <div className="flex justify-center">
                      <Image
                        src={amenity.icon}
                        alt={amenity.title}
                        width={70}
                        height={70}
                        className="w-12 h-12 md:w-14 md:h-14"
                      />
                    </div>
                    <h3
                      className="text-amenity"
                    >
                      {amenity.title}
                    </h3>
                  </div>
                </>
              )}

              {/* Box 4: Right line from box 3 + content */}
              {index === 3 && (
                <>
                  {/* Right line from box 3 */}
                  <div 
                    className="absolute top-0 -left-4 lg:-left-6 w-px h-full transform hidden lg:block"
                    style={{
                      borderLeft: '1px dashed var(--text-primary)',
                      opacity: 1
                    }}
                  />
                  <div className="text-center space-y-8">
                    <div className="flex justify-center">
                      <Image
                        src={amenity.icon}
                        alt={amenity.title}
                        width={70}
                        height={70}
                        className="w-12 h-12 md:w-14 md:h-14"
                      />
                    </div>
                    <h3
                      className="text-amenity"
                    >
                      {amenity.title}
                    </h3>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Full-screen image section - acts like a regular next section */}
    <section 
      ref={imageRef}
      className="relative w-full amenities-image-section"
      style={{ backgroundColor: 'var(--bg-primary)', opacity: 1 }}
    >
      <div className="villa-container">
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg">
        <Image
          src="/assets/images/hero/hero-image-villa-frontwebp.webp"
          alt="Villa Kamaya"
          fill
          className="object-cover"
          priority
        />
        {/* Calque sombre */}
        <div className="absolute inset-0 bg-black/15"></div>
        </div>
      </div>
    </section>
  </div>
  );
};

export default AmenitiesShowcase;