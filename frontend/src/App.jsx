import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

// Components
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';

// Pages
import SplashScreen from './pages/SplashScreen';
import Onboarding from './pages/Onboarding';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentMenu from './pages/StudentMenu';
import FoodDetails from './pages/FoodDetails';
import CartPage from './pages/CartPage';
import TokenTracking from './pages/TokenTracking';
import OrderHistory from './pages/OrderHistory';
import VendorDashboard from './pages/VendorDashboard';
import VendorOrders from './pages/VendorOrders';
import VendorInventory from './pages/VendorInventory';
import VendorAnalytics from './pages/VendorAnalytics';
import VendorAI from './pages/VendorAI';

// Protected Route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
          <p className="text-xs text-gray-400 font-medium animate-pulse">Loading…</p>
        </div>
      </div>
    );
  }

  const onboardingCompleted = localStorage.getItem('queueless_onboarding_completed');
  if (!onboardingCompleted) return <Navigate to="/onboarding" replace />;
  if (!user) return <Navigate to="/auth" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300 flex flex-col">
      <Navbar />
      <main className="flex-1 pb-24 md:pb-8 page-enter">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

const RootRoute = () => {
  const { user } = useAuth();
  const onboardingCompleted = localStorage.getItem('queueless_onboarding_completed');

  if (!onboardingCompleted) return <Navigate to="/splash" replace />;
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role === 'vendor' || user.role === 'admin') return <VendorDashboard />;
  return <StudentDashboard />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <SocketProvider>
            <ToastProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/splash" element={<SplashScreen />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/auth" element={<AuthPage />} />

                  <Route path="/" element={<ProtectedRoute><RootRoute /></ProtectedRoute>} />

                  {/* Student */}
                  <Route path="/menu" element={<ProtectedRoute allowedRoles={['student']}><StudentMenu /></ProtectedRoute>} />
                  <Route path="/food/:id" element={<ProtectedRoute allowedRoles={['student']}><FoodDetails /></ProtectedRoute>} />
                  <Route path="/cart" element={<ProtectedRoute allowedRoles={['student']}><CartPage /></ProtectedRoute>} />
                  <Route path="/track/:id" element={<ProtectedRoute allowedRoles={['student']}><TokenTracking /></ProtectedRoute>} />
                  <Route path="/history" element={<ProtectedRoute allowedRoles={['student']}><OrderHistory /></ProtectedRoute>} />

                  {/* Vendor */}
                  <Route path="/orders" element={<ProtectedRoute allowedRoles={['vendor', 'admin']}><VendorOrders /></ProtectedRoute>} />
                  <Route path="/inventory" element={<ProtectedRoute allowedRoles={['vendor', 'admin']}><VendorInventory /></ProtectedRoute>} />
                  <Route path="/analytics" element={<ProtectedRoute allowedRoles={['vendor', 'admin']}><VendorAnalytics /></ProtectedRoute>} />
                  <Route path="/ai" element={<ProtectedRoute allowedRoles={['vendor', 'admin']}><VendorAI /></ProtectedRoute>} />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </ToastProvider>
          </SocketProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
