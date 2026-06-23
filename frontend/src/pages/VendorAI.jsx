import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { BrainCircuit, Sparkles, TrendingUp, AlertCircle, ShoppingBag, HelpCircle } from 'lucide-react';

const VendorAI = () => {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const { data } = await api.get('/prediction');
        setPredictions(data);
      } catch (err) {
        console.error('Error fetching AI model insights:', err);
        setError('Could not establish connection to the AI prediction engine.');
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !predictions) {
    return (
      <div className="mx-auto max-w-xl text-center py-16 px-4">
        <div className="flex h-12 w-12 items-center justify-center bg-red-50 rounded-full text-red-500 mx-auto mb-4">
          <AlertCircle size={24} />
        </div>
        <h2 className="text-lg font-bold text-gray-800">AI Server Connection Failed</h2>
        <p className="text-gray-500 text-sm mt-1 mb-6">
          Make sure your Python FastAPI service is running locally on port 8000.
        </p>
        <button
          onClick={() => { setLoading(true); setError(''); }}
          className="rounded-xl bg-brand-500 hover:bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/10"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { tomorrowLunchRush, peakHours, popularItemsPrediction } = predictions;
  const maxHourOrders = peakHours.reduce((max, h) => (h.orders > max ? h.orders : max), 10);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-sans text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <BrainCircuit className="text-brand-500 animate-pulse" size={32} />
          AI Demand Predictions
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Machine Learning models trained on historical cafeteria sales predict future student rushes
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Columns (AI Cards) */}
        <div className="md:col-span-2 space-y-6">
          {/* Main Prediction Banner Card */}
          <div className="relative overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-tr from-brand-500 to-amber-500 p-8 text-white shadow-xl shadow-brand-500/20">
            {/* Design circle */}
            <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-white/5" />
            <div className="absolute top-1/2 left-1/3 h-24 w-24 rounded-full bg-white/5 animate-pulse" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md text-xs">
                  🔮
                </span>
                <span className="text-xs uppercase font-bold tracking-widest text-brand-100">Tomorrow's Prediction</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="block text-brand-100 text-xs font-semibold">Expected Lunch Rush Orders</span>
                  <span className="text-5xl font-black tracking-tight">{tomorrowLunchRush.expectedOrders}</span>
                  <span className="block text-[10px] text-brand-200 mt-1 uppercase font-bold tracking-wider">
                    Total day orders: {tomorrowLunchRush.totalDayOrders}
                  </span>
                </div>
                <div className="sm:border-l sm:border-white/10 sm:pl-6 flex flex-col justify-end">
                  <span className="block text-brand-100 text-xs font-semibold">AI Smart Advice</span>
                  <p className="text-sm font-bold leading-relaxed mt-1">{tomorrowLunchRush.recommendation}</p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 text-xs text-brand-100 flex items-center gap-2">
                <Sparkles size={14} className="shrink-0" />
                <span>{tomorrowLunchRush.details}</span>
              </div>
            </div>
          </div>

          {/* Peak Hours predictions (SVG chart) */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Predicted Demand Curve (Tomorrow)</h2>
            <div className="flex items-end justify-between h-44 gap-1.5 pt-4 border-b border-gray-100">
              {peakHours.map((hour) => {
                const heightPercentage = (hour.orders / maxHourOrders) * 90;
                const isPeak = hour.orders === maxHourOrders;
                return (
                  <div key={hour.hour} className="flex flex-col items-center flex-1 group">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md mb-1.5 absolute translate-y-[-30px]">
                      {hour.orders}
                    </span>
                    <div
                      className={`w-full max-w-[24px] rounded-t-md transition-all duration-300 ${
                        isPeak 
                          ? 'bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/10' 
                          : 'bg-brand-300 group-hover:bg-brand-500'
                      }`}
                      style={{ height: `${Math.max(8, heightPercentage)}%` }}
                    />
                    <span className="text-[8px] text-gray-400 font-bold uppercase mt-2 select-none truncate max-w-[32px]">
                      {hour.hour.replace(' ', '')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Suggested Inventory Prep */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-1.5">
              <ShoppingBag size={18} className="text-brand-500" />
              Kitchen Scaling Suggestion
            </h2>
            <p className="text-gray-400 text-xs mb-6 leading-relaxed">
              Based on predicted counts for tomorrow, scale ingredients to optimize inventory and eliminate waste.
            </p>

            <div className="space-y-4">
              {popularItemsPrediction.map((item) => (
                <div key={item.name} className="flex justify-between items-center text-xs">
                  <div>
                    <span className="block font-bold text-gray-700">{item.name}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Recommended stock</span>
                  </div>
                  <span className="font-extrabold text-brand-600 bg-brand-50 border border-brand-100 rounded-lg px-3 py-1.5 text-sm">
                    {item.predictedCount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <HelpCircle size={12} />
              How this works
            </span>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              QueueLess AI fits a supervised Regression model that evaluates the calendar schedule (exams, breaks) against historical student traffic.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorAI;
