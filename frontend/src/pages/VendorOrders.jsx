import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { ClipboardList, Check, X, ChefHat, HeartHandshake, AlertCircle } from 'lucide-react';

const VendorOrders = () => {
  const socket = useSocket();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders log.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Listen to live socket events for incoming orders
  useEffect(() => {
    if (!socket) return;

    socket.on('orderCreated', ({ order }) => {
      // Append new order at the top
      setOrders(prev => [order, ...prev]);
    });

    socket.on('orderStatusChanged', ({ orderId, status }) => {
      setOrders(prev =>
        prev.map(o => (o._id === orderId ? { ...o, status } : o))
      );
    });

    return () => {
      socket.off('orderCreated');
      socket.off('orderStatusChanged');
    };
  }, [socket]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setError('');
    try {
      await api.put('/orders/status', { orderId, status: newStatus });
      // Update local state (socket listener handles synchronization, but we can optimistically update)
      setOrders(prev =>
        prev.map(o => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update order status.';
      setError(msg);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-blue-100 text-blue-800';
      case 'Preparing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Ready':
        return 'bg-emerald-100 text-emerald-800 animate-pulse';
      case 'Completed':
        return 'bg-gray-100 text-gray-500';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter orders: active vs history
  const activeOrders = orders.filter(o => ['Pending', 'Preparing', 'Ready'].includes(o.status));
  const pastOrders = orders.filter(o => ['Completed', 'Rejected'].includes(o.status));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-sans text-3xl font-extrabold text-gray-900 tracking-tight">
            Order Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Monitor live orders and update preparation status</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 p-3.5 text-xs font-medium text-red-600">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-12">
          {/* Active Orders Section */}
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-brand-500 animate-ping" />
              Active Orders ({activeOrders.length})
            </h2>

            {activeOrders.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-400">
                No active orders at the moment.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div>
                      {/* Header */}
                      <div className="flex justify-between items-center border-b border-gray-50 pb-3 mb-3">
                        <div>
                          <span className="text-lg font-black text-brand-600">Token {order.tokenNumber}</span>
                          <span className="block text-[10px] text-gray-400 font-semibold uppercase mt-0.5">
                            Customer: {order.userId?.name || 'Guest'} ({order.userId?.collegeId})
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs text-gray-600">
                            <span>{item.name} <span className="font-semibold text-gray-400">x{item.quantity}</span></span>
                            <span className="font-semibold text-gray-800">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                        <div className="flex justify-between border-t border-gray-50 pt-2 font-bold text-gray-800 text-sm">
                          <span>Total Amount</span>
                          <span>₹{order.totalAmount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions depending on state */}
                    <div className="mt-5 pt-4 border-t border-gray-50 flex gap-2">
                      {order.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'Preparing')}
                            className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-brand-500 hover:bg-brand-600 px-3 py-2.5 text-xs font-bold text-white transition-colors"
                          >
                            <ChefHat size={14} />
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'Rejected')}
                            className="flex items-center justify-center gap-1 rounded-xl bg-gray-50 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-3 py-2.5 text-xs font-bold text-gray-600 transition-colors"
                          >
                            <X size={14} />
                            Reject
                          </button>
                        </>
                      )}

                      {order.status === 'Preparing' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'Ready')}
                          className="w-full flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-[1.01] px-3 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-emerald-500/10"
                        >
                          <Check size={14} />
                          Mark Ready
                        </button>
                      )}

                      {order.status === 'Ready' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'Completed')}
                          className="w-full flex items-center justify-center gap-1 rounded-xl bg-gray-800 hover:bg-gray-900 px-3 py-2.5 text-xs font-bold text-white transition-colors"
                        >
                          <HeartHandshake size={14} />
                          Confirm Collection
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Orders History Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Completed / Rejected Log</h2>
            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 text-left">Token</th>
                      <th className="px-6 py-4 text-left">Customer</th>
                      <th className="px-6 py-4 text-left">Items</th>
                      <th className="px-6 py-4 text-left">Amount</th>
                      <th className="px-6 py-4 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-600">
                    {pastOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 font-bold text-gray-900">{order.tokenNumber}</td>
                        <td className="px-6 py-4">
                          <span className="block font-semibold text-gray-800">{order.userId?.name || 'Guest'}</span>
                          <span className="text-[10px] text-gray-400">{order.userId?.collegeId}</span>
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate">
                          {order.items.map(i => `${i.name} (${i.quantity})`).join(', ')}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">₹{order.totalAmount}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${getStatusBadgeClass(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {pastOrders.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                          No archived orders recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorOrders;
