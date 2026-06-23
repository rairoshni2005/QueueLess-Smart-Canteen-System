import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LogOut, ShoppingCart, Clock, Utensils, BarChart3, Brain, 
  ClipboardList, Database, LayoutDashboard, Sun, Moon, Menu, X 
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) => `flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
    isActive(path)
      ? 'bg-gradient-to-r from-brand-500 to-amber-500 text-white shadow-brand'
      : 'text-gray-600 dark:text-dark-muted hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10'
  }`;

  const studentLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Home' },
    { to: '/menu', icon: Utensils, label: 'Menu' },
    { to: '/history', icon: Clock, label: 'Orders' },
  ];

  const vendorLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/orders', icon: ClipboardList, label: 'Orders' },
    { to: '/inventory', icon: Database, label: 'Inventory' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/ai', icon: Brain, label: 'AI' },
  ];

  const links = user.role === 'student' ? studentLinks : vendorLinks;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 dark:border-dark-border bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-500 to-amber-500 text-xl shadow-brand transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
              🍽️
            </span>
            <span className="font-sans text-xl font-extrabold tracking-tight gradient-text hidden sm:block">
              QueueLess
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to} className={linkClass(to)}>
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 dark:border-dark-border text-gray-500 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-elevated transition-all duration-200"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            </button>

            {/* Cart (students only) */}
            {user.role === 'student' && (
              <Link to="/cart" className="relative hidden md:flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 dark:border-dark-border hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-500/10 text-gray-600 dark:text-dark-muted hover:text-brand-600 transition-all duration-200">
                <ShoppingCart size={18} />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-dark-surface animate-scale-in">
                    {getCartCount() > 9 ? '9+' : getCartCount()}
                  </span>
                )}
              </Link>
            )}

            {/* Profile + logout */}
            <div className="hidden md:flex items-center gap-2 border-l border-gray-200 dark:border-dark-border pl-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-500 to-amber-500 text-white text-sm font-bold shadow-brand shrink-0">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-xs font-semibold text-gray-800 dark:text-dark-text leading-tight">{user.name}</span>
                <span className="text-[9px] uppercase font-bold text-brand-600 tracking-wider">{user.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 dark:border-dark-border text-gray-500 dark:text-dark-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 transition-all duration-200 ml-1"
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 dark:border-dark-border text-gray-600 dark:text-dark-muted"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-dark-border bg-white dark:bg-dark-surface px-4 py-4 space-y-1 animate-fade-in">
          {links.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                isActive(to)
                  ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600'
                  : 'text-gray-600 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-elevated'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100 dark:border-dark-border mt-2">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut size={16} />
              Log Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
