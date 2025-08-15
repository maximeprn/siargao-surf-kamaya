'use client';

import { useEffect, useRef, useState } from 'react';
import gsap, { scrollReveal } from '@/lib/gsap';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';

const BookingPage = () => {
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 2,
    name: '',
    email: '',
    phone: '',
    specialRequests: '',
  });

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalNights, setTotalNights] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const heroRef = useRef<HTMLDivElement>(null);
  const bookingFormRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const pricePerNight = 150;
  const cleaningFee = 50;
  const serviceFee = 25;

  useEffect(() => {
    scrollReveal(heroRef.current);
    scrollReveal(bookingFormRef.current);
    scrollReveal(summaryRef.current);
  }, []);

  useEffect(() => {
    if (bookingData.checkIn && bookingData.checkOut) {
      const checkIn = new Date(bookingData.checkIn);
      const checkOut = new Date(bookingData.checkOut);
      const timeDiff = checkOut.getTime() - checkIn.getTime();
      const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      if (nights > 0) {
        setTotalNights(nights);
        setTotalPrice(nights * pricePerNight + cleaningFee + serviceFee);
      }
    }
  }, [bookingData.checkIn, bookingData.checkOut]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // This will later integrate with Hospitable API
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStep(4); // Success step
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return bookingData.checkIn && bookingData.checkOut && bookingData.guests;
      case 2:
        return bookingData.name && bookingData.email;
      default:
        return true;
    }
  };

  return (
    <div className="pt-24 pb-12">
      {/* Hero Section */}
      <section ref={heroRef} className="py-20 bg-gradient-to-br from-blue-50 to-slate-50">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6">
              Book Your Stay
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Secure your perfect getaway at Villa Kamaya. Complete your booking 
              in just a few simple steps.
            </p>
          </div>
        </Container>
      </section>

      {/* Progress Indicator */}
      <section className="py-8 bg-white border-b border-slate-200">
        <Container>
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= stepNumber 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {step > stepNumber ? '✓' : stepNumber}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`font-medium ${
                    step >= stepNumber ? 'text-blue-600' : 'text-slate-600'
                  }`}>
                    {stepNumber === 1 && 'Dates & Guests'}
                    {stepNumber === 2 && 'Your Details'}
                    {stepNumber === 3 && 'Confirmation'}
                  </p>
                </div>
                {stepNumber < 3 && (
                  <div className={`w-8 h-0.5 mx-4 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Booking Content */}
      <section className="py-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Booking Form */}
            <div ref={bookingFormRef} className="lg:col-span-2">
              {step === 1 && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-slate-800 mb-8">
                    Select Dates & Guests
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Check-in Date
                        </label>
                        <input
                          type="date"
                          name="checkIn"
                          value={bookingData.checkIn}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Check-out Date
                        </label>
                        <input
                          type="date"
                          name="checkOut"
                          value={bookingData.checkOut}
                          onChange={handleInputChange}
                          min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                          className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Number of Guests
                      </label>
                      <select
                        name="guests"
                        value={bookingData.guests}
                        onChange={handleInputChange}
                        className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {[1, 2, 3, 4, 5, 6].map(num => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? 'Guest' : 'Guests'}
                          </option>
                        ))}
                      </select>
                    </div>

                    {totalNights > 0 && (
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="font-bold text-slate-800 mb-2">Selected Dates</h3>
                        <p className="text-slate-600">
                          {totalNights} {totalNights === 1 ? 'night' : 'nights'} • {bookingData.guests} {bookingData.guests === 1 ? 'guest' : 'guests'}
                        </p>
                        <p className="text-2xl font-bold text-blue-600 mt-2">
                          ${totalPrice} total
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex justify-end">
                    <Button 
                      onClick={handleNextStep} 
                      disabled={!isStepValid(1)}
                      size="lg"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-slate-800 mb-8">
                    Your Details
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={bookingData.name}
                        onChange={handleInputChange}
                        className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={bookingData.email}
                          onChange={handleInputChange}
                          className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="your.email@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={bookingData.phone}
                          onChange={handleInputChange}
                          className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Special Requests
                      </label>
                      <textarea
                        name="specialRequests"
                        value={bookingData.specialRequests}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="Any special requests or requirements?"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <Button variant="outline" onClick={handlePrevStep}>
                      Back
                    </Button>
                    <Button 
                      onClick={handleNextStep}
                      disabled={!isStepValid(2)}
                      size="lg"
                    >
                      Review Booking
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-slate-800 mb-8">
                    Confirm Your Booking
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 p-6 rounded-lg">
                        <h3 className="font-bold text-slate-800 mb-4">Booking Details</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Check-in:</span>
                            <span className="font-medium">{new Date(bookingData.checkIn).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Check-out:</span>
                            <span className="font-medium">{new Date(bookingData.checkOut).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Guests:</span>
                            <span className="font-medium">{bookingData.guests}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Nights:</span>
                            <span className="font-medium">{totalNights}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-6 rounded-lg">
                        <h3 className="font-bold text-slate-800 mb-4">Guest Information</h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-slate-600 block">Name:</span>
                            <span className="font-medium">{bookingData.name}</span>
                          </div>
                          <div>
                            <span className="text-slate-600 block">Email:</span>
                            <span className="font-medium">{bookingData.email}</span>
                          </div>
                          <div>
                            <span className="text-slate-600 block">Phone:</span>
                            <span className="font-medium">{bookingData.phone || 'Not provided'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {bookingData.specialRequests && (
                      <div className="bg-slate-50 p-6 rounded-lg">
                        <h3 className="font-bold text-slate-800 mb-2">Special Requests</h3>
                        <p className="text-slate-600">{bookingData.specialRequests}</p>
                      </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                      <h3 className="font-bold text-slate-800 mb-4">Cancellation Policy</h3>
                      <p className="text-sm text-slate-600">
                        Free cancellation up to 48 hours before check-in. 
                        Cancellations made within 48 hours are subject to a one-night charge.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <Button variant="outline" onClick={handlePrevStep}>
                      Back
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      size="lg"
                    >
                      {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                    </Button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-slate-800 mb-4">
                    Booking Confirmed!
                  </h2>
                  <p className="text-lg text-slate-600 mb-8">
                    Thank you for booking Villa Kamaya! We've sent a confirmation email 
                    with all the details to {bookingData.email}.
                  </p>
                  <div className="bg-slate-50 p-6 rounded-lg mb-8">
                    <h3 className="font-bold text-slate-800 mb-2">Booking Reference</h3>
                    <p className="text-2xl font-bold text-blue-600">#VK{Date.now().toString().slice(-6)}</p>
                  </div>
                  <Button size="lg">
                    Return to Homepage
                  </Button>
                </div>
              )}
            </div>

            {/* Booking Summary */}
            <div ref={summaryRef} className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-8">
                <h3 className="text-xl font-bold text-slate-800 mb-6">
                  Booking Summary
                </h3>

                <div className="aspect-[4/3] bg-slate-200 rounded-lg mb-6 overflow-hidden">
                  <div className="h-full flex items-center justify-center">
                    <span className="text-slate-500">Villa Image</span>
                  </div>
                </div>

                <h4 className="font-bold text-slate-800 mb-4">Villa Kamaya</h4>
                
                {totalNights > 0 && (
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-slate-600">${pricePerNight} × {totalNights} nights</span>
                      <span className="font-medium">${pricePerNight * totalNights}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Cleaning fee</span>
                      <span className="font-medium">${cleaningFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Service fee</span>
                      <span className="font-medium">${serviceFee}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-3">
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-800">Total</span>
                        <span className="font-bold text-xl">${totalPrice}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    <span>Free cancellation (48h)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    <span>Free WiFi & Parking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    <span>24/7 host support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default BookingPage;