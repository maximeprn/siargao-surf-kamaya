'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap, { scrollReveal, animations } from '@/lib/gsap';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';

const GalleryPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: 'all', label: 'All Photos' },
    { id: 'exterior', label: 'Exterior' },
    { id: 'interior', label: 'Interior' },
    { id: 'bedroom', label: 'Bedroom' },
    { id: 'kitchen', label: 'Kitchen' },
    { id: 'pool', label: 'Pool Area' },
    { id: 'views', label: 'Views' },
  ];

  // Placeholder images - replace with actual villa photos
  const images = [
    { id: 1, category: 'exterior', src: '/api/placeholder/400/300', alt: 'Villa exterior view' },
    { id: 2, category: 'interior', src: '/api/placeholder/400/300', alt: 'Living room' },
    { id: 3, category: 'bedroom', src: '/api/placeholder/400/300', alt: 'Master bedroom' },
    { id: 4, category: 'kitchen', src: '/api/placeholder/400/300', alt: 'Modern kitchen' },
    { id: 5, category: 'pool', src: '/api/placeholder/400/300', alt: 'Swimming pool' },
    { id: 6, category: 'views', src: '/api/placeholder/400/300', alt: 'Ocean view' },
    { id: 7, category: 'exterior', src: '/api/placeholder/400/300', alt: 'Villa at sunset' },
    { id: 8, category: 'interior', src: '/api/placeholder/400/300', alt: 'Dining area' },
    { id: 9, category: 'bedroom', src: '/api/placeholder/400/300', alt: 'Guest bedroom' },
    { id: 10, category: 'pool', src: '/api/placeholder/400/300', alt: 'Pool deck' },
    { id: 11, category: 'views', src: '/api/placeholder/400/300', alt: 'Beach view' },
    { id: 12, category: 'kitchen', src: '/api/placeholder/400/300', alt: 'Kitchen island' },
  ];

  const filteredImages = selectedCategory === 'all' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  useEffect(() => {
    scrollReveal(titleRef.current);
    scrollReveal(filtersRef.current);
    
    // Stagger animation for gallery items
    gsap.fromTo('.gallery-item', animations.staggerContainer, {
      ...animations.staggerContainer,
      y: 0,
      opacity: 1,
      stagger: 0.05,
      scrollTrigger: {
        trigger: galleryRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    });
  }, [selectedCategory]);

  return (
    <div className="pt-24 pb-12">
      <Container>
        <div className="text-center mb-12">
          <h1 ref={titleRef} className="text-5xl font-bold text-slate-800 mb-6">
            Villa Gallery
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Explore every corner of Villa Kamaya through our comprehensive photo gallery. 
            From stunning exteriors to luxurious interiors, discover what makes our villa special.
          </p>
        </div>

        {/* Category Filters */}
        <div ref={filtersRef} className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-slate-600 hover:bg-slate-100 shadow-md'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        <div ref={galleryRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image, index) => (
            <div
              key={`${image.id}-${selectedCategory}`}
              className="gallery-item group cursor-pointer overflow-hidden rounded-xl bg-slate-200"
              onClick={() => setLightboxImage(image.src)}
            >
              <div className="aspect-[4/3] relative">
                <div className="absolute inset-0 bg-slate-300 flex items-center justify-center">
                  <span className="text-slate-500">Image {image.id}</span>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/90 rounded-full p-3">
                    <svg className="w-6 h-6 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 bg-slate-50 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            Ready to Experience Villa Kamaya?
          </h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Book your stay and create your own memories in this beautiful tropical retreat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">Book Now</Button>
            <Button variant="outline" size="lg">View Availability</Button>
          </div>
        </div>
      </Container>

      {/* Lightbox */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <div className="aspect-[4/3] bg-slate-300 flex items-center justify-center rounded-lg">
              <span className="text-slate-600">Full Size Image</span>
            </div>
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;