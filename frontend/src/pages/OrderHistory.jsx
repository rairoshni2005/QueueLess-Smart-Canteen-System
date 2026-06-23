import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Calendar, Receipt, ChevronRight } from 'lucide-react';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/orders');
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders log:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'text-emerald-700 bg-emerald-50 border-emerald-100';
      case 'Rejected':
        return 'text-red-700 bg-red-50 border-red-100';
      case 'Ready':
        return 'text-blue-700 bg-blue-50 border-blue-100 animate-pulse';
      case 'Preparing':
        return 'text-amber-700 bg-amber-50 border-amber-100';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-150';
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-sans text-3xl font-extrabold text-gray-900 tracking-tight">
          Order History
        </h1>
        <p className="text-gray-500 text-sm mt-1">Review receipts of your previous cafeteria orders</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-500">
          <p className="text-sm font-medium">You haven't ordered anything yet.</p>
          <Link
            to="/menu"
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-500/10 hover:bg-brand-600 transition-all duration-200"
          >
            Browse Food Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-50 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-500">
                    <Receipt size={18} />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800 text-sm">Token {order.tokenNumber}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold mt-0.5">
                      <Calendar size={12} />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Amount and Link */}
                <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between">
                  <div className="sm:text-right">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Amount Paid</span>
                    <span className="text-base font-extrabold text-brand-600">₹{order.totalAmount}</span>
                  </div>
                  
                  {['Pending', 'Preparing', 'Ready'].includes(order.status) && (
                    <Link
                      to={`/track/${order._id}`}
                      className="flex h-9 items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-3 text-xs font-bold text-brand-700 hover:bg-brand-500 hover:text-white hover:border-transparent transition-all"
                    >
                      Track
                      <ChevronRight size={14} />
                    </Link>
                  )}
                </div>
              </div>

              {/* Items Summary list */}
              <div>
                <ul className="space-y-1.5">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between text-xs text-gray-500">
                      <span>
                        {item.name} <span className="font-semibold text-gray-400">x{item.quantity}</span>
                      </span>
                      <span>₹{item.price * item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
