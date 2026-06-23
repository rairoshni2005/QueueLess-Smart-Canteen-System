import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { BarChart3, TrendingUp, DollarSign, Calendar, Flame } from 'lucide-react';

const VendorAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await api.get('/analytics');
        setAnalyticsData(data);
      } catch (err) {
        console.error('Error fetching analytics details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  // Pre-configured popular catalog list
  const popularStats = [
    { name: '🍔 Veg Burger', orders: 154, percentage: 35, revenue: 9240 },
    { name: '🍛 Masala Dosa', orders: 110, percentage: 25, revenue: 8800 },
    { name: '☕ Cold Coffee', orders: 88, percentage: 20, revenue: 4400 },
    { name: '🌯 Paneer Roll', orders: 66, percentage: 15, revenue: 5940 },
  ];

  // Calculate highest revenue in history to scale SVG heights
  const history = analyticsData?.history || [];
  const maxRevenue = history.reduce((max, d) => (d.revenue > max ? d.revenue : max), 1000);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-sans text-3xl font-extrabold text-gray-900 tracking-tight">
          Sales Analytics
        </h1>
        <p className="text-gray-500 text-sm mt-1">Review revenue patterns and popular items statistics</p>
      </div>

      <div className="space-y-8">
        {/* Sales Chart (SVG based bar graph) */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">7-Day Sales Trend</h2>
              <span className="text-xs text-gray-400">Total earnings over the past week</span>
            </div>
            <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 text-[10px] font-bold px-2 py-0.5 rounded">
              <TrendingUp size={12} />
              +14.2% Growth
            </span>
          </div>

          {/* Graph bars representation */}
          <div className="flex items-end justify-between h-64 gap-3 pt-6 border-b border-gray-100">
            {history.map((day) => {
              const heightPercentage = Math.max(10, (day.revenue / maxRevenue) * 90);
              return (
                <div key={day.date} className="flex flex-col items-center flex-1 group">
                  {/* Tooltip on hover */}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-md mb-2 shadow absolute translate-y-[-45px]">
                    ₹{day.revenue}
                  </span>
                  
                  {/* Bar */}
                  <div
                    className="w-full max-w-[40px] rounded-t-xl bg-gradient-to-t from-brand-500 to-amber-400 transition-all duration-500 group-hover:scale-y-[1.03]"
                    style={{ height: `${heightPercentage}%` }}
                  />
                  
                  {/* Label */}
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-3">
                    {getDayName(day.date)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Breakdown details */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Selling Items list */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-1.5">
              <Flame size={18} className="text-orange-500" />
              Top Selling Dishes
            </h2>

            <div className="space-y-4">
              {popularStats.map((item) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-700">{item.name}</span>
                    <span className="font-semibold text-gray-400">{item.orders} orders ({item.percentage}%)</span>
                  </div>
                  {/* Progress Line */}
                  <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-amber-400 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic hours breakdown */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-1.5">
                <Calendar size={18} className="text-brand-500" />
                Hourly Traffic Volume
              </h2>
              
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100/50">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Breakfast</span>
                  <span className="text-sm font-bold text-gray-700 mt-1 block">9 AM - 10 AM</span>
                  <span className="text-[10px] text-brand-600 font-extrabold block mt-0.5">Moderate Rush</span>
                </div>
                <div className="bg-brand-50/50 rounded-2xl p-4 border border-brand-100/50">
                  <span className="block text-[10px] font-bold text-brand-600 uppercase tracking-wider">Lunch Peak</span>
                  <span className="text-sm font-bold text-brand-900 mt-1 block">12 PM - 2 PM</span>
                  <span className="text-[10px] text-rose-500 font-extrabold block mt-0.5">Heavy Rush</span>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100/50">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Snacks Peak</span>
                  <span className="text-sm font-bold text-gray-700 mt-1 block">5 PM - 6 PM</span>
                  <span className="text-[10px] text-amber-600 font-extrabold block mt-0.5">Steady Rush</span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-gray-200 p-4 flex items-center gap-3">
              <span className="text-xl">💡</span>
              <p className="text-xs text-gray-500 leading-relaxed">
                <span className="font-bold text-gray-700">Vendor Suggestion</span>: Deploying prep shifts before the 12:30 PM rush reduces average wait time by ~4 minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorAnalytics;
