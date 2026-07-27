export function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMileage(value) {
  return `${new Intl.NumberFormat('en-US').format(value)} mi`;
}

export function vehicleTitle(listing) {
  if (!listing) return '';
  return `${listing.year} ${listing.make} ${listing.model}`;
}
