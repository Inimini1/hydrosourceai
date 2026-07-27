const PRICE_STEPS = [4000, 6000, 8000, 10000, 12000, 15000, 20000];
const YEAR_NOW = new Date().getFullYear();
const YEARS = Array.from({ length: 20 }, (_, i) => YEAR_NOW - i);
const MILEAGE_STEPS = [30000, 60000, 90000, 120000, 150000];

export default function FilterBar({ filters, onChange, makes }) {
  function update(field, value) {
    onChange({ ...filters, [field]: value });
  }

  function reset() {
    onChange({ make: '', minPrice: '', maxPrice: '', minYear: '', maxMileage: '', search: '' });
  }

  return (
    <div className="card p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="col-span-2 sm:col-span-3 lg:col-span-2">
          <label className="label">Search</label>
          <input
            className="input"
            placeholder="Make, model, keyword…"
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
          />
        </div>

        <div>
          <label className="label">Make</label>
          <select className="input" value={filters.make} onChange={(e) => update('make', e.target.value)}>
            <option value="">Any make</option>
            {makes.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Max Price</label>
          <select className="input" value={filters.maxPrice} onChange={(e) => update('maxPrice', e.target.value)}>
            <option value="">Any price</option>
            {PRICE_STEPS.map((p) => (
              <option key={p} value={p}>Under ${p.toLocaleString()}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Min Year</label>
          <select className="input" value={filters.minYear} onChange={(e) => update('minYear', e.target.value)}>
            <option value="">Any year</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}+</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Max Mileage</label>
          <select className="input" value={filters.maxMileage} onChange={(e) => update('maxMileage', e.target.value)}>
            <option value="">Any mileage</option>
            {MILEAGE_STEPS.map((m) => (
              <option key={m} value={m}>Under {m.toLocaleString()} mi</option>
            ))}
          </select>
        </div>
      </div>

      <button onClick={reset} className="mt-3 text-sm font-semibold text-brand hover:underline">
        Clear filters
      </button>
    </div>
  );
}
