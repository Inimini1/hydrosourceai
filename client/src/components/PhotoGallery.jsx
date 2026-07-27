import { useState } from 'react';

export default function PhotoGallery({ photos = [], alt }) {
  const [active, setActive] = useState(0);

  if (!photos.length) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-slate-100 text-6xl">
        🚘
      </div>
    );
  }

  function prev() {
    setActive((i) => (i - 1 + photos.length) % photos.length);
  }
  function next() {
    setActive((i) => (i + 1) % photos.length);
  }

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100">
        <img src={photos[active]} alt={`${alt} — photo ${active + 1}`} className="h-full w-full object-cover" />

        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg shadow-card hover:bg-white"
            >
              ‹
            </button>
            <button
              onClick={next}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg shadow-card hover:bg-white"
            >
              ›
            </button>
            <span className="absolute bottom-2 right-2 rounded-md bg-slate-900/70 px-2 py-0.5 text-xs font-medium text-white">
              {active + 1} / {photos.length}
            </span>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, i) => (
            <button
              key={photo + i}
              onClick={() => setActive(i)}
              className={`h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                i === active ? 'border-brand' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={photo} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
