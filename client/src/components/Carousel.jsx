import { useRef } from 'react';
import VehicleCard from './VehicleCard';

export default function Carousel({ listings }) {
  const trackRef = useRef(null);

  function scrollBy(amount) {
    trackRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
  }

  if (!listings?.length) return null;

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {listings.map((listing) => (
          <div key={listing.id} className="w-[75%] flex-shrink-0 snap-start sm:w-[45%] lg:w-[30%]">
            <VehicleCard listing={listing} />
          </div>
        ))}
      </div>

      <button
        onClick={() => scrollBy(-320)}
        aria-label="Scroll left"
        className="absolute -left-3 top-[35%] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-card hover:bg-slate-50 md:flex"
      >
        ‹
      </button>
      <button
        onClick={() => scrollBy(320)}
        aria-label="Scroll right"
        className="absolute -right-3 top-[35%] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-card hover:bg-slate-50 md:flex"
      >
        ›
      </button>
    </div>
  );
}
