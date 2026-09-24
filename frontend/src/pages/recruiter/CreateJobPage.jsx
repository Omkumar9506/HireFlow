import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select, Textarea } from '../../components/ui/Select';
import { Badge } from '../../components/ui/StatusBadge';
import {
  Briefcase,
  DollarSign,
  Sparkles,
  AlertCircle,
  Plus,
  X,
  CheckCircle2,
} from 'lucide-react';

export const CreateJobPage = () => {
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [employmentType, setEmploymentType] = useState('FULL_TIME');
  const [workMode, setWorkMode] = useState('REMOTE');
  const [location, setLocation] = useState('');
  const [openings, setOpenings] = useState(1);
  const [minSalary, setMinSalary] = useState(120000);
  const [maxSalary, setMaxSalary] = useState(160000);
  const [minExp, setMinExp] = useState(3);
  const [maxExp, setMaxExp] = useState(7);
  const [description, setDescription] = useState('');
  const [responsibilitiesText, setResponsibilitiesText] = useState('');
  const [requirementsText, setRequirementsText] = useState('');
  const [benefitsText, setBenefitsText] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [applicationDeadline, setApplicationDeadline] = useState('');

  useEffect(() => {
    api.get('/companies/user/me').then((res) => {
      setCompany(res.data.data);
      if (res.data.data?.location) {
        setLocation(res.data.data.location);
      }
    }).catch(() => {});
  }, []);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // AI-Assisted Job Breakdown Helper
  const handleAiAnalyzeJob = async () => {
    if (!title || !description) {
      alert('Please enter a Job Title and Description first so AI can analyze competencies.');
      return;
    }
    setIsAiAnalyzing(true);
    try {
      const res = await api.post('/ai/job/analyze', { title, description });
      const { requiredSkills, keyResponsibilities } = res.data.data;
      if (requiredSkills && requiredSkills.length > 0) {
        setSkills(Array.from(new Set([...skills, ...requiredSkills])));
      }
      if (keyResponsibilities && keyResponsibilities.length > 0 && !responsibilitiesText) {
        setResponsibilitiesText(keyResponsibilities.join('\n'));
      }
    } catch (err) {
      console.warn('AI analysis fallback:', err);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleSubmit = async (targetStatus) => {
    setError('');
    setIsLoading(true);

    const payload = {
      title,
      employmentType,
      workMode,
      location,
      openings: parseInt(openings, 10) || 1,
      salary: {
        min: parseInt(minSalary, 10) || 0,
        max: parseInt(maxSalary, 10) || 0,
        currency: 'USD',
        period: 'yearly',
      },
      experience: {
        min: parseInt(minExp, 10) || 0,
        max: parseInt(maxExp, 10) || 0,
      },
      description,
      responsibilities: responsibilitiesText.split('\n').map((s) => s.trim()).filter(Boolean),
      requirements: requirementsText.split('\n').map((s) => s.trim()).filter(Boolean),
      benefits: benefitsText.split('\n').map((s) => s.trim()).filter(Boolean),
      skills,
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
      status: targetStatus,
    };

    try {
      await api.post('/jobs', payload);
      navigate('/recruiter/jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job requisition.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Create New Job Requisition
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Define role specifications, qualifications, compensation bands, and ATS pipeline settings.
        </p>
      </div>

      {company?.verificationStatus !== 'APPROVED' && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            Company Verification Pending
          </p>
          <p className="text-amber-800 leading-relaxed">
            Your company profile is currently being reviewed by administrators. You can save this job requisition as a <strong>Draft</strong> now and publish it once your company is approved.
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      <form className="space-y-6">
        {/* Section 1: Basic Information */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            1. Position Overview
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Job Requisition Title"
              placeholder="e.g. Senior Backend Systems Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Input
              label="Office Location"
              placeholder="e.g. San Francisco, CA or Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Select
              label="Employment Type"
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              options={[
                { value: 'FULL_TIME', label: 'Full Time' },
                { value: 'PART_TIME', label: 'Part Time' },
                { value: 'CONTRACT', label: 'Contract' },
                { value: 'INTERNSHIP', label: 'Internship' },
              ]}
            />

            <Select
              label="Work Mode"
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              options={[
                { value: 'REMOTE', label: 'Remote' },
                { value: 'HYBRID', label: 'Hybrid' },
                { value: 'ONSITE', label: 'Onsite' },
              ]}
            />

            <Input
              label="Open Headcount"
              type="number"
              min={1}
              value={openings}
              onChange={(e) => setOpenings(e.target.value)}
            />
          </div>
        </Card>

        {/* Section 2: Compensation & Experience */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            2. Compensation & Experience Bands
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Minimum Annual Salary ($ USD)"
              type="number"
              step={5000}
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              required
            />
            <Input
              label="Maximum Annual Salary ($ USD)"
              type="number"
              step={5000}
              value={maxSalary}
              onChange={(e) => setMaxSalary(e.target.value)}
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Minimum Years of Experience"
              type="number"
              min={0}
              value={minExp}
              onChange={(e) => setMinExp(e.target.value)}
            />
            <Input
              label="Maximum Years of Experience"
              type="number"
              min={0}
              value={maxExp}
              onChange={(e) => setMaxExp(e.target.value)}
            />
          </div>

          <div className="sm:w-1/2">
            <Input
              label="Application Closing Deadline (Optional)"
              type="date"
              value={applicationDeadline}
              onChange={(e) => setApplicationDeadline(e.target.value)}
            />
          </div>
        </Card>

        {/* Section 3: Job Description & AI Assist */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              3. Description & Competency Profile
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Sparkles}
              isLoading={isAiAnalyzing}
              onClick={handleAiAnalyzeJob}
              title="Use Gemini AI to extract skills & responsibilities"
            >
              AI Assist Breakdown
            </Button>
          </div>

          <Textarea
            label="Detailed Role Description"
            rows={5}
            placeholder="Describe the mission, scope of work, and team structure for this position..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Required Technical Competencies
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Type skill and press Enter (e.g. React, Node.js, AWS)..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(e);
                  }
                }}
              />
              <Button variant="secondary" size="md" onClick={handleAddSkill} icon={Plus}>
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold"
                >
                  {s}
                  <button type="button" onClick={() => handleRemoveSkill(s)} className="hover:text-red-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <Textarea
            label="Core Responsibilities (One per line)"
            rows={3}
            placeholder="Build responsive user interfaces&#10;Optimize database read queries&#10;Participate in design critiques"
            value={responsibilitiesText}
            onChange={(e) => setResponsibilitiesText(e.target.value)}
          />

          <Textarea
            label="Candidate Requirements (One per line)"
            rows={3}
            placeholder="5+ years in full-stack engineering&#10;Strong understanding of REST APIs&#10;Experience with CI/CD"
            value={requirementsText}
            onChange={(e) => setRequirementsText(e.target.value)}
          />

          <Textarea
            label="Benefits & Perks (One per line)"
            rows={2}
            placeholder="Comprehensive healthcare package&#10;Remote work budget&#10;401(k) matching"
            value={benefitsText}
            onChange={(e) => setBenefitsText(e.target.value)}
          />
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            size="md"
            disabled={isLoading}
            onClick={() => handleSubmit('DRAFT')}
          >
            Save as Draft
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            disabled={isLoading || company?.verificationStatus !== 'APPROVED'}
            onClick={() => handleSubmit('PUBLISHED')}
          >
            Publish Live Requisition
          </Button>
        </div>
      </form>
    </div>
  );
};
