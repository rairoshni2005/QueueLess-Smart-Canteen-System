import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { ArrowLeft, CheckCircle2, Circle, Star, Send, PartyPopper } from 'lucide-react';

// Journey Steps
const JOURNEY_STEPS = [
  { key: 'Pending', label: 'Order Placed', desc: 'Your order reached the kitchen' },
  { key: 'Preparing', label: 'Accepted', desc: 'Kitchen started preparing' },
  { key: 'Ready', label: 'Almost Ready', desc: 'Food is being finalized' },
  { key: 'Completed', label: 'Ready for Pickup', desc: 'Collect from the counter!' },
];

const statusIndex = { Pending: 0, Preparing: 1, Ready: 2, Completed: 3, Rejected: -1 };

// Countdown Timer Component
const CountdownTimer = ({ minutes }) => {
  const totalSeconds = minutes * 60;
  const [seconds, setSeconds] = useState(totalSeconds);
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    setSeconds(minutes * 60);
  }, [minutes]);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => setSeconds(s => {
      if (s <= 1) { clearInterval(timer); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  useEffect(() => {
    setUrgent(seconds <= 60);
  }, [seconds]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const pct = totalSeconds > 0 ? ((totalSeconds - seconds) / totalSeconds) * 100 : 100;

  return (
    <div className={`rounded-2xl p-4 text-center ${urgent ? 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40' : 'bg-gray-50 dark:bg-dark-elevated border border-gray-100 dark:border-dark-border'}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
        {seconds === 0 ? 'Food is Ready! 🎉' : 'Your food will be ready in'}
      </p>
      {seconds > 0 ? (
        <div className={`text-4xl font-black tabular-nums tracking-tight ${urgent ? 'text-red-500 animate-pulse' : 'text-brand-600'}`}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>
      ) : (
        <div className="text-2xl font-black text-emerald-600 animate-bounce-slow">Ready! 🎉</div>
      )}
      {/* Progress bar */}
      <div className="mt-3 h-1.5 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${urgent ? 'bg-red-500' : 'bg-gradient-to-r from-brand-500 to-amber-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// Feedback Modal
const FeedbackModal = ({ orderId, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post('/feedback', { orderId, rating, comment });
      toast.success(`Thank you for your feedback! +10 pts earned 🏅`);
      onSubmit();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border p-6 shadow-2xl animate-slide-up">
        <div className="flex flex-col items-center text-center mb-4">
          <div className="text-4xl mb-2 animate-bounce-slow"><PartyPopper /></div>
          <h3 className="text-lg font-extrabold text-gray-900 dark:text-dark-text">How was your food?</h3>
          <p className="text-xs text-gray-400 dark:text-dark-muted mt-1">Rate your experience and earn +10 reward points</p>
        </div>

        <div className="flex justify-center gap-2 mb-4">
          {[1,2,3,4,5].map(s => (
            <button
              key={s}
              onClick={() => setRating(s)}
              className="transition-transform duration-200 hover:scale-125 active:scale-95"
            >
              <Star size={28} className={s <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-dark-border fill-gray-200 dark:fill-dark-border'} />
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Any comments? (optional)"
          rows={2}
          className="input-field resize-none text-xs mb-4"
        />

        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1 text-xs py-2.5">
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary flex-1 text-xs py-2.5"
          >
            {submitting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <><Send size={13} /> Submit</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const TokenTracking = () => {
  const { id } = useParams();
  const socket = useSocket();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [queueItem, setQueueItem] = useState(null);
  const [currentServing, setCurrentServing] = useState('...');
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackDone, setFeedbackDone] = useState(false);
  const prevStatus = useRef(null);

  const fetchData = async () => {
    try {
      const [ordersRes, queueRes] = await Promise.all([api.get('/orders'), api.get('/queue')]);
      const target = ordersRes.data.find(o => o._id === id);
      setOrder(target);

      const tq = queueRes.data.find(q => q.orderId?._id === id);
      setQueueItem(tq);

      const serving = queueRes.data.find(q => q.status === 'Serving') || queueRes.data[0];
      setCurrentServing(serving?.orderId?.tokenNumber || 'None');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  useEffect(() => {
    if (!socket) return;
    socket.on('queueUpdate', (fq) => {
      const tq = fq.find(q => q.orderId?._id === id);
      setQueueItem(tq);
      const serving = fq.find(q => q.status === 'Serving') || fq[0];
      setCurrentServing(serving?.orderId?.tokenNumber || 'None');
    });
    socket.on('orderStatusChanged', ({ orderId, status }) => {
      if (id === orderId) {
        setOrder(prev => prev ? { ...prev, status } : null);
        if (status === 'Ready' && prevStatus.current !== 'Ready') {
          toast.success('🎉 Your food is ready! Head to the counter!', 6000);
        }
        if (status === 'Completed' && !feedbackDone) {
          setTimeout(() => setShowFeedback(true), 800);
        }
        prevStatus.current = status;
      }
    });
    return () => { socket.off('queueUpdate'); socket.off('orderStatusChanged'); };
  }, [socket, id, feedbackDone]);

  if (loading) return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
    </div>
  );

  if (!order) return (
    <div className="mx-auto max-w-md text-center py-16 px-4">
      <div className="text-5xl mb-4">🔍</div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text">Order not found</h2>
      <Link to="/" className="mt-4 inline-block text-brand-500 font-bold hover:underline">Go back Home</Link>
    </div>
  );

  const currStep = statusIndex[order.status] ?? 0;
  const peopleAhead = queueItem?.position ? queueItem.position - 1 : 0;
  const waitMins = queueItem?.estimatedTime || 0;

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-6 page-enter space-y-5">
      {showFeedback && !feedbackDone && (
        <FeedbackModal
          orderId={id}
          onClose={() => setShowFeedback(false)}
          onSubmit={() => { setShowFeedback(false); setFeedbackDone(true); }}
        />
      )}

      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 dark:text-dark-muted hover:text-brand-500 transition-colors">
        <ArrowLeft size={16} /> Dashboard
      </Link>

      {/* Token Badge */}
      <div className="rounded-3xl bg-gradient-to-tr from-brand-500 to-amber-500 p-6 text-white text-center shadow-brand-lg relative overflow-hidden">
        <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-white/5 animate-ping-slow" />
        <div className="absolute bottom-4 left-8 h-12 w-12 rounded-full bg-white/5 animate-float" />
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-orange-100 mb-1">Your Order Token</p>
        <p className="text-6xl font-black tracking-tight animate-scale-in">{order.tokenNumber}</p>
        <span className={`inline-flex items-center mt-3 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
          order.status === 'Ready' ? 'bg-white text-emerald-600 animate-pulse' :
          order.status === 'Completed' ? 'bg-white/20 text-white' : 'bg-white/20 text-white'
        }`}>
          {order.status === 'Completed' ? '✅ Collected' : order.status}
        </span>
      </div>

      {/* Countdown Timer */}
      {waitMins > 0 && !['Completed', 'Rejected'].includes(order.status) && (
        <CountdownTimer minutes={waitMins} />
      )}

      {/* Queue Stats Row */}
      {!['Completed', 'Rejected'].includes(order.status) && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border p-4 text-center">
            <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Currently Serving</p>
            <p className="text-2xl font-black text-gray-800 dark:text-dark-text">{currentServing}</p>
          </div>
          <div className="rounded-2xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-900 p-4 text-center">
            <p className="text-[10px] font-bold uppercase text-brand-500 mb-1">People Ahead</p>
            <p className="text-2xl font-black text-brand-700 dark:text-brand-400">
              {peopleAhead === 0 ? "You're Next!" : peopleAhead}
            </p>
          </div>
        </div>
      )}

      {/* Visual Order Journey */}
      <div className="rounded-3xl bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border p-6 shadow-card">
        <h3 className="text-sm font-bold text-gray-600 dark:text-dark-muted uppercase tracking-wider mb-5">Order Journey</h3>

        {order.status === 'Rejected' ? (
          <div className="flex flex-col items-center py-4 text-center gap-2">
            <span className="text-3xl">❌</span>
            <p className="font-bold text-gray-700 dark:text-dark-text">Order Rejected</p>
            <p className="text-xs text-gray-400 dark:text-dark-muted">The vendor could not fulfil this order. Please try again.</p>
            <Link to="/menu" className="btn-primary mt-2 text-xs px-4 py-2">Order Again</Link>
          </div>
        ) : (
          <div className="space-y-1">
            {JOURNEY_STEPS.map((step, i) => {
              const done = currStep > i;
              const active = currStep === i;
              return (
                <div key={step.key} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                      done ? 'bg-emerald-500 border-emerald-500 shadow-glow-green' :
                      active ? 'bg-brand-500 border-brand-500 shadow-brand animate-pulse' :
                      'bg-white dark:bg-dark-elevated border-gray-200 dark:border-dark-border'
                    }`}>
                      {done ? <CheckCircle2 size={16} className="text-white" /> :
                       active ? <div className="h-2.5 w-2.5 rounded-full bg-white animate-ping" /> :
                       <Circle size={14} className="text-gray-300 dark:text-dark-border" />}
                    </div>
                    {i < JOURNEY_STEPS.length - 1 && (
                      <div className={`w-0.5 h-8 transition-all duration-700 ${done ? 'bg-emerald-400' : 'bg-gray-150 dark:bg-dark-border'}`} />
                    )}
                  </div>
                  <div className={`pb-4 transition-all duration-300 ${active ? 'opacity-100' : done ? 'opacity-60' : 'opacity-30'}`}>
                    <p className={`text-sm font-bold ${active ? 'text-brand-600' : done ? 'text-emerald-600' : 'text-gray-400 dark:text-dark-muted'}`}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-dark-muted mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Items Summary */}
      <div className="rounded-3xl bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border p-5 shadow-card">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Order Summary</h3>
        <div className="space-y-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm text-gray-600 dark:text-dark-muted">
              <span>{item.name} <span className="text-gray-400">×{item.quantity}</span></span>
              <span className="font-semibold text-gray-800 dark:text-dark-text">₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-gray-50 dark:border-dark-border pt-2 font-black text-gray-800 dark:text-dark-text">
            <span>Total</span>
            <span className="text-brand-600">₹{order.totalAmount}</span>
          </div>
        </div>

        {order.status === 'Completed' && !feedbackDone && (
          <button
            onClick={() => setShowFeedback(true)}
            className="mt-4 w-full btn-primary text-xs"
          >
            <Star size={14} /> Rate This Order & Earn Points
          </button>
        )}
      </div>
    </div>
  );
};

export default TokenTracking;
