'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import gsap from '@/lib/gsap';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  return (
    <nav
      className={`absolute top-4 left-4 right-4 z-50 transition-all duration-300 rounded-lg ${
        scrolled
          ? 'backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
      style={{
        backgroundColor: scrolled ? 'var(--bg-primary)' : 'transparent'
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4">
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
        {isOpen && (
          <div 
            className="md:hidden mt-4 py-4 border-t" 
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
        )}
      </div>
    </nav>
  );
};

export default Navigation;