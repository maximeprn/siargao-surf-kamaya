const VillaDescription = () => {

  return (
    <section 
      className="villa-section-padding"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="villa-container">
        <div className="villa-grid">
          {/* Image - Show first on mobile, second on desktop */}
          <div className="relative order-1 lg:order-2">
            <div className="aspect-[1/1] relative rounded-lg overflow-hidden">
              <img
                src="/assets/images/room/room-section-1.webp"
                alt="Villa Kamaya - Modern Tropical Design"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </div>
          </div>

          {/* Text Content - Show second on mobile, first on desktop */}
          <div className="space-y-8 order-2 lg:order-1 mt-8 lg:mt-0 px-2 lg:px-6">
            <h2 
              className="text-4xl leading-tight text-left mb-10"
              style={{
                fontFamily: 'Analogue, serif',
                lineHeight: 1,
                letterSpacing: '-0.01em'
              }}
            >
              Thoughtfully Designed for Island Living
            </h2>
            
            <div className="space-y-6">
              <p
                className="leading-relaxed text-sm md:text-base"
                style={{
                  fontFamily: 'var(--font-montserrat)',
                  lineHeight: 1.7,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em'
                }}
              >
                This 60sqm modern tropical villa seamlessly blends contemporary comfort with Siargao's natural beauty. Wake to birdsong and ocean breezes, work remotely with high-speed Starlink WiFi, and end your day with a sunset dip in your private infinity pool. Perfect for couples, digital nomads, or solo travelers seeking a peaceful base to explore Siargao's world-class waves, island-hopping adventures, and vibrant local culture.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VillaDescription;