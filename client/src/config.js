// ---------------------------------------------------------------------------
// Brand configuration — this is the ONLY place the dealership name, tagline,
// and contact info should live. Swap these values to rebrand the whole site.
// ---------------------------------------------------------------------------
export const BRAND = {
  name: 'AutoEdge Motors',
  shortName: 'AutoEdge',
  tagline: 'Quality Used Cars You Can Trust',
  subTagline: 'Transparent pricing. No pressure. Just great cars at a fair price.',
  phoneDisplay: '(555) 234-5678',
  phoneNumber: '+15552345678',
  email: 'sales@autoedgemotors.example',
  address: '4200 Commerce Way, Springfield, ST 62704',
  hours: 'Mon–Sat: 9am–7pm · Sun: 11am–5pm',
  whatsappNumber: '15552345678',
  social: {
    facebook: '#',
    instagram: '#',
    tiktok: '#',
  },
};

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
