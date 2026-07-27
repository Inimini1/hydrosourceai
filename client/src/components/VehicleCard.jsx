import { Link } from 'react-router-dom';
import { formatPrice, formatMileage, vehicleTitle } from '../utils/format';

export default function VehicleCard({ listing }) {
  const photo = listing.photos?.[0];

  return (
    <Link
      to={`/vehicles/${listing.id}`}
      className="card group flex flex-shrink-0 flex-col overflow-hidden transition-shadow hover:shadow-card-hover"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {photo ? (
          <img
            src={photo}
            alt={vehicleTitle(listing)}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🚘</div>
        )}
        {listing.status === 'sold' && (
          <span className="absolute left-3 top-3 rounded-md bg-slate-900/85 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
            Sold
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-bold text-slate-900">{vehicleTitle(listing)}</h3>
        <p className="mt-0.5 text-sm text-slate-500">{formatMileage(listing.mileage)}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xl font-extrabold text-brand">{formatPrice(listing.price)}</span>
          <span className="text-sm font-semibold text-slate-500 group-hover:text-brand">View →</span>
        </div>
      </div>
    </Link>
  );
}
