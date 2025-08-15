import Hero from '@/components/sections/Hero';
import BookingCallout from '@/components/sections/BookingCallout';
import VillaDescription from '@/components/sections/VillaDescription';
import VillaDescription2 from '@/components/sections/VillaDescription2';
import AmenitiesShowcase from '@/components/sections/AmenitiesShowcase';

export default function Home() {
  return (
    <div>
      <Hero />
      <BookingCallout />
      <VillaDescription />
      <VillaDescription2 />
      <AmenitiesShowcase />
    </div>
  );
}
