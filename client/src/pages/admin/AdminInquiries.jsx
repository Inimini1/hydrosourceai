import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../api';

function formatDate(value) {
  return new Date(`${value.replace(' ', 'T')}Z`).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function AdminInquiries() {
  const { token } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  function refresh() {
    setLoading(true);
    return api.getInquiries(token).then(setInquiries).finally(() => setLoading(false));
  }

  useEffect(() => {
    refresh();
  }, []);

  async function toggleRead(inquiry) {
    await api.setInquiryRead(inquiry.id, !inquiry.is_read, token);
    refresh();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Inquiries Inbox</h1>
      <p className="mt-1 text-slate-500">Contact form submissions from your website.</p>

      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="text-slate-500">Loading inquiries…</p>
        ) : inquiries.length === 0 ? (
          <div className="card p-8 text-center text-slate-500">No inquiries yet.</div>
        ) : (
          inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className={`card p-5 ${!inquiry.is_read ? 'border-l-4 border-l-brand' : ''}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">{inquiry.buyer_name}</h3>
                    {!inquiry.is_read && (
                      <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-bold uppercase text-brand">New</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    {inquiry.email} {inquiry.phone && `· ${inquiry.phone}`}
                  </p>
                  {inquiry.vehicle_make && (
                    <p className="mt-1 text-sm font-medium text-brand">
                      Re: {inquiry.vehicle_year} {inquiry.vehicle_make} {inquiry.vehicle_model}
                    </p>
                  )}
                </div>
                <div className="text-right text-xs text-slate-400">{formatDate(inquiry.created_at)}</div>
              </div>

              <p className="mt-3 text-sm text-slate-700">{inquiry.message}</p>

              <button
                onClick={() => toggleRead(inquiry)}
                className="btn-outline mt-4 !px-3 !py-1.5 text-xs"
              >
                Mark as {inquiry.is_read ? 'Unread' : 'Read'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
