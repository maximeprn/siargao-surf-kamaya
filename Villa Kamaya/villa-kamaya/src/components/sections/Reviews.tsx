'use client';

import { useEffect, useRef } from 'react';
import gsap, { scrollReveal, animations } from '@/lib/gsap';
import Container from '@/components/ui/Container';

const Reviews = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);

  const reviews = [
    {
      name: 'Sarah Johnson',
      location: 'Australia',
      rating: 5,
      date: 'December 2023',
      review: 'Absolutely stunning villa! The attention to detail and cleanliness was impeccable. The location is perfect - close to everything but still peaceful. We loved our stay and will definitely be back!',
      avatar: 'SJ'
    },
    {
      name: 'Mark Thompson',
      location: 'United States',
      rating: 5,
      date: 'November 2023',
      review: 'Villa Kamaya exceeded all our expectations. The modern amenities combined with the tropical setting created the perfect vacation atmosphere. The host was incredibly responsive and helpful.',
      avatar: 'MT'
    },
    {
      name: 'Elena Rodriguez',
      location: 'Spain',
      rating: 5,
      date: 'October 2023',
      review: 'This place is paradise! Beautiful design, amazing pool, and just steps from the beach. The kitchen was fully equipped and the WiFi was excellent for remote work. Highly recommended!',
      avatar: 'ER'
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      scrollReveal(titleRef.current);
      
      // Stagger animation for review cards
      gsap.fromTo('.review-card', animations.staggerContainer, {
        ...animations.staggerContainer,
        y: 0,
        opacity: 1,
        scrollTrigger: {
          trigger: reviewsRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'} fill-current`}
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ));
  };

  return (
    <section ref={sectionRef} className="py-20" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Container>
        <div className="text-center mb-16">
          <h2 ref={titleRef} className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            What Our Guests Say
          </h2>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="flex text-yellow-400">
              {renderStars(5)}
            </div>
            <span className="text-lg font-semibold text-slate-700">5.0</span>
            <span className="text-slate-600">• 127 reviews</span>
          </div>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Don't just take our word for it – hear from guests who have experienced 
            the magic of Villa Kamaya firsthand.
          </p>
        </div>

        <div ref={reviewsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="review-card bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  {review.avatar}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800">{review.name}</h4>
                  <p className="text-sm text-slate-600">{review.location}</p>
                </div>
              </div>

              {/* Rating and Date */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex text-yellow-400">
                  {renderStars(review.rating)}
                </div>
                <span className="text-sm text-slate-500">{review.date}</span>
              </div>

              {/* Review Text */}
              <p className="text-slate-700 leading-relaxed italic">
                "{review.review}"
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-slate-600 mb-6">Join over 100 happy guests who have stayed at Villa Kamaya</p>
          <div className="inline-flex items-center space-x-4 bg-white px-8 py-4 rounded-full shadow-lg">
            <div className="flex -space-x-2">
              {['SJ', 'MT', 'ER', 'KL'].map((initials, i) => (
                <div
                  key={i}
                  className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-white"
                >
                  {initials}
                </div>
              ))}
            </div>
            <span className="text-slate-700 font-medium">and many more...</span>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Reviews;