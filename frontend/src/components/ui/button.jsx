import React from 'react';

const base = 'inline-flex items-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

const variants = {
  hero: 'bg-primary text-primary-foreground hover:bg-green-600 focus:ring-primary px-6 py-3',
  secondary: 'bg-secondary text-white hover:bg-blue-700 focus:ring-secondary px-6 py-3',
  outline: 'border border-border text-slate-800 hover:bg-gray-50 focus:ring-slate-300 px-6 py-3',
  ghost: 'text-slate-700 hover:bg-gray-100 focus:ring-slate-300 px-4 py-2',
};

const sizes = {
  sm: 'text-sm px-3 py-2',
  md: 'text-sm px-4 py-2.5',
  lg: 'text-base px-6 py-3',
};

export function Button({ variant = 'hero', size = 'md', className = '', children, ...props }) {
  const v = variants[variant] ?? variants.hero;
  const s = sizes[size] ?? sizes.md;
  return (
    <button className={`${base} ${v} ${s} ${className}`} {...props}>
      {children}
    </button>
  );
}
