import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Card, Skeleton, EmptyState } from '../../components/ui/Card';
import { Badge } from '../../components/ui/StatusBadge';
import { Building2, MapPin, Globe, Users, ArrowRight } from 'lucide-react';

export const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get('/companies');
        setCompanies(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch companies:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Verified Technology Employers
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore vetted companies actively recruiting through the HireFlow ATS platform.
        </p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="space-y-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-16 w-full" />
            </Card>
          ))}
        </div>
      ) : companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No verified companies available yet"
          description="Check back soon as new enterprise partners join the network."
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card key={company._id} className="flex flex-col justify-between hover:border-blue-400 transition-all">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-black text-blue-700 text-base">
                    {company.name.charAt(0)}
                  </div>
                  <Badge variant="success">Verified Employer</Badge>
                </div>

                <h3 className="text-base font-bold text-slate-900">{company.name}</h3>
                <p className="text-xs font-semibold text-blue-600 mt-0.5">{company.industry}</p>

                <p className="mt-3 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {company.description || 'Enterprise software technology and innovation leader.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{company.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{company.employeeCount} team members</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                {company.website ? (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <Globe className="w-3.5 h-3.5" /> Website
                  </a>
                ) : (
                  <span />
                )}
                <Link
                  to={`/jobs?search=${encodeURIComponent(company.name)}`}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  View Openings <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
