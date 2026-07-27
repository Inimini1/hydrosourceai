import { API_URL } from './config';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  // Public
  getListings: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ).toString();
    return request(`/listings${qs ? `?${qs}` : ''}`);
  },
  getMakes: () => request('/listings/makes'),
  getAllListings: () => request('/listings?status=all'),
  getListing: (id) => request(`/listings/${id}`),
  submitInquiry: (payload) => request('/inquiries', { method: 'POST', body: payload }),

  // Admin
  login: (password) => request('/admin/login', { method: 'POST', body: { password } }),
  getStats: (token) => request('/stats', { token }),
  createListing: (payload, token) => request('/listings', { method: 'POST', body: payload, token }),
  updateListing: (id, payload, token) => request(`/listings/${id}`, { method: 'PUT', body: payload, token }),
  setListingStatus: (id, status, token) =>
    request(`/listings/${id}/status`, { method: 'PATCH', body: { status }, token }),
  deleteListing: (id, token) => request(`/listings/${id}`, { method: 'DELETE', token }),
  getInquiries: (token) => request('/inquiries', { token }),
  setInquiryRead: (id, isRead, token) =>
    request(`/inquiries/${id}/read`, { method: 'PATCH', body: { isRead }, token }),
};
