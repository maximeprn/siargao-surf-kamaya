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
      // Calculate cascade spacing to fill screen height
      const screenHeight = window.innerHeight;
      const boxHeight = 120; // Further reduced due to smaller icons and text
      const topPadding = 128; // pt-32
      const availableHeight = screenHeight - topPadding - boxHeight;
      const cascadeSpacing = availableHeight / 8; // Reduced spacing by half for tighter cascade

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
          start: "top top", // Start when section reaches top
          end: "+=300vh", // Extended to account for image scroll animation
          scrub: 0.5, // Smooth linear scroll
          pin: true, // Pin to control the image movement
        }
      });

      // Set initial position for image section - maintain padding with box 4
      if (imageRef.current) {
        const box4Offset = 3 * cascadeSpacing; // Position of box 4
        const imagePadding = 48; // Same as pb-12 (48px) used between other sections
        gsap.set(imageRef.current, {
          y: box4Offset + imagePadding, // Position relative to box 4
          opacity: 1
        });
      }

      // Clean animation: Each box stops when it reaches final position
      // Image moves with box 4 throughout
      
      // Step 1: Box 1 stops, others continue
      tl.to(boxRefs.current[0], { y: 0, duration: 1, ease: "none" }, 0);
      tl.to(boxRefs.current[1], { y: 0, duration: 1, ease: "none" }, 0);
      tl.to(boxRefs.current[2], { y: cascadeSpacing, duration: 1, ease: "none" }, 0);
      
      // Box 4 and image move together as a unit
      tl.to([boxRefs.current[3], imageRef.current], { 
        y: index => index === 0 ? 2 * cascadeSpacing : 2 * cascadeSpacing + 48,
        duration: 1, 
        ease: "none" 
      }, 0);

      // Step 2: Box 2 stops, others continue
      tl.to(boxRefs.current[2], { y: 0, duration: 1, ease: "none" }, 1);
      
      // Box 4 and image continue moving together
      tl.to([boxRefs.current[3], imageRef.current], { 
        y: index => index === 0 ? cascadeSpacing : cascadeSpacing + 48,
        duration: 1, 
        ease: "none" 
      }, 1);

      // Step 3: Box 3 stops, box 4 and image move together to final position
      tl.to([boxRefs.current[3], imageRef.current], { 
        y: index => index === 0 ? 0 : 48,
        duration: 1, 
        ease: "none" 
      }, 2);


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
      className="relative w-full"
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
        </div>
      </div>
    </section>
  </div>
  );
};

export default AmenitiesShowcase;