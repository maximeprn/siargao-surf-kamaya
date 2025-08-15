const Footer = () => {
  return (
    <footer className="theme-dark relative overflow-hidden">
      {/* Énorme texte "Kamaya" en bas à gauche */}
      <div className="absolute bottom-0 left-0 pointer-events-none">
        <h1 
          className="text-[12rem] md:text-[18rem] lg:text-[12rem] xl:text-[16rem] font-normal leading-none select-none"
          style={{ fontFamily: 'Analogue, serif', color: '#ECE8DB' }}
        >
          Kamaya
        </h1>
      </div>

      <div className="relative z-10 h-full flex">
        <div className="w-3/4"></div>
        <div className="w-1/4 flex flex-col justify-center px-6 py-32 lg:py-40">
          <p className="text-report text-secondary mb-8">
            Experience luxury and tranquility at Villa Kamaya, your perfect 
            tropical getaway in paradise. Modern amenities meet traditional 
            charm in this stunning retreat.
          </p>
          
          <div className="flex flex-col space-y-4">
            <a href="#" className="text-secondary hover:accent transition-colors text-subtle">
              Instagram
            </a>
            <a href="#" className="text-secondary hover:accent transition-colors text-subtle">
              Facebook
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;