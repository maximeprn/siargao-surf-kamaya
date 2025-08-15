import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="theme-dark">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Villa Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <Image
                src="/assets/logos/kamaya-logo-simple-white.svg"
                alt="Villa Kamaya"
                width={180}
                height={40}
                className="h-10 w-auto"
              />
            </div>
            <p className="text-report text-secondary mb-4 max-w-md">
              Experience luxury and tranquility at Villa Kamaya, your perfect 
              tropical getaway in paradise. Modern amenities meet traditional 
              charm in this stunning retreat.
            </p>
            <div className="text-caption text-muted">
              <p>Siargao Island, Philippines</p>
              <p>Paradise Found</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-eyebrow mb-6">Quick Links</h4>
            <div className="space-y-3">
              <Link href="/" className="block text-secondary hover:text-primary transition-colors text-subtle">
                Home
              </Link>
              <Link href="/gallery" className="block text-secondary hover:text-primary transition-colors text-subtle">
                Gallery
              </Link>
              <Link href="/about" className="block text-secondary hover:text-primary transition-colors text-subtle">
                About
              </Link>
              <Link href="/booking" className="block text-secondary hover:text-primary transition-colors text-subtle">
                Booking
              </Link>
              <Link href="/contact" className="block text-secondary hover:text-primary transition-colors text-subtle">
                Contact
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-eyebrow mb-6">Contact</h4>
            <div className="space-y-3 text-secondary">
              <p className="text-subtle">info@villakamaya.com</p>
              <p className="text-subtle">+63 xxx xxx xxxx</p>
              <div className="flex space-x-6 mt-6">
                <a href="#" className="text-muted hover:accent transition-colors text-subtle">
                  Instagram
                </a>
                <a href="#" className="text-muted hover:accent transition-colors text-subtle">
                  Facebook
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t" style={{borderColor: 'var(--dark-border)'}} className="mt-16 pt-8 text-center text-muted">
          <p className="text-caption">&copy; 2024 Villa Kamaya. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;