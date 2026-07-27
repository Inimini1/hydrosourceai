import { Link } from 'react-router-dom';
import { BRAND } from '../config';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-900 pb-28 pt-12 text-slate-300 md:pb-12">
      <div className="container-page grid gap-10 md:grid-cols-3">
        <div>
          <div className="mb-3 flex items-center gap-2 text-lg font-extrabold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">🚗</span>
            {BRAND.name}
          </div>
          <p className="text-sm leading-relaxed text-slate-400">{BRAND.subTagline}</p>
          <div className="mt-4 flex gap-3">
            {Object.entries(BRAND.social).map(([platform, href]) => (
              <a
                key={platform}
                href={href}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-sm capitalize hover:bg-brand"
                aria-label={platform}
              >
                {platform[0].toUpperCase()}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Contact Us</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={`tel:${BRAND.phoneNumber}`} className="hover:text-white">📞 {BRAND.phoneDisplay}</a>
            </li>
            <li>
              <a href={`mailto:${BRAND.email}`} className="hover:text-white">✉️ {BRAND.email}</a>
            </li>
            <li>📍 {BRAND.address}</li>
            <li>🕒 {BRAND.hours}</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/inventory" className="hover:text-white">Browse Inventory</Link></li>
            <li><Link to="/financing" className="hover:text-white">Financing Calculator</Link></li>
            <li><Link to="/admin" className="hover:text-white">Admin Panel</Link></li>
          </ul>
        </div>
      </div>

      <div className="container-page mt-10 border-t border-slate-800 pt-6 text-xs text-slate-500">
        © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
      </div>
    </footer>
  );
}
