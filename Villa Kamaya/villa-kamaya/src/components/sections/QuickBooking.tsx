'use client';

import { useEffect, useRef, useState } from 'react';
import gsap, { scrollReveal } from '@/lib/gsap';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';

const QuickBooking = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  useEffect(() => {
    const ctx = gsap.context(() => {
      scrollReveal(formRef.current, {
        scale: 0.9,
        opacity: 0,
        duration: 1.2,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    // This will later integrate with Hospitable API
    console.log('Booking attempt:', { checkIn, checkOut, guests });
    // For now, redirect to booking page
    window.location.href = '/booking';
  };

  return (
    <section ref={sectionRef} className="py-16 lg:py-20" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-display font-display font-bold mb-6">
            Book Your Perfect Getaway
          </h2>
          <p className="text-report text-secondary max-w-2xl mx-auto">
            Check availability and secure your dates at Villa Kamaya. 
            Your tropical paradise awaits.
          </p>
        </div>

        <div ref={formRef} className="max-w-4xl mx-auto">
          <form onSubmit={handleBooking} className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              {/* Check-in */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Check-in
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                  required
                />
              </div>

              {/* Check-out */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Check-out
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                  required
                />
              </div>

              {/* Guests */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-lg font-semibold"
                >
                  Check Availability
                </Button>
              </div>
            </div>

            {/* Pricing Info */}
            <div className="border-t border-slate-200 pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-slate-600">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">$150</p>
                    <p className="text-sm">per night</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">• Free WiFi & Parking</p>
                    <p className="font-medium">• No booking fees</p>
                    <p className="font-medium">• Free cancellation</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span className="text-green-600 font-medium">Instant booking available</span>
                </div>
              </div>
            </div>
          </form>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center mt-8 space-x-8 text-blue-200">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 9.74s9-4.19 9-9.74V7L12 2z"/>
              </svg>
              <span className="text-sm">Secure booking</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span className="text-sm">5-star rated</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="text-sm">Best price guarantee</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default QuickBooking;