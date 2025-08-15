const VillaDescription2 = () => {

  return (
    <section 
      className="villa-section-padding"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="villa-container">
        <div className="villa-grid">
          {/* Image - Show first on mobile, first on desktop */}
          <div className="relative order-1 lg:order-1">
            <div className="aspect-[1/1] relative rounded-lg overflow-hidden">
              <img
                src="/assets/images/villa/vignette-landing-2 copy.webp"
                alt="Villa Kamaya - Private Infinity Pool & Outdoor Living"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </div>
          </div>

          {/* Text Content - Show second on mobile, second on desktop */}
          <div className="space-y-8 order-2 lg:order-2 mt-8 lg:mt-0 px-2 lg:px-4">
            <h2 
              className="text-4xl leading-tight text-left mb-10"
              style={{
                fontFamily: 'Analogue, serif',
                lineHeight: 1,
                letterSpacing: '-0.01em'
              }}
            >
              Private Infinity Pool & Outdoor Living
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
                Dive into luxury with your private infinity pool that seamlessly blends with the horizon. The outdoor terrace features comfortable lounging areas, perfect for morning coffee or sunset cocktails. Experience the ultimate in tropical relaxation with panoramic views of Siargao's pristine landscape and azure waters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VillaDescription2;