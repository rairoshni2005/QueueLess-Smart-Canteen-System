import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import { ArrowLeft, Plus, Minus, ShoppingBag, Check, Award, Flame, Snowflake } from 'lucide-react';

const FoodDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchFoodDetails = async () => {
      try {
        const { data } = await api.get(`/foods/${id}`);
        setFood(data);
      } catch (err) {
        console.error('Error fetching food details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFoodDetails();
  }, [id]);

  const handleQuantityIncrease = () => {
    if (food && quantity < food.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    if (!food) return;
    addToCart(food, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!food) {
    return (
      <div className="mx-auto max-w-xl text-center py-16 px-4">
        <h2 className="text-xl font-bold text-gray-800">Food item not found</h2>
        <p className="text-gray-500 text-sm mt-1">This product might have been removed by the vendor.</p>
        <Link to="/menu" className="mt-4 inline-block text-brand-500 font-bold hover:underline">
          Go back to Menu
        </Link>
      </div>
    );
  }

  // Pre-configured custom details based on food name for premium feel
  const getDescriptions = (name) => {
    switch (name) {
      case 'Veg Burger':
        return {
          desc: 'A premium golden crispy vegetable patty stacked inside toasted sesame brioche buns. Layered with fresh romaine lettuce, sliced vine-ripened tomatoes, crunchy pickles, and our signature creamy herb mayo.',
          ingredients: ['Crispy Veggie Patty', 'Toasted Sesame Bun', 'Fresh Lettuce', 'Tomato Slices', 'Signature Herb Mayo'],
          stats: ['Hot & Fresh', 'High Fiber', 'Pure Veg'],
        };
      case 'Masala Dosa':
        return {
          desc: 'A classic South Indian thin, crispy crepe made from fermented rice-and-lentil batter. Stuffed with a savory potato masala filling cooked with mustard seeds, curry leaves, and turmeric. Served with hot Sambhar and fresh coconut chutney.',
          ingredients: ['Fermented Rice Batter', 'Spiced Potato Masala', 'Fresh Coconut Chutney', 'Hot Sambhar Soup'],
          stats: ['Crispy Crepe', 'Low Gluten', 'Traditional Recipie'],
        };
      case 'Cold Coffee':
        return {
          desc: 'Rich, full-bodied espresso shots blended with chilled creamy milk, chocolate syrup, and a scoop of vanilla ice cream. Topped with a sprinkle of roasted cocoa dust. The perfect refresher for breaks.',
          ingredients: ['Premium Espresso', 'Chilled Full Cream Milk', 'Chocolate Sauce', 'Cocoa Dust Coating'],
          stats: ['Chilled', 'Caffeine Kick', 'Sweet Treat'],
        };
      default:
        return {
          desc: `Freshly prepared delicious ${name}. Perfectly portioned and made under clean standards for healthy campus dining. Check details or order yours hot!`,
          ingredients: ['Fresh Ingredients', 'Healthy Spices', 'Zero Preservatives'],
          stats: ['Made to order', 'Quality checked'],
        };
    }
  };

  const extra = getDescriptions(food.name);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-brand-500 transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Main layout */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Column: Image */}
        <div className="relative h-80 md:h-[450px] w-full overflow-hidden rounded-3xl bg-gray-100 shadow-lg">
          <img
            src={food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
            alt={food.name}
            className="h-full w-full object-cover"
          />
          <span className="absolute left-4 top-4 rounded-xl bg-black/40 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white uppercase tracking-wider">
            {food.category}
          </span>
          {food.stock <= 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <span className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white uppercase tracking-wider">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Info */}
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="font-sans text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              {food.name}
            </h1>
            
            {/* Price Tag */}
            <span className="text-3xl font-black text-brand-600">₹{food.price}</span>

            {/* Badges/Tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              {extra.stats.map((stat, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-lg bg-gray-50 border border-gray-100 px-3 py-1 text-xs font-bold text-gray-500 uppercase">
                  {stat.includes('Chilled') ? <Snowflake size={12} className="text-blue-500" /> : <Flame size={12} className="text-orange-500" />}
                  {stat}
                </span>
              ))}
            </div>

            {/* Description */}
            <div className="mt-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{extra.desc}</p>
            </div>

            {/* Ingredients */}
            <div className="mt-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Key Ingredients</h3>
              <ul className="grid grid-cols-2 gap-2">
                {extra.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quantity Selector and Add Button */}
          <div className="mt-8 border-t border-gray-100 pt-6 space-y-4">
            {food.stock > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-500">Select Quantity</span>
                <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={handleQuantityDecrease}
                    disabled={quantity <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-600 hover:text-brand-500 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-gray-800">{quantity}</span>
                  <button
                    onClick={handleQuantityIncrease}
                    disabled={quantity >= food.stock}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-600 hover:text-brand-500 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={food.stock <= 0}
              className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold shadow-lg transition-all duration-200 ${
                added
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                  : food.stock <= 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-brand-500 text-white shadow-brand-500/20 hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {added ? (
                <>
                  <Check size={18} />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingBag size={18} />
                  Add to Cart • ₹{food.price * quantity}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetails;
