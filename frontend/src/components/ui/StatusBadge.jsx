import React from 'react';

export const Badge = ({ children, variant = 'neutral', size = 'md', className = '' }) => {
  const variants = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${variants[variant] || variants.neutral} ${
        sizes[size] || sizes.md
      } ${className}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge = ({ status, className = '' }) => {
  const statusMap = {
    APPLIED: { label: 'Applied', variant: 'primary', dot: 'bg-blue-500' },
    SCREENING: { label: 'Screening', variant: 'purple', dot: 'bg-purple-500' },
    SHORTLISTED: { label: 'Shortlisted', variant: 'cyan', dot: 'bg-cyan-500' },
    INTERVIEW: { label: 'Interview', variant: 'warning', dot: 'bg-amber-500' },
    SELECTED: { label: 'Selected', variant: 'primary', dot: 'bg-indigo-500' },
    OFFERED: { label: 'Offered', variant: 'success', dot: 'bg-teal-500' },
    HIRED: { label: 'Hired', variant: 'success', dot: 'bg-emerald-600' },
    REJECTED: { label: 'Rejected', variant: 'danger', dot: 'bg-rose-500' },
    WITHDRAWN: { label: 'Withdrawn', variant: 'neutral', dot: 'bg-slate-400' },

    // Job Status
    PUBLISHED: { label: 'Published', variant: 'success', dot: 'bg-emerald-500' },
    DRAFT: { label: 'Draft', variant: 'neutral', dot: 'bg-slate-400' },
    CLOSED: { label: 'Closed', variant: 'danger', dot: 'bg-rose-500' },
    EXPIRED: { label: 'Expired', variant: 'warning', dot: 'bg-amber-500' },

    // Company Status
    PENDING: { label: 'Pending Review', variant: 'warning', dot: 'bg-amber-500' },
    APPROVED: { label: 'Verified', variant: 'success', dot: 'bg-emerald-500' },
    SUSPENDED: { label: 'Suspended', variant: 'danger', dot: 'bg-rose-500' },

    // Interview Status
    SCHEDULED: { label: 'Scheduled', variant: 'primary', dot: 'bg-blue-500' },
    RESCHEDULED: { label: 'Rescheduled', variant: 'warning', dot: 'bg-amber-500' },
    COMPLETED: { label: 'Completed', variant: 'success', dot: 'bg-emerald-500' },
    CANCELLED: { label: 'Cancelled', variant: 'danger', dot: 'bg-rose-500' },
  };

  const current = statusMap[status] || {
    label: status || 'Unknown',
    variant: 'neutral',
    dot: 'bg-slate-400',
  };

  return (
    <Badge variant={current.variant} className={className}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </Badge>
  );
};
