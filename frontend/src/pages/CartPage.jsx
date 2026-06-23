import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import { Plus, Minus, Trash2, ArrowRight, ArrowLeft, ClipboardCheck, AlertCircle } from 'lucide-react';

const CartPage = () => {
  const { cartItems, addToCart, removeFromCart, removeProductCompletely, getCartTotal, clearCart } = useCart();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    setError('');
    setLoading(true);

    const itemsPayload = cartItems.map((item) => ({
      foodId: item.foodId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    try {
      const { data } = await api.post('/orders', { items: itemsPayload });
      // Clear Cart
      clearCart();
      // Redirect to Token Tracking page with orderId
      navigate(`/track/${data.order._id}`);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to place order. Try again.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const deliveryFee = 5; // Campus convenience fee
  const orderTotal = getCartTotal();
  const grandTotal = orderTotal + deliveryFee;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-sans text-3xl font-extrabold text-gray-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-gray-500 text-sm mt-1">Review items in your tray</p>
        </div>
        <Link to="/menu" className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
          <ArrowLeft size={16} />
          Back to Menu
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-500">
          <p className="text-sm font-medium">Your food tray is empty.</p>
          <Link
            to="/menu"
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-500/10 hover:bg-brand-600 transition-all duration-200"
          >
            Add Food Items
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Items List (Left Columns) */}
          <div className="md:col-span-2 space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 p-3.5 text-xs font-medium text-red-600">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {cartItems.map((item) => (
              <div
                key={item.foodId}
                className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                {/* Product Info */}
                <div className="flex items-center gap-3">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
                    alt={item.name}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm leading-snug">{item.name}</h3>
                    <span className="block text-xs font-semibold text-gray-400 mt-0.5">₹{item.price} each</span>
                  </div>
                </div>

                {/* Adjustments & Delete */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2.5 bg-gray-50 rounded-lg p-0.5 border border-gray-100">
                    <button
                      onClick={() => removeFromCart(item.foodId)}
                      className="flex h-6.5 w-6.5 items-center justify-center rounded bg-white text-gray-500 hover:text-brand-500 transition-colors shadow-sm"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-4 text-center text-xs font-bold text-gray-700">{item.quantity}</span>
                    <button
                      onClick={() => addToCart({ _id: item.foodId, name: item.name, price: item.price, image: item.image })}
                      className="flex h-6.5 w-6.5 items-center justify-center rounded bg-white text-gray-500 hover:text-brand-500 transition-colors shadow-sm"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeProductCompletely(item.foodId)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Box (Right Column) */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-100/40 h-fit">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-1.5">
              <ClipboardCheck size={18} className="text-brand-500" />
              Bill Details
            </h2>

            <div className="space-y-3 border-b border-gray-100 pb-4 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-gray-800">₹{orderTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Convenience Fee</span>
                <span className="font-semibold text-gray-800">₹{deliveryFee}</span>
              </div>
            </div>

            <div className="flex justify-between items-center py-4 mb-6">
              <span className="font-bold text-gray-800">To Pay</span>
              <span className="text-xl font-black text-brand-600">₹{grandTotal}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-amber-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 transition-all duration-200"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Place Order
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
