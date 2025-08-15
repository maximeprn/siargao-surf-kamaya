'use client';

import { useEffect, useRef } from 'react';
import gsap, { scrollReveal } from '@/lib/gsap';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';

const AboutPage = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollReveal(heroRef.current);
    scrollReveal(storyRef.current);
    scrollReveal(hostRef.current);
    scrollReveal(valuesRef.current);
  }, []);

  const values = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: 'Hospitality First',
      description: 'We believe every guest deserves exceptional care and attention to detail.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
        </svg>
      ),
      title: 'Sustainable Tourism',
      description: 'Committed to preserving Siargao\'s natural beauty for future generations.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Local Connection',
      description: 'Deep roots in the community, sharing authentic Siargao experiences.'
    }
  ];

  return (
    <div className="pt-24 pb-12">
      {/* Hero Section */}
      <section ref={heroRef} className="py-20 bg-gradient-to-br from-blue-50 to-slate-50">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6">
              Welcome to
              <span className="block text-blue-600">Villa Kamaya</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              More than just accommodation, Villa Kamaya represents a dream realized – 
              a place where modern luxury meets island authenticity, creating unforgettable 
              experiences in the heart of Siargao's paradise.
            </p>
          </div>
        </Container>
      </section>

      {/* Villa Story */}
      <section ref={storyRef} className="py-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-slate-800">
                Our Story
              </h2>
              <div className="space-y-4 text-lg text-slate-600 leading-relaxed">
                <p>
                  Villa Kamaya was born from a love affair with Siargao Island. After countless 
                  visits to this magical destination, we knew we wanted to create something special – 
                  a place that would capture the island's spirit while providing the comfort and 
                  luxury that discerning travelers deserve.
                </p>
                <p>
                  Every detail of the villa has been carefully crafted, from the locally-sourced 
                  materials used in construction to the contemporary furnishings that complement 
                  the tropical setting. We've worked closely with local artisans and suppliers 
                  to ensure that Villa Kamaya not only reflects the beauty of Siargao but also 
                  supports the local community.
                </p>
                <p>
                  The name "Kamaya" means "home" in the local dialect, and that's exactly what 
                  we want every guest to feel – completely at home in paradise.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-[4/3] bg-slate-200 rounded-2xl overflow-hidden shadow-xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-slate-500 text-lg">Villa Construction Photo</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Meet Your Host */}
      <section ref={hostRef} className="py-20 bg-slate-50">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">
              Meet Your Hosts
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              We're Maria and Carlos, your dedicated hosts who are passionate about 
              sharing the magic of Siargao with travelers from around the world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-32 h-32 bg-slate-300 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-slate-600 text-2xl font-bold">M</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Maria Santos</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                Originally from Manila, Maria fell in love with Siargao's laid-back lifestyle 
                and decided to make it her permanent home. She brings her hospitality expertise 
                and local knowledge to ensure every guest has an authentic island experience.
              </p>
              <div className="text-sm text-slate-500">
                <p>• 8 years in Siargao</p>
                <p>• Hospitality Management Background</p>
                <p>• Speaks English, Filipino, Bisaya</p>
              </div>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-slate-300 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-slate-600 text-2xl font-bold">C</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Carlos Rivera</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                A surfer and entrepreneur from Australia, Carlos discovered Siargao's incredible 
                waves and never looked back. He oversees villa operations and loves sharing 
                insider tips about the best surf spots and hidden gems.
              </p>
              <div className="text-sm text-slate-500">
                <p>• 10 years in Siargao</p>
                <p>• Professional Surf Instructor</p>
                <p>• Local Business Network</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Our Values */}
      <section ref={valuesRef} className="py-20">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">
              What We Stand For
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our values guide everything we do, from how we design our spaces 
              to how we interact with guests and the local community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6 text-blue-600">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">
                  {value.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Make Villa Kamaya Your Home Away From Home?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              We can't wait to welcome you to our slice of paradise and help you 
              create memories that will last a lifetime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Book Your Stay
              </Button>
              <Button size="lg" variant="outline">
                Contact Us
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default AboutPage;