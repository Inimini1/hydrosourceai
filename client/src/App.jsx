import { Routes, Route } from 'react-router-dom';
import PublicLayout from './components/PublicLayout.jsx';
import Home from './pages/Home.jsx';
import Inventory from './pages/Inventory.jsx';
import VehicleDetail from './pages/VehicleDetail.jsx';
import Financing from './pages/Financing.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminListings from './pages/admin/AdminListings.jsx';
import AdminInquiries from './pages/admin/AdminInquiries.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/vehicles/:id" element={<VehicleDetail />} />
        <Route path="/financing" element={<Financing />} />
      </Route>

      <Route path="/admin">
        <Route index element={<AdminLogin />} />
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="listings" element={<AdminListings />} />
          <Route path="inquiries" element={<AdminInquiries />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-center">
      <h1 className="text-3xl font-bold text-slate-900">404</h1>
      <p className="text-slate-500">Page not found.</p>
      <a href="/" className="text-brand hover:underline">Go home</a>
    </div>
  );
}
