import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, Skeleton } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select, Textarea } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Building2, CheckCircle2, AlertCircle, Globe, MapPin, Users } from 'lucide-react';

export const CompanyProfilePage = () => {
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [employeeCount, setEmployeeCount] = useState('50-100');
  const [foundedYear, setFoundedYear] = useState(2020);
  const [description, setDescription] = useState('');

  const fetchCompany = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/companies/user/me');
      const comp = res.data.data;
      if (comp) {
        setCompany(comp);
        setName(comp.name || '');
        setIndustry(comp.industry || '');
        setWebsite(comp.website || '');
        setLocation(comp.location || '');
        setEmployeeCount(comp.employeeCount || '50-100');
        setFoundedYear(comp.foundedYear || 2020);
        setDescription(comp.description || '');
      }
    } catch (err) {
      console.error('Failed to load company profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      name,
      industry,
      website,
      location,
      employeeCount,
      foundedYear: parseInt(foundedYear, 10) || null,
      description,
    };

    try {
      if (company?._id) {
        const res = await api.patch(`/companies/${company._id}`, payload);
        setCompany(res.data.data);
        setSuccessMsg('Company profile updated successfully.');
      } else {
        const res = await api.post('/companies', payload);
        setCompany(res.data.data);
        setSuccessMsg('Company profile submitted for verification review.');
      }
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save company details');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Employer Company Profile
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage company brand info, website, headquarters, and verification credentials.
          </p>
        </div>

        {company && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Platform Status:</span>
            <StatusBadge status={company.verificationStatus} />
          </div>
        )}
      </div>

      {company?.verificationStatus === 'PENDING' && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            Verification Review in Progress
          </p>
          <p className="text-amber-800">
            Platform administrators review new company submissions within 24 hours. You can draft job requisitions in the meantime.
          </p>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            Company Credentials
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Legal Company Name"
              placeholder="e.g. CloudScale Technologies Inc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              icon={Building2}
            />
            <Input
              label="Primary Industry"
              placeholder="e.g. Cloud Infrastructure, FinTech, HealthTech"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Corporate Website URL"
              placeholder="https://example.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              icon={Globe}
            />
            <Input
              label="Headquarters Location"
              placeholder="e.g. San Francisco, CA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              icon={MapPin}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Employee Team Size"
              value={employeeCount}
              onChange={(e) => setEmployeeCount(e.target.value)}
              options={[
                { value: '1-10', label: '1 - 10 employees' },
                { value: '11-50', label: '11 - 50 employees' },
                { value: '50-100', label: '50 - 100 employees' },
                { value: '100-250', label: '100 - 250 employees' },
                { value: '250-500', label: '250 - 500 employees' },
                { value: '500+', label: '500+ employees' },
              ]}
            />
            <Input
              label="Founded Year"
              type="number"
              min={1900}
              max={new Date().getFullYear()}
              value={foundedYear}
              onChange={(e) => setFoundedYear(e.target.value)}
            />
          </div>

          <Textarea
            label="Company Description"
            rows={4}
            placeholder="Tell candidates about your company mission, tech stack, and workplace culture..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
            {company ? 'Update Company Profile' : 'Submit Company for Approval'}
          </Button>
        </div>
      </form>
    </div>
  );
};
