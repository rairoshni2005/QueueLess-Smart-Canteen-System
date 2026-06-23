import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight, UtensilsCrossed, Zap, Sparkles } from 'lucide-react';

const slides = [
  {
    title: 'No More Waiting',
    description: 'Skip long physical cafeteria lines and avoid the hunger rush.',
    icon: <UtensilsCrossed size={48} className="text-white" />,
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    title: 'Order Before You Reach',
    description: 'Pre-order your favorite meals while walking or during lectures.',
    icon: <Zap size={48} className="text-white" />,
    gradient: 'from-amber-500 to-yellow-500',
  },
  {
    title: 'Smart Food Experience',
    description: 'Track your live order token, wait times, and get notifications.',
    icon: <Sparkles size={48} className="text-white" />,
    gradient: 'from-brand-600 to-rose-500',
  },
];

const Onboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      localStorage.setItem('queueless_onboarding_completed', 'true');
      navigate('/auth');
    }
  };

  const handleSkip = () => {
    localStorage.setItem('queueless_onboarding_completed', 'true');
    navigate('/auth');
  };

  const slide = slides[currentSlide];

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-white px-6 py-12">
      {/* Skip Button */}
      <div className="w-full flex justify-end">
        {currentSlide < slides.length - 1 && (
          <button
            onClick={handleSkip}
            className="text-sm font-semibold text-gray-400 hover:text-brand-500 transition-colors"
          >
            Skip
          </button>
        )}
      </div>

      {/* Center Image / Icon */}
      <div className="flex flex-col items-center max-w-sm text-center">
        <div className={`mb-10 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-tr ${slide.gradient} shadow-xl shadow-brand-500/25 animate-pulse-slow`}>
          {slide.icon}
        </div>

        <h2 className="font-sans text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
          {slide.title}
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed px-4">
          {slide.description}
        </p>
      </div>

      {/* Footer / Progression indicators */}
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        {/* Indicators */}
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-6 bg-brand-500' : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleNext}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-amber-600 px-6 py-4 font-bold text-white shadow-lg shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          {currentSlide === slides.length - 1 ? (
            <ArrowRight size={18} />
          ) : (
            <ChevronRight size={18} />
          )}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
