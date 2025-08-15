'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap, { ScrollTrigger } from '@/lib/gsap';

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/about', label: 'About' },
    { href: '/booking', label: 'Booking' },
    { href: '/contact', label: 'Contact' },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance animation
      const tl = gsap.timeline();
      
      tl.fromTo(titleRef.current, 
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }
      )
      .fromTo(subtitleRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' },
        '-=0.5'
      );

      // Hero image scroll-linked scale animation
      gsap.fromTo(heroImageRef.current, 
        { scale: 1 },
        {
          scale: 0.90,
          ease: "cubic-bezier(0.926, 0.178, 1, 1.002)",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top", 
            end: "150% top",
            scrub: 0.5, // Subtle lag effect - animation follows scroll with 0.5 second delay
          }
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden p-4"
    >
      {/* Hero Container with all content */}
      <div 
        ref={heroImageRef}
        className="absolute inset-4 rounded-lg overflow-hidden"
        style={{
          zIndex: 1
        }}
      >
        {/* Background Video */}
        <div className="relative w-full h-full">
          {/* VIDEO FOR ALL SCREEN SIZES */}
          <video
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: 'center 70%' }}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            onLoadStart={() => console.log('🏝️ Hero Video: loadStart')}
            onCanPlay={() => console.log('🏝️ Hero Video: canPlay')}
            onError={(e) => console.error('🏝️ Hero Video: error', e)}
          >
            <source src="https://cdn.jsdelivr.net/gh/maximeprn/villa-header-video/Kamaya%20Header%20Short.mp4" type="video/mp4" />
          </video>
          
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/15"></div>
          
          {/* Dark overlay when mobile menu is open */}
          {isOpen && (
            <div className="absolute inset-0 bg-black/60 z-20 md:hidden"></div>
          )}
        </div>

        {/* Navigation - positioned inside the hero container */}
        <nav
          className="absolute top-4 left-4 right-4 z-50 transition-all duration-300 rounded-lg bg-transparent"
        >
          <div className="w-full px-6 lg:px-10 py-4">
            <div className="flex items-center justify-between">
              {/* Left side: K-logo and Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                {/* K-logo */}
                <Link
                  href="/"
                  className="flex items-center transition-opacity hover:opacity-80"
                >
                  <Image
                    src="/assets/logos/K-logo.svg"
                    alt="Villa Kamaya"
                    width={18}
                    height={18}
                    priority
                    style={{ width: '18px', height: '18px' }}
                  />
                </Link>
                
                {/* Navigation Links */}
                <div className="flex items-center space-x-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="font-medium transition-colors relative group"
                    style={{
                      color: '#FFFFFF',
                      fontSize: '0.875rem'
                    }}
                  >
                    {link.label}
                    <span 
                      className="absolute inset-x-0 -bottom-1 h-0.5 transform scale-x-0 transition-transform group-hover:scale-x-100" 
                      style={{backgroundColor: 'var(--accent)'}}
                    />
                  </Link>
                ))}
                </div>
              </div>

              {/* Right side: Book Now Button */}
              <div className="hidden md:flex">
                <Link
                  href="/booking"
                  className="transition-all duration-200 font-medium"
                  style={{
                    fontSize: '1rem',
                    lineHeight: '1.5',
                    boxSizing: 'border-box',
                    textDecoration: 'none',
                    maxWidth: '100%',
                    gridColumnGap: '.7rem',
                    gridRowGap: '.7rem',
                    backgroundColor: 'var(--bg-button)',
                    color: 'var(--text-button)',
                    borderRadius: '.4rem',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    padding: '.75rem 1.5rem',
                    display: 'flex'
                  }}
                >
                  Book Now
                </Link>
              </div>

              {/* Mobile K-logo */}
              <Link
                href="/"
                className="md:hidden flex items-center transition-opacity hover:opacity-80"
              >
                <Image
                  src="/assets/logos/K-logo.svg"
                  alt="Villa Kamaya"
                  width={18}
                  height={18}
                  priority
                  style={{ width: '18px', height: '18px' }}
                />
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMenu}
                className="md:hidden flex flex-col space-y-1 p-2"
                aria-label="Toggle menu"
              >
                <span
                  className={`block w-6 h-0.5 transition-transform ${
                    isOpen ? 'rotate-45 translate-y-1.5' : ''
                  }`}
                  style={{backgroundColor: '#FFFFFF'}}
                />
                <span
                  className={`block w-6 h-0.5 transition-opacity ${
                    isOpen ? 'opacity-0' : ''
                  }`}
                  style={{backgroundColor: '#FFFFFF'}}
                />
                <span
                  className={`block w-6 h-0.5 transition-transform ${
                    isOpen ? '-rotate-45 -translate-y-1.5' : ''
                  }`}
                  style={{backgroundColor: '#FFFFFF'}}
                />
              </button>
            </div>

            {/* Mobile Menu */}
            <div 
              className={`md:hidden mt-4 py-4 border-t transition-all duration-300 ease-in-out ${
                isOpen ? 'opacity-100 max-h-96 visible' : 'opacity-0 max-h-0 invisible overflow-hidden'
              }`}
              style={{borderColor: 'var(--border)'}}
            >
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block py-3 transition-colors font-medium"
                    style={{
                      color: '#FFFFFF',
                      fontSize: '0.875rem'
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/booking"
                  onClick={() => setIsOpen(false)}
                  className="block mt-4 text-center transition-all duration-200 font-medium"
                  style={{
                    fontSize: '1rem',
                    lineHeight: '1.5',
                    boxSizing: 'border-box',
                    textDecoration: 'none',
                    maxWidth: '100%',
                    gridColumnGap: '.7rem',
                    gridRowGap: '.7rem',
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    borderRadius: '.4rem',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    padding: '.75rem 1.5rem',
                    display: 'flex'
                  }}
                >
                  Book Now
                </Link>
            </div>
          </div>
        </nav>
        
        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <h1
            ref={titleRef}
            className="drop-shadow-lg"
            style={{ 
              fontFamily: 'Analogue, serif',
              fontSize: 'clamp(80px, 15vw, 200px)',
              fontWeight: 400,
              lineHeight: 1,
              color: '#ECE8DB',
              marginBottom: '2rem'
            }}
          >
            Kamaya
          </h1>
          
          <p
            ref={subtitleRef}
            className="px-6 text-center leading-relaxed drop-shadow-md"
            style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: '14px',
              lineHeight: 1.8,
              color: '#ECE8DB',
              letterSpacing: '-0.02em',
              maxWidth: '550px'
            }}
          >
            Discover Kamaya, where modern luxury meets untouched nature. This private villa offers an intimate escape, thoughtfully positioned a few steps from Siargao's most beautiful beach.
          </p>
        </div>

        {/* Explore button */}
        <button 
          onClick={() => {
            const heroSection = heroRef.current;
            if (heroSection && heroSection.nextElementSibling) {
              heroSection.nextElementSibling.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start' 
              });
            }
          }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
          style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: '14px',
            letterSpacing: '-0.02em',
            color: '#ECE8DB',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Explore
        </button>
      </div>
    </section>
  );
};

export default Hero;