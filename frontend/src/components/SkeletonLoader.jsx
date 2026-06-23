import React from 'react';

export const SkeletonCard = () => (
  <div className="rounded-3xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-4 overflow-hidden">
    <div className="skeleton h-44 w-full rounded-2xl mb-4" />
    <div className="skeleton h-4 w-3/4 rounded-full mb-2" />
    <div className="skeleton h-3 w-1/2 rounded-full mb-4" />
    <div className="skeleton h-10 w-full rounded-xl" />
  </div>
);

export const SkeletonList = ({ rows = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-4">
        <div className="skeleton h-14 w-14 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3.5 w-2/3 rounded-full" />
          <div className="skeleton h-3 w-1/2 rounded-full" />
        </div>
        <div className="skeleton h-8 w-16 rounded-xl" />
      </div>
    ))}
  </div>
);

export const SkeletonMetricCard = () => (
  <div className="rounded-3xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-6">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <div className="skeleton h-3 w-24 rounded-full" />
        <div className="skeleton h-7 w-16 rounded-full" />
      </div>
      <div className="skeleton h-12 w-12 rounded-2xl" />
    </div>
  </div>
);

export const SkeletonText = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className={`skeleton h-3 rounded-full ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
    ))}
  </div>
);

export const SkeletonPage = () => (
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
    <div className="skeleton h-8 w-56 rounded-full mb-2" />
    <div className="skeleton h-4 w-40 rounded-full mb-8" />
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {Array.from({ length: 4 }).map((_, i) => <SkeletonMetricCard key={i} />)}
    </div>
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  </div>
);
