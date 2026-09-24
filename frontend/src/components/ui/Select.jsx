import React, { forwardRef } from 'react';

export const Select = forwardRef(
  ({ label, error, helperText, options = [], className = '', id, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            error ? 'border-red-500 focus:ring-red-400' : 'border-slate-300'
          } ${className}`}
          {...props}
        >
          {children
            ? children
            : options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
        </select>
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export const Textarea = forwardRef(
  ({ label, error, helperText, className = '', id, rows = 4, ...props }, ref) => {
    const areaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={areaId} className="block text-xs font-semibold text-slate-700">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          id={areaId}
          ref={ref}
          rows={rows}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            error ? 'border-red-500 focus:ring-red-400' : 'border-slate-300'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
