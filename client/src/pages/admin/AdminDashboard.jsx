import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../api';

const CARDS = [
  { key: 'activeListings', label: 'Active Listings', icon: '🚗', color: 'text-brand' },
  { key: 'soldListings', label: 'Sold Listings', icon: '✅', color: 'text-emerald-600' },
  { key: 'inquiriesThisWeek', label: 'Inquiries This Week', icon: '📥', color: 'text-accent' },
  { key: 'unreadInquiries', label: 'Unread Inquiries', icon: '🔔', color: 'text-red-500' },
];

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats(token).then(setStats).finally(() => setLoading(false));
  }, [token]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
      <p className="mt-1 text-slate-500">A quick snapshot of your dealership's activity.</p>

      {loading ? (
        <p className="mt-6 text-slate-500">Loading stats…</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {CARDS.map((card) => (
            <div key={card.key} className="card p-5">
              <div className="text-2xl">{card.icon}</div>
              <div className={`mt-3 text-3xl font-extrabold ${card.color}`}>{stats?.[card.key] ?? 0}</div>
              <div className="mt-1 text-sm text-slate-500">{card.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
