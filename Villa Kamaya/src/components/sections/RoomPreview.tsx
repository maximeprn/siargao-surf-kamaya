'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap, { scrollReveal } from '@/lib/gsap';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';

const RoomPreview = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Scroll reveal animations
      scrollReveal(imageRef.current, {
        x: -60,
        opacity: 0,
        duration: 1.2,
      });

      scrollReveal(contentRef.current, {
        x: 60,
        opacity: 0,
        duration: 1.2,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="pt-6 pb-12" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div ref={imageRef} className="relative">
            <div className="aspect-[4/3] relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
              <div className="absolute inset-0 bg-slate-300 flex items-center justify-center">
                <span className="text-slate-500 text-lg">Villa Image Placeholder</span>
              </div>
            </div>
            
            {/* Floating card */}
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-xl border">
              <div className="flex items-center space-x-3">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-slate-600 font-medium">5.0 Rating</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div ref={contentRef} className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold text-slate-800 mb-4">
                Your Perfect
                <span className="block text-blue-600">Tropical Retreat</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Discover a beautifully designed space that seamlessly blends modern luxury 
                with tropical charm. Our villa features spacious accommodations, premium 
                amenities, and breathtaking views that create the perfect backdrop for 
                your island getaway.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11v3" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Premium Room</p>
                  <p className="text-sm text-slate-600">Luxury accommodation</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Free WiFi</p>
                  <p className="text-sm text-slate-600">High-speed internet</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">AC & Climate</p>
                  <p className="text-sm text-slate-600">Perfect temperature</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Host Support</p>
                  <p className="text-sm text-slate-600">24/7 assistance</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg">View Details</Button>
              <Button variant="outline" size="lg">Check Availability</Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default RoomPreview;