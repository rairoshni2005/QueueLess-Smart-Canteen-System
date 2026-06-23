import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SplashScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      const onboardingCompleted = localStorage.getItem('queueless_onboarding_completed');
      if (!onboardingCompleted) {
        navigate('/onboarding');
      } else if (user) {
        navigate('/');
      } else {
        navigate('/auth');
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-tr from-brand-50 to-amber-50">
      <div className="flex flex-col items-center text-center animate-fade-in">
        {/* Animated Plate/Fork Logo */}
        <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-brand-500 to-amber-500 text-5xl shadow-2xl shadow-brand-500/30 animate-bounce-slow">
          🍽️
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500"></span>
          </span>
        </div>
        
        <h1 className="font-sans text-5xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 to-amber-600 bg-clip-text text-transparent mb-2">
          QueueLess
        </h1>
        <p className="text-gray-500 font-medium tracking-wide text-sm max-w-xs">
          Skip the queue. Enjoy your food faster.
        </p>

        {/* Custom modern spinner */}
        <div className="mt-12 flex items-center justify-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="h-2 w-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="h-2 w-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
