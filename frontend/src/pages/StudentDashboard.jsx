import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';
import {
  Utensils, Timer, Users, Zap, ChevronRight, Star, ArrowRight,
  Clock, Award, TrendingUp, Coffee, Sun, Sunset, Moon, Gift, ShoppingBag
} from 'lucide-react';
import { SkeletonCard, SkeletonList } from '../components/SkeletonLoader';

// Animated counter hook
const useCounter = (target, duration = 1200) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return count;
};

// Time of day helper
const getTimeOfDay = () => {
  const h = new Date().getHours();
  if (h < 11) return { label: 'Morning', icon: Sun, category: 'Breakfast', color: 'text-amber-500' };
  if (h < 15) return { label: 'Afternoon', icon: Sunset, category: 'Lunch', color: 'text-orange-500' };
  return { label: 'Evening', icon: Moon, category: 'Snacks', color: 'text-indigo-500' };
};

// Crowd status calculation
const getCrowdInfo = (queueLength) => {
  if (queueLength <= 2) return {
    label: 'Low Crowd', level: 'low', dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800',
    time: `${Math.max(3, queueLength * 2 + 3)} mins`,
    kitchenStatus: 'Preparing Fast 🔥',
    activeOrders: Math.max(2, queueLength * 3),
  };
  if (queueLength <= 5) return {
    label: 'Medium Crowd', level: 'medium', dot: 'bg-amber-500',
    badge: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800',
    time: `${queueLength * 3 + 5} mins`,
    kitchenStatus: 'Normal Speed ⚡',
    activeOrders: queueLength * 8,
  };
  return {
    label: 'High Crowd', level: 'high', dot: 'bg-red-500',
    badge: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800',
    time: `${queueLength * 4 + 10} mins`,
    kitchenStatus: 'High Rush 🚨',
    activeOrders: queueLength * 12,
  };
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [activeOrder, setActiveOrder] = useState(null);
  const [queueInfo, setQueueInfo] = useState(null);
  const [queueLength, setQueueLength] = useState(0);
  const [popularItems, setPopularItems] = useState([]);
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [rewards, setRewards] = useState({ points: 0, badges: [] });
  const [loading, setLoading] = useState(true);
  const timeOfDay = getTimeOfDay();
  const TimeIcon = timeOfDay.icon;
  const crowd = getCrowdInfo(queueLength);
  const animatedOrders = useCounter(crowd.activeOrders, 1000);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [foodsRes, ordersRes, queueRes, rewardsRes] = await Promise.all([
        api.get('/foods'),
        api.get('/orders'),
        api.get('/queue'),
        api.get('/feedback/rewards').catch(() => ({ data: { user: { points: 0, badges: [] } } })),
      ]);

      // Smart recommendations: show items from recommended category by time of day
      const allFoods = foodsRes.data;
      const byTime = allFoods.filter(f => f.category === timeOfDay.category && f.availability);
      setRecommendedItems(byTime.length >= 2 ? byTime.slice(0, 3) : allFoods.filter(f => f.availability).slice(0, 3));
      setPopularItems(allFoods.filter(f => f.availability).slice(0, 4));

      const activeOrd = ordersRes.data.find(o => ['Pending', 'Preparing', 'Ready'].includes(o.status));
      setActiveOrder(activeOrd);

      setQueueLength(queueRes.data.length);
      if (activeOrd) {
        const qd = queueRes.data.find(q => q.orderId?._id === activeOrd._id);
        setQueueInfo(qd);
      }

      const rData = rewardsRes.data?.user;
      if (rData) setRewards({ points: rData.points || 0, badges: rData.badges || [] });
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  }, [timeOfDay.category]);

  useEffect(() => { fetchDashboardData(); }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('queueUpdate', (freshQueue) => {
      setQueueLength(freshQueue.length);
      if (activeOrder) {
        const qd = freshQueue.find(q => q.orderId?._id === activeOrder._id);
        setQueueInfo(qd);
      }
    });
    socket.on('orderStatusChanged', ({ orderId, status }) => {
      if (activeOrder?._id === orderId) {
        setActiveOrder(prev => prev ? { ...prev, status } : null);
        if (['Completed', 'Rejected'].includes(status)) { setActiveOrder(null); setQueueInfo(null); }
      }
    });
    return () => { socket.off('queueUpdate'); socket.off('orderStatusChanged'); };
  }, [socket, activeOrder]);

  const peopleAhead = queueInfo?.position ? queueInfo.position - 1 : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6 page-enter">

      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-gray-500 dark:text-dark-muted text-xs font-semibold mb-1">
            <TimeIcon size={14} className={timeOfDay.color} />
            Good {timeOfDay.label}!
          </div>
          <h1 className="font-sans text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-dark-text tracking-tight">
            Hey {user?.name.split(' ')[0]} 👋
          </h1>
        </div>
        {/* Reward Points Badge */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl px-3 py-1.5">
            <Gift size={14} className="text-amber-500" />
            <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400">{rewards.points} pts</span>
          </div>
          {rewards.badges.length > 0 && (
            <span className="text-[9px] text-gray-400 font-bold">{rewards.badges[0]}</span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <SkeletonList rows={2} />
          <div className="grid sm:grid-cols-3 gap-4">
            {[0,1,2].map(i => <SkeletonCard key={i} />)}
          </div>
        </div>
      ) : (
        <>
          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { to: '/menu', icon: '🍕', label: 'Order Food', color: 'from-brand-500 to-amber-500' },
              { to: activeOrder ? `/track/${activeOrder._id}` : '/history', icon: '⚡', label: 'Track Queue', color: 'from-blue-500 to-indigo-500' },
              { to: '/menu', icon: '📋', label: 'View Menu', color: 'from-emerald-500 to-teal-500' },
            ].map(({ to, icon, label, color }) => (
              <Link
                key={label}
                to={to}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-4 bg-gradient-to-br ${color} text-white shadow-md hover:scale-[1.04] active:scale-[0.97] transition-all duration-200`}
              >
                <span className="text-2xl">{icon}</span>
                <span className="text-[10px] font-extrabold tracking-wider uppercase">{label}</span>
              </Link>
            ))}
          </div>

          {/* Live Cafeteria Status Card */}
          <div className={`rounded-3xl border bg-white dark:bg-dark-card p-6 shadow-card overflow-hidden relative ${
            crowd.level === 'high' ? 'border-red-100 dark:border-red-900/40' :
            crowd.level === 'medium' ? 'border-amber-100 dark:border-amber-900/40' :
            'border-emerald-100 dark:border-emerald-900/40'
          }`}>
            {/* Background glow */}
            <div className={`absolute inset-0 opacity-[0.03] pointer-events-none rounded-3xl ${
              crowd.level === 'high' ? 'bg-red-500' :
              crowd.level === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏫</span>
                <h2 className="font-bold text-gray-800 dark:text-dark-text">Campus Cafeteria</h2>
              </div>
              <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${crowd.badge}`}>
                <span className={`h-2 w-2 rounded-full ${crowd.dot} ${crowd.level === 'high' ? 'animate-ping' : 'animate-pulse'}`} />
                {crowd.label}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-2xl bg-gray-50 dark:bg-dark-elevated p-3 text-center">
                <Users size={18} className="text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400 font-medium">Active Orders</p>
                <p className="text-xl font-black text-gray-800 dark:text-dark-text">{animatedOrders}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 dark:bg-dark-elevated p-3 text-center">
                <Timer size={18} className="text-brand-500 mx-auto mb-1" />
                <p className="text-xs text-gray-400 font-medium">Est. Wait</p>
                <p className="text-xl font-black text-brand-600">{crowd.time}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 dark:bg-dark-elevated p-3 text-center">
                <Zap size={18} className="text-amber-500 mx-auto mb-1" />
                <p className="text-xs text-gray-400 font-medium">Kitchen</p>
                <p className="text-xs font-bold text-gray-700 dark:text-dark-text mt-1">{crowd.kitchenStatus}</p>
              </div>
            </div>

            {/* Best visit insight */}
            <div className="mt-4 rounded-2xl border border-dashed border-gray-200 dark:border-dark-border bg-gray-50/50 dark:bg-dark-elevated/50 p-3 flex items-center gap-2">
              <span className="text-base">💡</span>
              <p className="text-xs text-gray-500 dark:text-dark-muted">
                <span className="font-bold text-gray-700 dark:text-dark-text">Best visit time today: </span>
                {crowd.level === 'high' ? 'Come back at 2:30 PM – crowd expected to ease.' :
                 crowd.level === 'medium' ? 'Visiting after 3 PM gives you the shortest wait.' :
                 'Great time to visit! Minimal queue right now.'}
              </p>
            </div>
          </div>

          {/* Active Order Tracker */}
          {activeOrder && (
            <div className="rounded-3xl bg-gradient-to-tr from-brand-500 to-amber-500 p-6 text-white shadow-brand-lg animate-fade-in-up relative overflow-hidden">
              <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-white/5" />
              <div className="absolute bottom-2 left-1/4 h-16 w-16 rounded-full bg-white/5 animate-float" />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs text-orange-100 font-bold uppercase tracking-widest mb-1">Your Active Order</p>
                    <p className="text-4xl font-black tracking-tight">{activeOrder.tokenNumber}</p>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                    activeOrder.status === 'Ready' ? 'bg-white text-emerald-600 animate-pulse' : 'bg-white/20 text-white'
                  }`}>
                    {activeOrder.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm border-t border-white/20 pt-4">
                  <div>
                    <p className="text-orange-100 text-[10px] font-bold uppercase">People Ahead</p>
                    <p className="text-2xl font-extrabold">{peopleAhead === 0 ? "You're Next!" : peopleAhead}</p>
                  </div>
                  {queueInfo?.estimatedTime && (
                    <div>
                      <p className="text-orange-100 text-[10px] font-bold uppercase">Est. Wait</p>
                      <p className="text-2xl font-extrabold">{queueInfo.estimatedTime}m</p>
                    </div>
                  )}
                  <div className="ml-auto">
                    <Link
                      to={`/track/${activeOrder._id}`}
                      className="flex items-center gap-1.5 rounded-2xl bg-white text-brand-700 px-4 py-2 text-xs font-extrabold hover:bg-orange-50 active:scale-95 transition-all"
                    >
                      Track Live
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Food Recommendations */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 dark:text-dark-text flex items-center gap-1.5">
                <span>🍽️</span>
                Recommended for you
                <span className="text-xs font-semibold text-gray-400 dark:text-dark-muted">({timeOfDay.label})</span>
              </h2>
              <Link to="/menu" className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-0.5">
                See all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedItems.map((item, i) => (
                <Link
                  key={item._id}
                  to={`/food/${item._id}`}
                  className="group flex items-center gap-3 rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-3 hover:shadow-card-hover hover:border-brand-100 dark:hover:border-brand-900 transition-all duration-300"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    {i === 0 && (
                      <span className="absolute top-0 left-0 text-[8px] font-black bg-brand-500 text-white px-1 py-0.5 rounded-br-lg">🔥 HOT</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 dark:text-dark-text text-sm truncate">{item.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={10} className={s <= 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-dark-border fill-gray-200 dark:fill-dark-border'} />
                      ))}
                    </div>
                    <p className="text-brand-600 font-extrabold text-sm mt-1">₹{item.price}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 dark:text-dark-border group-hover:text-brand-500 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Rewards Panel */}
          {rewards.points > 0 || rewards.badges.length > 0 ? (
            <div className="rounded-3xl border border-amber-100 dark:border-amber-900/40 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-xl shadow-md shrink-0 animate-bounce-slow">
                🏅
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Reward Points</p>
                <p className="text-xl font-black text-gray-800 dark:text-dark-text">{rewards.points} <span className="text-sm font-semibold text-gray-400">pts</span></p>
                {rewards.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {rewards.badges.map(b => (
                      <span key={b} className="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded-full">{b}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <TrendingUp size={20} className="text-amber-400 ml-auto" />
                <p className="text-[10px] text-amber-600 font-bold mt-1">Earn more by<br />ordering off-peak</p>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card p-5 flex items-center gap-4">
              <span className="text-2xl">🎁</span>
              <div>
                <p className="text-sm font-bold text-gray-700 dark:text-dark-text">Earn Reward Points!</p>
                <p className="text-xs text-gray-400 dark:text-dark-muted">Place your first order to start earning points and unlock badges.</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentDashboard;
