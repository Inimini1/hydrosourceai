import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { formatPrice, formatMileage, vehicleTitle } from '../utils/format';
import PhotoGallery from '../components/PhotoGallery';
import { BRAND } from '../config';

function ListingContactForm({ listing }) {
  const [form, setForm] = useState({ buyerName: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setError('');
    try {
      await api.submitInquiry({ ...form, listingId: listing.id });
      setStatus('success');
      setForm({ buyerName: '', email: '', phone: '', message: '' });
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  }

  if (status === 'success') {
    return (
      <div className="card p-6 text-center">
        <p className="text-lg font-semibold text-emerald-700">Message sent! 🎉</p>
        <p className="mt-1 text-sm text-slate-500">
          We'll follow up about the {vehicleTitle(listing)} shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-3 p-5">
      <h3 className="font-bold text-slate-900">Interested in this {vehicleTitle(listing)}?</h3>
      <div>
        <label className="label">Name</label>
        <input required className="input" value={form.buyerName} onChange={(e) => update('buyerName', e.target.value)} />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Email</label>
          <input required type="email" className="input" value={form.email} onChange={(e) => update('email', e.target.value)} />
        </div>
        <div>
          <label className="label">Phone (optional)</label>
          <input type="tel" className="input" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label">Message</label>
        <textarea
          required
          rows={3}
          className="input"
          value={form.message}
          onChange={(e) => update('message', e.target.value)}
          placeholder={`Hi, is the ${vehicleTitle(listing)} still available?`}
        />
      </div>
      {status === 'error' && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={status === 'submitting'} className="btn-primary w-full">
        {status === 'submitting' ? 'Sending…' : 'Send Inquiry'}
      </button>
    </form>
  );
}

export default function VehicleDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    api.getListing(id)
      .then(setListing)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container-page py-16 text-center text-slate-500">Loading…</div>;

  if (notFound || !listing) {
    return (
      <div className="container-page py-16 text-center">
        <p className="text-lg font-semibold text-slate-700">We couldn't find that vehicle.</p>
        <Link to="/inventory" className="mt-3 inline-block text-brand hover:underline">← Back to Inventory</Link>
      </div>
    );
  }

  const specs = [
    { label: 'Year', value: listing.year },
    { label: 'Make', value: listing.make },
    { label: 'Model', value: listing.model },
    { label: 'Mileage', value: formatMileage(listing.mileage) },
    { label: 'Price', value: formatPrice(listing.price) },
    { label: 'Status', value: listing.status === 'sold' ? 'Sold' : 'Available' },
  ];

  return (
    <div className="container-page py-8">
      <Link to="/inventory" className="text-sm font-semibold text-brand hover:underline">← Back to Inventory</Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PhotoGallery photos={listing.photos} alt={vehicleTitle(listing)} />

          <div className="mt-6">
            <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{vehicleTitle(listing)}</h1>
            <p className="mt-1 text-lg font-bold text-brand">{formatPrice(listing.price)}</p>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {specs.map((s) => (
                <div key={s.label} className="rounded-lg bg-slate-100 px-3 py-2">
                  <div className="text-xs font-medium uppercase text-slate-500">{s.label}</div>
                  <div className="font-semibold text-slate-900">{s.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h2 className="mb-2 font-bold text-slate-900">Description</h2>
              <p className="whitespace-pre-line leading-relaxed text-slate-600">{listing.description}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <ListingContactForm listing={listing} />
          <div className="card p-5 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Prefer to talk now?</p>
            <a href={`tel:${BRAND.phoneNumber}`} className="mt-2 block text-brand hover:underline">
              📞 {BRAND.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
