import { useState } from 'react';
import { api } from '../api';
import { BRAND } from '../config';

export default function ContactModal({ open, onClose, listingId = null, vehicleLabel = null }) {
  const [form, setForm] = useState({ buyerName: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [error, setError] = useState('');

  if (!open) return null;

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setError('');
    try {
      await api.submitInquiry({ ...form, listingId });
      setStatus('success');
      setForm({ buyerName: '', email: '', phone: '', message: '' });
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  }

  function handleClose() {
    setStatus('idle');
    setError('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-0 sm:items-center sm:p-4" onClick={handleClose}>
      <div
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:max-w-md sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {vehicleLabel ? `Ask about the ${vehicleLabel}` : `Contact ${BRAND.shortName}`}
            </h2>
            <p className="text-sm text-slate-500">We usually reply within a few hours.</p>
          </div>
          <button onClick={handleClose} className="text-2xl leading-none text-slate-400 hover:text-slate-700" aria-label="Close">
            ×
          </button>
        </div>

        {status === 'success' ? (
          <div className="rounded-lg bg-safe/10 p-4 text-center">
            <p className="text-lg font-semibold text-emerald-700">Thanks — your message is in! 🎉</p>
            <p className="mt-1 text-sm text-emerald-700/80">A team member will reach out to you shortly.</p>
            <button className="btn-primary mt-4" onClick={handleClose}>Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="label">Name</label>
              <input required className="input" value={form.buyerName} onChange={(e) => update('buyerName', e.target.value)} />
            </div>
            <div>
              <label className="label">Email</label>
              <input required type="email" className="input" value={form.email} onChange={(e) => update('email', e.target.value)} />
            </div>
            <div>
              <label className="label">Phone (optional)</label>
              <input type="tel" className="input" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea
                required
                rows={4}
                className="input"
                value={form.message}
                onChange={(e) => update('message', e.target.value)}
                placeholder={vehicleLabel ? `Hi, I'm interested in the ${vehicleLabel}...` : 'How can we help?'}
              />
            </div>

            {status === 'error' && <p className="text-sm text-red-600">{error}</p>}

            <button type="submit" disabled={status === 'submitting'} className="btn-primary w-full">
              {status === 'submitting' ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
