import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { WordmarkLogo } from '../components/ui/WordmarkLogo';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <WordmarkLogo size="lg" className="justify-center" />
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 sm:rounded-xl sm:px-10">
          <Outlet />
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-500">
        <Link to="/" className="hover:text-blue-600 font-medium">
          ← Back to Homepage
        </Link>
      </div>
    </div>
  );
};
