import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { Search, Plus, Check, Star, Clock, Flame, X } from 'lucide-react';
import { SkeletonCard } from '../components/SkeletonLoader';

const categories = ['All', 'Breakfast', 'Lunch', 'Snacks', 'Drinks'];

const prepTimes = { Breakfast: '8', Lunch: '15', Snacks: '5', Drinks: '3' };
const ratings = { 'Veg Burger': 4.5, 'Masala Dosa': 4.8, 'Paneer Roll': 4.3, 'Cold Coffee': 4.7, 'Ginger Chai': 4.9, 'Special Veg Thali': 4.6, 'Hakka Noodles': 4.2, 'Cheese Sandwich': 4.1 };

const StarRow = ({ rating = 4 }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(s => {
      const filled = rating >= s;
      const half = !filled && rating >= s - 0.5;
      return (
        <Star key={s} size={11} className={filled || half ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-dark-border fill-gray-100 dark:fill-dark-border'} />
      );
    })}
    <span className="ml-1 text-[10px] font-bold text-gray-400">{rating}</span>
  </div>
);

const StudentMenu = () => {
  const [foods, setFoods] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [addedItems, setAddedItems] = useState({});
  const { addToCart } = useCart();
  const toast = useToast();

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/foods', {
          params: {
            category: selectedCategory !== 'All' ? selectedCategory : undefined,
            search: searchQuery || undefined,
          },
        });
        setFoods(data);
      } catch (err) {
        toast.error('Failed to load menu items.');
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  const handleAddToCart = (food) => {
    addToCart(food, 1);
    setAddedItems(prev => ({ ...prev, [food._id]: true }));
    toast.success(`${food.name} added to cart! 🛒`);
    setTimeout(() => setAddedItems(prev => ({ ...prev, [food._id]: false })), 1400);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 page-enter">
      <div className="mb-6">
        <h1 className="font-sans text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-dark-text tracking-tight">
          Explore Menu
        </h1>
        <p className="text-gray-400 dark:text-dark-muted text-sm mt-1">Freshly prepared campus meals & snacks</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search food..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-field pl-9 pr-4 h-11"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-brand-500 to-amber-500 text-white shadow-brand'
                  : 'bg-white dark:bg-dark-card text-gray-600 dark:text-dark-muted border border-gray-200 dark:border-dark-border hover:border-brand-200 dark:hover:border-brand-800 hover:text-brand-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : foods.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-bold text-gray-700 dark:text-dark-text">No items found</h3>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search or category filter.</p>
          <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} className="mt-4 btn-primary">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {foods.map((food, i) => {
            const rating = ratings[food.name] || 4.2;
            const prep = prepTimes[food.category] || '10';
            const isPopular = rating >= 4.5;
            const isLowStock = food.stock > 0 && food.stock <= 5;
            const isSoldOut = !food.availability || food.stock <= 0;

            return (
              <div
                key={food._id}
                className="group flex flex-col rounded-3xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Image */}
                <Link to={`/food/${food._id}`} className="relative block h-48 bg-gray-100 dark:bg-dark-elevated overflow-hidden">
                  <img
                    src={food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
                    alt={food.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Overlay badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {isPopular && (
                      <span className="flex items-center gap-1 rounded-lg bg-brand-500 px-2 py-0.5 text-[9px] font-extrabold text-white uppercase tracking-wider shadow-md">
                        <Flame size={9} /> Most Ordered
                      </span>
                    )}
                    <span className="rounded-lg bg-black/40 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-white uppercase">
                      {food.category}
                    </span>
                  </div>
                  {isLowStock && (
                    <span className="absolute top-3 right-3 rounded-lg bg-amber-500 px-2 py-0.5 text-[9px] font-extrabold text-white">
                      Only {food.stock} left!
                    </span>
                  )}
                  {isSoldOut && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                      <span className="rounded-xl bg-red-600 px-4 py-1.5 text-xs font-bold text-white uppercase tracking-wider">
                        Sold Out
                      </span>
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex flex-col flex-1 p-4">
                  <Link to={`/food/${food._id}`}>
                    <h3 className="font-bold text-gray-800 dark:text-dark-text text-base hover:text-brand-600 transition-colors line-clamp-1">{food.name}</h3>
                  </Link>

                  <StarRow rating={rating} />

                  <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400 dark:text-dark-muted font-semibold">
                    <span className="flex items-center gap-0.5">
                      <Clock size={10} /> {prep} mins
                    </span>
                    <span className="flex items-center gap-0.5">
                      👍 {Math.floor(rating * 200)} reviews
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4">
                    <span className="text-xl font-black text-brand-600">₹{food.price}</span>
                    <button
                      onClick={() => handleAddToCart(food)}
                      disabled={isSoldOut}
                      className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-300 ${
                        addedItems[food._id]
                          ? 'bg-emerald-500 text-white scale-95'
                          : isSoldOut
                          ? 'bg-gray-100 dark:bg-dark-elevated text-gray-400 cursor-not-allowed'
                          : 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-800 hover:bg-brand-500 hover:text-white hover:border-transparent hover:scale-105 active:scale-95'
                      }`}
                    >
                      {addedItems[food._id] ? <><Check size={13} /> Added!</> : <><Plus size={13} /> Add</>}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentMenu;
