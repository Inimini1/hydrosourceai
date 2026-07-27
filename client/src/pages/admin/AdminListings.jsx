import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../api';
import { formatPrice, formatMileage, vehicleTitle } from '../../utils/format';
import ListingFormModal from './ListingFormModal.jsx';

export default function AdminListings() {
  const { token } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalListing, setModalListing] = useState(undefined); // undefined = closed, null = new, object = edit

  function refresh() {
    setLoading(true);
    return api.getAllListings().then(setListings).finally(() => setLoading(false));
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleSaved() {
    setModalListing(undefined);
    refresh();
  }

  async function toggleStatus(listing) {
    const nextStatus = listing.status === 'active' ? 'sold' : 'active';
    await api.setListingStatus(listing.id, nextStatus, token);
    refresh();
  }

  async function handleDelete(listing) {
    if (!confirm(`Delete ${vehicleTitle(listing)}? This can't be undone.`)) return;
    await api.deleteListing(listing.id, token);
    refresh();
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Listings Manager</h1>
          <p className="mt-1 text-slate-500">Add, edit, and manage your vehicle inventory.</p>
        </div>
        <button onClick={() => setModalListing(null)} className="btn-primary sm:self-start">+ Add Listing</button>
      </div>

      {loading ? (
        <p className="mt-6 text-slate-500">Loading listings…</p>
      ) : listings.length === 0 ? (
        <div className="card mt-6 p-6 text-slate-500">No listings yet. Add your first vehicle above.</div>
      ) : (
        <>
          {/* Card layout for small screens */}
          <div className="mt-6 space-y-3 sm:hidden">
            {listings.map((listing) => (
              <div key={listing.id} className="card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900">{vehicleTitle(listing)}</h3>
                    <p className="text-sm text-slate-500">
                      {formatMileage(listing.mileage)} · {formatPrice(listing.price)}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">{listing.photos.length} photo(s)</p>
                  </div>
                  <button
                    onClick={() => toggleStatus(listing)}
                    className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase ${
                      listing.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {listing.status}
                  </button>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => setModalListing(listing)} className="btn-outline flex-1 !py-1.5 text-xs">Edit</button>
                  <button
                    onClick={() => handleDelete(listing)}
                    className="flex-1 rounded-lg border border-red-200 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Table layout for sm+ screens */}
          <div className="card mt-6 hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Mileage</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Photos</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listings.map((listing) => (
                  <tr key={listing.id}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{vehicleTitle(listing)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatMileage(listing.mileage)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatPrice(listing.price)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStatus(listing)}
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                          listing.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                        title="Click to toggle status"
                      >
                        {listing.status}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{listing.photos.length}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setModalListing(listing)} className="btn-outline !px-3 !py-1.5 text-xs">Edit</button>
                        <button
                          onClick={() => handleDelete(listing)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {modalListing !== undefined && (
        <ListingFormModal
          listing={modalListing}
          onClose={() => setModalListing(undefined)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
