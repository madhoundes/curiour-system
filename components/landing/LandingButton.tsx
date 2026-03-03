'use client';

import * as React from 'react';

interface LandingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const LandingButton: React.FC<LandingButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-full";

  const variants = {
    primary: "bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/30 border border-transparent focus:ring-brand-500",
    secondary: "bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/30 border border-transparent focus:ring-violet-500",
    outline: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm focus:ring-slate-200",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-brand-600 border border-transparent",
  };

  const sizes = {
    sm: "text-sm px-4 py-1.5",
    md: "text-base px-6 py-2.5",
    lg: "text-lg px-8 py-3.5",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
      {icon && <span className="ml-2">{icon}</span>}
    </button>
  );
};
