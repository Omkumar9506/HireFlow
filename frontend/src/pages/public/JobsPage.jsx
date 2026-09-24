import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../store/AuthContext';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge, StatusBadge } from '../../components/ui/StatusBadge';
import { Skeleton, EmptyState } from '../../components/ui/Card';
import { ROLES } from '../../constants';
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const JobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters state from URL query
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [workMode, setWorkMode] = useState(searchParams.get('workMode') || '');
  const [employmentType, setEmploymentType] = useState(searchParams.get('employmentType') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [savedJobsMap, setSavedJobsMap] = useState({});

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const page = searchParams.get('page') || 1;
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', 10);
      if (search) params.set('search', search);
      if (location) params.set('location', location);
      if (workMode) params.set('workMode', workMode);
      if (employmentType) params.set('employmentType', employmentType);
      if (sort) params.set('sort', sort);

      const res = await api.get(`/jobs?${params.toString()}`);
      setJobs(res.data.data.items || []);
      setPagination(res.data.data.pagination || {});
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, search, location, workMode, employmentType, sort]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Load saved jobs if candidate
  useEffect(() => {
    if (isAuthenticated && user?.role === ROLES.CANDIDATE) {
      api.get('/candidates/saved-jobs').then((res) => {
        const map = {};
        (res.data.data || []).forEach((j) => {
          if (j?._id) map[j._id] = true;
        });
        setSavedJobsMap(map);
      }).catch(() => {});
    }
  }, [isAuthenticated, user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (location) params.set('location', location);
    if (workMode) params.set('workMode', workMode);
    if (employmentType) params.set('employmentType', employmentType);
    if (sort) params.set('sort', sort);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSaveJob = async (jobId) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    const isCurrentlySaved = Boolean(savedJobsMap[jobId]);
    try {
      if (isCurrentlySaved) {
        await api.delete(`/jobs/${jobId}/save`);
        setSavedJobsMap((prev) => ({ ...prev, [jobId]: false }));
      } else {
        await api.post(`/jobs/${jobId}/save`);
        setSavedJobsMap((prev) => ({ ...prev, [jobId]: true }));
      }
    } catch (err) {
      console.warn('Failed to update saved job status:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Find Your Next Engineering Role
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore verified openings, transparent salary bands, and streamlined application tracking.
        </p>
      </div>

      {/* Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-8 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            icon={Search}
            placeholder="Search role, skills, keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Input
            icon={MapPin}
            placeholder="City or state..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <div className="flex gap-2">
            <Button type="submit" variant="primary" className="flex-1" icon={Filter}>
              Filter Jobs
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearch('');
                setLocation('');
                setWorkMode('');
                setEmploymentType('');
                setSort('newest');
                setSearchParams({});
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <Select
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
            options={[
              { value: '', label: 'All Work Modes' },
              { value: 'REMOTE', label: 'Remote Only' },
              { value: 'HYBRID', label: 'Hybrid' },
              { value: 'ONSITE', label: 'Onsite' },
            ]}
          />

          <Select
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            options={[
              { value: '', label: 'All Employment Types' },
              { value: 'FULL_TIME', label: 'Full Time' },
              { value: 'PART_TIME', label: 'Part Time' },
              { value: 'CONTRACT', label: 'Contract' },
              { value: 'INTERNSHIP', label: 'Internship' },
            ]}
          />

          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            options={[
              { value: 'newest', label: 'Sort: Newest First' },
              { value: 'salary_desc', label: 'Sort: Highest Salary' },
              { value: 'oldest', label: 'Sort: Oldest First' },
            ]}
          />
        </div>
      </form>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-slate-700">
          Showing <span className="text-blue-600">{pagination.total}</span> open requisitions
        </p>
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-12 w-full" />
            </Card>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs found matching your criteria"
          description="Try broadening your search keywords or resetting filters to see more opportunities."
          actionText="Clear All Filters"
          onAction={() => {
            setSearch('');
            setLocation('');
            setWorkMode('');
            setEmploymentType('');
            setSearchParams({});
          }}
        />
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const isSaved = Boolean(savedJobsMap[job._id]);
            return (
              <div
                key={job._id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-blue-700 text-sm shrink-0">
                      {job.companyId?.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <Link
                        to={`/jobs/${job._id}`}
                        className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {job.title}
                      </Link>
                      <p className="text-xs font-medium text-slate-600 mt-0.5">
                        {job.companyId?.name} • <span className="text-slate-500">{job.location}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600 -mr-1" />
                          ${job.salary?.min?.toLocaleString()} - ${job.salary?.max?.toLocaleString()}{' '}
                          <span className="font-normal text-slate-500">/yr</span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {job.workMode}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {job.employmentType?.replace('_', ' ')}
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          {job.experience?.min}-{job.experience?.max} yrs exp
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="flex items-center gap-2">
                      {user?.role === ROLES.CANDIDATE && (
                        <button
                          type="button"
                          onClick={() => toggleSaveJob(job._id)}
                          className={`p-2 rounded-lg border transition-colors ${
                            isSaved
                              ? 'border-blue-200 bg-blue-50 text-blue-600'
                              : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                          }`}
                          title={isSaved ? 'Unsave job' : 'Save job'}
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-600' : ''}`} />
                        </button>
                      )}
                      <Link to={`/jobs/${job._id}`}>
                        <Button variant="primary" size="sm">
                          View Requisition
                        </Button>
                      </Link>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {job.skills && job.skills.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {job.skills.slice(0, 6).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 6 && (
                      <span className="text-[11px] text-slate-400 self-center">
                        +{job.skills.length - 6} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPrevPage}
            onClick={() => handlePageChange(pagination.page - 1)}
            icon={ChevronLeft}
          >
            Previous
          </Button>
          <span className="text-xs text-slate-600 font-medium">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasNextPage}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};
