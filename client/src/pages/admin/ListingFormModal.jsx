import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../api';

const MAX_PHOTOS = 8;

const blankForm = {
  make: '', model: '', year: new Date().getFullYear(), mileage: '', price: '',
  description: '', status: 'active', photos: [''],
};

export default function ListingFormModal({ listing, onClose, onSaved }) {
  const { token } = useAuth();
  const [form, setForm] = useState(() =>
    listing
      ? { ...listing, photos: listing.photos.length ? listing.photos : [''] }
      : blankForm
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function updatePhoto(index, value) {
    setForm((f) => {
      const photos = [...f.photos];
      photos[index] = value;
      return { ...f, photos };
    });
  }

  function addPhotoField() {
    setForm((f) => (f.photos.length >= MAX_PHOTOS ? f : { ...f, photos: [...f.photos, ''] }));
  }

  function removePhotoField(index) {
    setForm((f) => ({ ...f, photos: f.photos.filter((_, i) => i !== index) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...form,
      year: Number(form.year),
      mileage: Number(form.mileage),
      price: Number(form.price),
      photos: form.photos.map((p) => p.trim()).filter(Boolean).slice(0, MAX_PHOTOS),
    };

    try {
      if (listing) {
        await api.updateListing(listing.id, payload, token);
      } else {
        await api.createListing(payload, token);
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-lg font-bold text-slate-900">{listing ? 'Edit Listing' : 'Add New Listing'}</h2>
          <button onClick={onClose} className="text-2xl leading-none text-slate-400 hover:text-slate-700">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Make</label>
              <input required className="input" value={form.make} onChange={(e) => update('make', e.target.value)} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Model</label>
              <input required className="input" value={form.model} onChange={(e) => update('model', e.target.value)} />
            </div>
            <div>
              <label className="label">Year</label>
              <input required type="number" className="input" value={form.year} onChange={(e) => update('year', e.target.value)} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => update('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="sold">Sold</option>
              </select>
            </div>
            <div>
              <label className="label">Mileage</label>
              <input required type="number" className="input" value={form.mileage} onChange={(e) => update('mileage', e.target.value)} />
            </div>
            <div>
              <label className="label">Price ($)</label>
              <input required type="number" className="input" value={form.price} onChange={(e) => update('price', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              rows={4}
              className="input"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Photos (up to {MAX_PHOTOS} URLs)</label>
            <div className="space-y-2">
              {form.photos.map((photo, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="input"
                    placeholder="https://…"
                    value={photo}
                    onChange={(e) => updatePhoto(i, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removePhotoField(i)}
                    className="btn-outline !px-3"
                    aria-label="Remove photo"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            {form.photos.length < MAX_PHOTOS && (
              <button type="button" onClick={addPhotoField} className="mt-2 text-sm font-semibold text-brand hover:underline">
                + Add another photo
              </button>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : listing ? 'Save Changes' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
