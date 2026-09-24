import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-6 shadow-xs hover:border-slate-300 transition-colors ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => {
  return (
    <div className={`flex items-start justify-between pb-4 border-b border-slate-100 ${className}`}>
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export const Skeleton = ({ className = '' }) => {
  return <div className={`animate-pulse rounded-md bg-slate-200/80 ${className}`} />;
};

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 ${className}`}>
      {Icon && (
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-500 mb-4">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 max-w-sm">{description}</p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
