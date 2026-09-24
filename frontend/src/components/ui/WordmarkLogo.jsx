import React from 'react';
import { Link } from 'react-router-dom';

export const WordmarkLogo = ({ to = '/', size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <Link to={to} className={`inline-flex items-center gap-2 font-bold tracking-tight text-slate-900 group ${className}`}>
      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-sm shadow-sm group-hover:bg-blue-700 transition-colors">
        HF
      </span>
      <span className={`${sizeClasses[size] || sizeClasses.md} font-extrabold text-slate-900`}>
        Hire<span className="text-blue-600">Flow</span>
        <span className="ml-1.5 text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
          ATS
        </span>
      </span>
    </Link>
  );
};
