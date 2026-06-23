import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { ClipboardList, IndianRupee, Clock, ArrowRight, UserCheck, AlertTriangle } from 'lucide-react';

const VendorDashboard = () => {
  const socket = useSocket();
  
  const [metrics, setMetrics] = useState({ orders: 0, revenue: 0, peakHour: '12 PM' });
  const [activeQueueCount, setActiveQueueCount] = useState(0);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch metrics from Analytics
      const analyticsRes = await api.get('/analytics');
      setMetrics(analyticsRes.data.today);

      // 2. Fetch queue sizes
      const queueRes = await api.get('/queue');
      setActiveQueueCount(queueRes.data.length);

      // 3. Fetch foods with low stock (< 5)
      const foodsRes = await api.get('/foods');
      const lowStock = foodsRes.data.filter(f => f.stock <= 5);
      setLowStockItems(lowStock);
    } catch (error) {
      console.error('Error loading vendor dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Sync metrics live when orders are completed or new ones placed
  useEffect(() => {
    if (!socket) return;

    socket.on('queueUpdate', (freshQueue) => {
      setActiveQueueCount(freshQueue.length);
    });

    socket.on('orderCreated', () => {
      fetchDashboardData(); // Refresh metrics
    });

    socket.on('orderStatusChanged', () => {
      fetchDashboardData(); // Refresh metrics
    });

    return () => {
      socket.off('queueUpdate');
      socket.off('orderCreated');
      socket.off('orderStatusChanged');
    };
  }, [socket]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-sans text-3xl font-extrabold text-gray-900 tracking-tight">
          Vendor Console
        </h1>
        <p className="text-gray-500 text-sm mt-1">Manage cafeteria orders and monitor metrics in real-time</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Metrics Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Today's Orders */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Today's Orders</span>
                <span className="text-2xl font-black text-gray-800 mt-1">{metrics.orders}</span>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <ClipboardList size={22} />
              </span>
            </div>

            {/* Today's Revenue */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Today's Revenue</span>
                <span className="text-2xl font-black text-gray-800 mt-1">₹{metrics.revenue}</span>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <IndianRupee size={22} />
              </span>
            </div>

            {/* Peak Hours */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Peak Time</span>
                <span className="text-2xl font-black text-gray-800 mt-1">{metrics.peakHour}</span>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Clock size={22} />
              </span>
            </div>

            {/* Queue Length */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Active Queue</span>
                <span className="text-2xl font-black text-gray-800 mt-1">{activeQueueCount} items</span>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <UserCheck size={22} />
              </span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Queue overview panel */}
            <div className="md:col-span-2 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Live Orders Queue</h2>
                <p className="text-gray-500 text-xs leading-relaxed mb-6">
                  Check ticket states and update prep milestones. Use the dedicated Orders tab for full operations.
                </p>
              </div>
              <div className="flex justify-end pt-4 border-t border-gray-50">
                <Link
                  to="/orders"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
                >
                  Manage Live Queue Console
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Low stock alerts panel */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-1.5">
                <AlertTriangle size={18} className="text-amber-500" />
                Stock Warnings
              </h2>

              {lowStockItems.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">All food stock levels are healthy.</p>
              ) : (
                <div className="space-y-3 max-h-56 overflow-y-auto">
                  {lowStockItems.map(item => (
                    <div key={item._id} className="flex justify-between items-center bg-gray-50 rounded-xl p-3 border border-gray-100/50">
                      <div>
                        <span className="block text-xs font-bold text-gray-700">{item.name}</span>
                        <span className="text-[10px] font-semibold text-gray-400 uppercase">{item.category}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.stock === 0 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.stock === 0 ? 'Out of stock' : `${item.stock} left`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <Link to="/inventory" className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline">
                  Update inventory levels
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
