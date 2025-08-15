'use client';

import { useEffect, useRef } from 'react';
import gsap, { scrollReveal } from '@/lib/gsap';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';

const Location = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const attractionsRef = useRef<HTMLDivElement>(null);

  const attractions = [
    {
      name: 'Cloud 9 Surfing',
      distance: '5 min drive',
      description: 'World-famous surf break'
    },
    {
      name: 'Magpupungko Rock Pools',
      distance: '15 min drive',
      description: 'Natural tidal pools'
    },
    {
      name: 'Sugba Lagoon',
      distance: '20 min drive',
      description: 'Crystal clear lagoon'
    },
    {
      name: 'General Luna Town',
      distance: '3 min walk',
      description: 'Restaurants & nightlife'
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      scrollReveal(contentRef.current, {
        x: -60,
        opacity: 0,
        duration: 1.2,
      });

      scrollReveal(mapRef.current, {
        x: 60,
        opacity: 0,
        duration: 1.2,
      });

      scrollReveal(attractionsRef.current);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Content */}
          <div ref={contentRef} className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold text-slate-800 mb-4">
                Perfect Location in
                <span className="block text-blue-600">Siargao Paradise</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Villa Kamaya is strategically located in the heart of General Luna, 
                putting you within walking distance of world-class beaches, local 
                restaurants, and vibrant nightlife, while maintaining the tranquil 
                atmosphere perfect for relaxation.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">2 minutes to the beach</p>
                  <p className="text-sm text-slate-600">White sand beaches at your doorstep</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">15 minutes from airport</p>
                  <p className="text-sm text-slate-600">Easy access via Sayak Airport</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Walking distance to town</p>
                  <p className="text-sm text-slate-600">Restaurants, shops, and entertainment</p>
                </div>
              </div>
            </div>

            <Button size="lg">Get Directions</Button>
          </div>

          {/* Map placeholder */}
          <div ref={mapRef} className="relative">
            <div className="aspect-[4/3] bg-slate-200 rounded-2xl overflow-hidden shadow-lg">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-slate-700">Villa Kamaya</p>
                  <p className="text-slate-600">General Luna, Siargao</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nearby Attractions */}
        <div ref={attractionsRef}>
          <h3 className="text-2xl font-bold text-slate-800 mb-8 text-center">
            Nearby Attractions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {attractions.map((attraction, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow duration-300"
              >
                <h4 className="font-bold text-slate-800 mb-2">{attraction.name}</h4>
                <p className="text-blue-600 font-medium text-sm mb-2">{attraction.distance}</p>
                <p className="text-slate-600 text-sm">{attraction.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Location;