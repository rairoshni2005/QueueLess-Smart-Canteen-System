import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  LayoutDashboard, Utensils, ShoppingCart, Clock, 
  ClipboardList, Database, BarChart3, Brain 
} from 'lucide-react';

const BottomNav = () => {
  const { user } = useAuth();
  const { getCartCount } = useCart();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  const studentLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Home' },
    { to: '/menu', icon: Utensils, label: 'Menu' },
    { to: '/cart', icon: ShoppingCart, label: 'Cart', badge: getCartCount() },
    { to: '/history', icon: Clock, label: 'Orders' },
  ];

  const vendorLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Home' },
    { to: '/orders', icon: ClipboardList, label: 'Orders' },
    { to: '/inventory', icon: Database, label: 'Stock' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/ai', icon: Brain, label: 'AI' },
  ];

  const links = user.role === 'student' ? studentLinks : vendorLinks;

  return (
    <div className="bottom-nav md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {links.map(({ to, icon: Icon, label, badge }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200 ${
                active 
                  ? 'text-brand-600' 
                  : 'text-gray-400 dark:text-dark-muted hover:text-brand-500'
              }`}
            >
              <div className={`relative flex items-center justify-center h-8 w-8 rounded-xl transition-all duration-200 ${
                active ? 'bg-brand-50 dark:bg-brand-500/10' : ''
              }`}>
                <Icon size={20} />
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-dark-surface">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-bold transition-colors ${
                active ? 'text-brand-600' : ''
              }`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
