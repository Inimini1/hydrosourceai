import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import FilterBar from '../components/FilterBar';
import VehicleCard from '../components/VehicleCard';

const emptyFilters = { make: '', minPrice: '', maxPrice: '', minYear: '', maxMileage: '', search: '' };

export default function Inventory() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({ ...emptyFilters, search: searchParams.get('search') || '' });
  const [listings, setListings] = useState([]);
  const [makes, setMakes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMakes().then(setMakes).catch(() => setMakes([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      api.getListings({ status: 'active', ...filters })
        .then(setListings)
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timeout);
  }, [filters]);

  const resultLabel = useMemo(() => {
    if (loading) return 'Searching…';
    return `${listings.length} vehicle${listings.length === 1 ? '' : 's'} found`;
  }, [listings, loading]);

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
      <p className="mt-1 text-slate-500">Find your next car — filter by make, price, year, or mileage.</p>

      <div className="mt-6">
        <FilterBar filters={filters} onChange={setFilters} makes={makes} />
      </div>

      <p className="mb-4 mt-6 text-sm font-medium text-slate-500">{resultLabel}</p>

      {listings.length ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <VehicleCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : !loading ? (
        <div className="card p-10 text-center text-slate-500">
          No vehicles match your filters. Try widening your search.
        </div>
      ) : null}
    </div>
  );
}
