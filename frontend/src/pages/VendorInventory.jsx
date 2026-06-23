import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Check, Edit2, Archive, AlertCircle, ShoppingBag, Trash2, Power } from 'lucide-react';

const VendorInventory = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add Item state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Breakfast',
    price: '',
    stock: '',
    image: '',
    availability: true,
  });

  const fetchInventory = async () => {
    try {
      const { data } = await api.get('/foods');
      setFoods(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch food inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleToggleAvailability = async (id, currentVal) => {
    setError('');
    setSuccess('');
    try {
      const { data } = await api.put(`/foods/${id}`, { availability: !currentVal });
      setFoods(prev => prev.map(f => f._id === id ? data : f));
      setSuccess('Availability status updated.');
    } catch (err) {
      setError('Failed to update availability.');
    }
  };

  const handleStockUpdate = async (id, newStock) => {
    if (newStock < 0) return;
    setError('');
    setSuccess('');
    try {
      const { data } = await api.put(`/foods/${id}`, { stock: newStock });
      setFoods(prev => prev.map(f => f._id === id ? data : f));
    } catch (err) {
      setError('Failed to update stock level.');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { name, category, price, stock, image, availability } = newItem;
    if (!name || !price || !stock) {
      setError('Please fill in Name, Price, and Stock.');
      return;
    }

    try {
      const defaultImages = {
        Breakfast: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
        Lunch: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
        Snacks: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
        Drinks: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
      };

      const imageUrl = image || defaultImages[category];

      const { data } = await api.post('/foods', {
        name,
        category,
        price: Number(price),
        stock: Number(stock),
        availability: availability,
        image: imageUrl,
      });

      setFoods(prev => [...prev, data]);
      setSuccess('Food item added successfully.');
      setShowAddForm(false);
      setNewItem({
        name: '',
        category: 'Breakfast',
        price: '',
        stock: '',
        image: '',
        availability: true,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add food item.');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to remove this item from the catalog?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/foods/${id}`);
      setFoods(prev => prev.filter(f => f._id !== id));
      setSuccess('Food item removed successfully.');
    } catch (err) {
      setError('Failed to remove item.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-sans text-3xl font-extrabold text-gray-900 tracking-tight">
            Inventory Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage kitchen stock details and cafeteria listings</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 self-start rounded-2xl bg-brand-500 hover:bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-brand-500/10 transition-colors"
        >
          <Plus size={16} />
          Add Food Item
        </button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 p-3.5 text-xs font-medium text-red-600 animate-fade-in">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 p-3.5 text-xs font-medium text-emerald-600 animate-fade-in">
          <Check size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Add Item Form Drawer */}
      {showAddForm && (
        <div className="mb-8 rounded-3xl border border-gray-150 bg-white p-6 shadow-md animate-slide-up">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Add Menu Item</h2>
          <form onSubmit={handleAddSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Item Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Cheese Sandwich"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Category</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none bg-white"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Snacks">Snacks</option>
                <option value="Drinks">Drinks</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Price (₹)</label>
              <input
                type="number"
                required
                placeholder="e.g. 60"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Initial Stock</label>
              <input
                type="number"
                required
                placeholder="e.g. 50"
                value={newItem.stock}
                onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Image URL (Optional)</label>
              <input
                type="text"
                placeholder="Unsplash / standard web URL"
                value={newItem.image}
                onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="w-full rounded-xl bg-brand-500 hover:bg-brand-600 py-2.5 text-sm font-bold text-white shadow"
              >
                Save Item
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="w-1/2 rounded-xl bg-gray-50 border border-gray-250 py-2.5 text-sm font-bold text-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of stock */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
        </div>
      ) : foods.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-400">
          No food inventory listed. Add items to start.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {foods.map((food) => (
            <div
              key={food._id}
              className={`flex flex-col justify-between rounded-3xl border p-4 bg-white shadow-sm transition-all duration-300 ${
                !food.availability || food.stock === 0 ? 'border-red-100 bg-red-50/10' : 'border-gray-100 hover:shadow-md'
              }`}
            >
              <div>
                {/* Image */}
                <div className="relative h-32 w-full rounded-xl bg-gray-100 overflow-hidden mb-3">
                  <img
                    src={food.image}
                    alt={food.name}
                    className="h-full w-full object-cover"
                  />
                  {food.stock <= 5 && food.stock > 0 && (
                    <span className="absolute left-2.5 top-2.5 rounded bg-amber-500 px-2 py-0.5 text-[9px] font-extrabold text-white uppercase tracking-wider">
                      Low stock
                    </span>
                  )}
                  {food.stock === 0 && (
                    <span className="absolute left-2.5 top-2.5 rounded bg-red-600 px-2 py-0.5 text-[9px] font-extrabold text-white uppercase tracking-wider">
                      Sold out
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{food.name}</h3>
                    <span className="inline-block text-[9px] font-extrabold text-gray-400 uppercase tracking-wider bg-gray-100 px-1.5 py-0.5 rounded mt-0.5">
                      {food.category}
                    </span>
                  </div>
                  <span className="font-extrabold text-brand-600 text-sm">₹{food.price}</span>
                </div>
              </div>

              {/* Operations */}
              <div className="mt-5 border-t border-gray-50 pt-4 space-y-3">
                {/* Stock Controls */}
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Stock Quantity</span>
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-0.5">
                    <button
                      onClick={() => handleStockUpdate(food._id, food.stock - 1)}
                      className="h-6 w-6 flex items-center justify-center rounded bg-white font-bold text-gray-600 shadow-sm"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-bold text-gray-800">{food.stock}</span>
                    <button
                      onClick={() => handleStockUpdate(food._id, food.stock + 1)}
                      className="h-6 w-6 flex items-center justify-center rounded bg-white font-bold text-gray-600 shadow-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex justify-between items-center gap-2 pt-1.5">
                  {/* Availability Toggle */}
                  <button
                    onClick={() => handleToggleAvailability(food._id, food.availability)}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-extrabold uppercase rounded-lg border transition-colors ${
                      food.availability
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    <Power size={10} />
                    {food.availability ? 'Available' : 'Disabled'}
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteItem(food._id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 border border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 text-gray-400 transition-colors"
                    title="Remove food item"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorInventory;
