import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { BRAND } from '../../config';

const links = [
  { to: '/admin/dashboard', label: 'Overview', icon: '📊' },
  { to: '/admin/listings', label: 'Listings', icon: '🚗' },
  { to: '/admin/inquiries', label: 'Inquiries', icon: '📥' },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/admin');
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="container-page flex h-16 items-center justify-between">
          <span className="font-bold text-slate-900">{BRAND.shortName} Admin</span>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-slate-500 hover:text-brand">View site</a>
            <button onClick={handleLogout} className="btn-outline !px-3 !py-1.5 text-sm">Log Out</button>
          </div>
        </div>
        <nav className="container-page flex gap-1 overflow-x-auto pb-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold ${
                  isActive ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <span>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="container-page py-8">
        <Outlet />
      </main>
    </div>
  );
}
