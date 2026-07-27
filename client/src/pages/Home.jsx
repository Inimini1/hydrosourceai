import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { BRAND } from '../config';
import Carousel from '../components/Carousel';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.getListings({ status: 'active' })
      .then((rows) => setFeatured(rows.slice(0, 8)))
      .finally(() => setLoading(false));
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    navigate(`/inventory${search ? `?search=${encodeURIComponent(search)}` : ''}`);
  }

  return (
    <div>
      <section className="bg-gradient-to-b from-brand-dark to-brand text-white">
        <div className="container-page py-16 text-center sm:py-24">
          <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">{BRAND.tagline}</h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-blue-100 sm:text-lg">{BRAND.subTagline}</p>

          <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-xl gap-2 rounded-xl bg-white p-2 shadow-card-hover">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by make, model, or keyword…"
              className="flex-1 rounded-lg border-none px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
            <button type="submit" className="btn-accent">Search</button>
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-blue-100">
            <span>✅ No-pressure buying</span>
            <span>✅ Transparent pricing</span>
            <span>✅ Easy financing</span>
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Featured Vehicles</h2>
          <a href="/inventory" className="text-sm font-semibold text-brand hover:underline">View all →</a>
        </div>

        {loading ? (
          <p className="text-slate-500">Loading vehicles…</p>
        ) : featured.length ? (
          <Carousel listings={featured} />
        ) : (
          <p className="text-slate-500">No vehicles available right now — check back soon!</p>
        )}
      </section>

      <section className="bg-white py-12">
        <div className="container-page grid gap-6 sm:grid-cols-3">
          {[
            { icon: '🔍', title: 'Browse With Confidence', body: 'Every listing includes full specs, real photos, and an honest description.' },
            { icon: '💳', title: 'Financing Made Simple', body: 'Estimate your monthly payment in seconds with our built-in calculator.' },
            { icon: '🤝', title: 'Talk To A Real Person', body: 'Call, text, WhatsApp, or email us — we make it easy to ask questions.' },
          ].map((item) => (
            <div key={item.title} className="card p-6 text-center">
              <div className="mb-3 text-3xl">{item.icon}</div>
              <h3 className="font-bold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
