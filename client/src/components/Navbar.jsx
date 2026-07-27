import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { BRAND } from '../config';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/inventory', label: 'Inventory' },
  { to: '/financing', label: 'Financing' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-brand" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">🚗</span>
          {BRAND.shortName}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `text-sm font-semibold transition-colors ${
                  isActive ? 'text-brand' : 'text-slate-600 hover:text-brand'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <a href={`tel:${BRAND.phoneNumber}`} className="btn-primary">
            Call {BRAND.phoneDisplay}
          </a>
        </nav>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className="text-xl">{open ? '✕' : '☰'}</span>
        </button>
      </div>

      {open && (
        <nav className="border-t border-slate-200 bg-white px-4 pb-4 md:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-3 text-base font-semibold ${
                  isActive ? 'bg-brand/10 text-brand' : 'text-slate-700'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <a href={`tel:${BRAND.phoneNumber}`} className="btn-primary mt-2 w-full">
            Call {BRAND.phoneDisplay}
          </a>
        </nav>
      )}
    </header>
  );
}
