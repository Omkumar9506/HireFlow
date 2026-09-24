import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../store/AuthContext';
import { Card, Skeleton } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Select';
import {
  CheckCircle2,
  User,
  Phone,
  MapPin,
  Globe,
  Plus,
  X,
  Briefcase,
  GraduationCap,
  Sparkles,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // Modals / sub-forms for Experience & Education
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [expIndexToEdit, setExpIndexToEdit] = useState(null);
  const [expForm, setExpForm] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
  });

  const [isEduModalOpen, setIsEduModalOpen] = useState(false);
  const [eduIndexToEdit, setEduIndexToEdit] = useState(null);
  const [eduForm, setEduForm] = useState({
    degree: '',
    institution: '',
    fieldOfStudy: '',
    startYear: '',
    endYear: '',
    grade: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/candidates/me');
        const p = res.data.data;
        setProfile(p);
        setName(p.userId?.name || user?.name || '');
        setPhone(p.phone || '');
        setLocation(p.location || '');
        setHeadline(p.headline || '');
        setBio(p.bio || '');
        setSkills(p.skills || []);
        setExperience(p.experience || []);
        setEducation(p.education || []);
        setLinkedinUrl(p.linkedinUrl || '');
        setGithubUrl(p.githubUrl || '');
        setPortfolioUrl(p.portfolioUrl || '');
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Completeness score calculator
  const calculateCompleteness = () => {
    let score = 0;
    if (name?.trim()) score += 10;
    if (headline?.trim()) score += 15;
    if (bio?.trim()) score += 15;
    if (phone?.trim()) score += 10;
    if (location?.trim()) score += 10;
    if (skills?.length > 0) score += 15;
    if (experience?.length > 0) score += 15;
    if (education?.length > 0) score += 10;
    if (linkedinUrl || githubUrl || portfolioUrl) score += 5;
    return Math.min(score, 100);
  };

  const completeness = calculateCompleteness();

  const handleAddSkill = (e) => {
    if (e) e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Experience handlers
  const openAddExp = () => {
    setExpIndexToEdit(null);
    setExpForm({
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
    });
    setIsExpModalOpen(true);
  };

  const openEditExp = (idx) => {
    setExpIndexToEdit(idx);
    setExpForm({ ...experience[idx] });
    setIsExpModalOpen(true);
  };

  const saveExp = (e) => {
    e.preventDefault();
    if (!expForm.title.trim() || !expForm.company.trim()) {
      alert('Job Title and Company are required.');
      return;
    }

    if (expIndexToEdit !== null) {
      const updated = [...experience];
      updated[expIndexToEdit] = expForm;
      setExperience(updated);
    } else {
      setExperience([...experience, expForm]);
    }
    setIsExpModalOpen(false);
  };

  const removeExp = (idx) => {
    setExperience(experience.filter((_, i) => i !== idx));
  };

  // Education handlers
  const openAddEdu = () => {
    setEduIndexToEdit(null);
    setEduForm({
      degree: '',
      institution: '',
      fieldOfStudy: '',
      startYear: '',
      endYear: '',
      grade: '',
    });
    setIsEduModalOpen(true);
  };

  const openEditEdu = (idx) => {
    setEduIndexToEdit(idx);
    setEduForm({ ...education[idx] });
    setIsEduModalOpen(true);
  };

  const saveEdu = (e) => {
    e.preventDefault();
    if (!eduForm.degree.trim() || !eduForm.institution.trim()) {
      alert('Degree and Institution are required.');
      return;
    }

    if (eduIndexToEdit !== null) {
      const updated = [...education];
      updated[eduIndexToEdit] = eduForm;
      setEducation(updated);
    } else {
      setEducation([...education, eduForm]);
    }
    setIsEduModalOpen(false);
  };

  const removeEdu = (idx) => {
    setEducation(education.filter((_, i) => i !== idx));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await api.patch('/candidates/me', {
        name,
        phone,
        location,
        headline,
        bio,
        skills,
        experience,
        education,
        linkedinUrl,
        githubUrl,
        portfolioUrl,
      });

      if (user) {
        updateUser({ ...user, name });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save profile changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Candidate Profile
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your comprehensive professional portfolio presented to hiring teams.
          </p>
        </div>
        {saveSuccess && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Changes Saved Successfully
          </div>
        )}
      </div>

      {/* Profile Completeness Card */}
      <Card className="p-5 bg-gradient-to-r from-blue-50/60 to-indigo-50/40 border-blue-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-600 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Profile Strength: {completeness}%</h4>
              <p className="text-[11px] text-slate-500">
                {completeness >= 85
                  ? 'Strong profile! Hiring managers favor complete profiles for shortlisting.'
                  : 'Add skills, work history, and portfolio links to increase recruiter outreach.'}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-700">{completeness}/100</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              completeness >= 80 ? 'bg-emerald-500' : completeness >= 50 ? 'bg-blue-600' : 'bg-amber-500'
            }`}
            style={{ width: `${completeness}%` }}
          />
        </div>
      </Card>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Information */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            General Information
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              icon={User}
            />
            <Input
              label="Contact Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              icon={Phone}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA"
              icon={MapPin}
            />
            <Input
              label="Professional Headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Senior Full-Stack Engineer | React & Node"
            />
          </div>

          <Textarea
            label="Professional Bio"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Summarize your background, core strengths, and what you are looking for next..."
          />
        </Card>

        {/* Skills Management */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Key Competencies & Skills ({skills.length})
            </h3>
            <span className="text-[11px] text-slate-400">Press Enter or Add to insert tag</span>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Type a skill (e.g. React, Node.js, Docker, AWS)..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
            />
            <Button type="button" variant="secondary" size="md" onClick={() => handleAddSkill()} icon={Plus}>
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 min-h-10">
            {skills.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No skills added yet. Add core technologies to match with open jobs.</p>
            ) : (
              skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-red-600 focus:outline-none"
                    aria-label={`Remove skill ${skill}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))
            )}
          </div>
        </Card>

        {/* Work Experience */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Work Experience ({experience.length})
              </h3>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={openAddExp} icon={Plus}>
              Add Experience
            </Button>
          </div>

          {experience.length === 0 ? (
            <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl">
              <p className="text-xs text-slate-500">No work experience listed yet.</p>
              <Button type="button" variant="ghost" size="sm" onClick={openAddExp} className="mt-2 text-blue-600">
                + Add your first role
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {experience.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{exp.title}</h4>
                      {exp.isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-700">
                      {exp.company} {exp.location ? `• ${exp.location}` : ''}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>{exp.startDate || 'N/A'} - {exp.isCurrent ? 'Present' : (exp.endDate || 'N/A')}</span>
                    </div>
                    {exp.description && (
                      <p className="text-xs text-slate-600 pt-1 leading-relaxed whitespace-pre-line">
                        {exp.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditExp(idx)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-white"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeExp(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-white"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Education History */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Education ({education.length})
              </h3>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={openAddEdu} icon={Plus}>
              Add Education
            </Button>
          </div>

          {education.length === 0 ? (
            <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl">
              <p className="text-xs text-slate-500">No education records added yet.</p>
              <Button type="button" variant="ghost" size="sm" onClick={openAddEdu} className="mt-2 text-blue-600">
                + Add your degree or institution
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {education.map((edu, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">{edu.degree}</h4>
                    <p className="text-xs font-medium text-slate-700">
                      {edu.institution} {edu.fieldOfStudy ? `• ${edu.fieldOfStudy}` : ''}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{edu.startYear || 'N/A'} - {edu.endYear || 'Present'}</span>
                      {edu.grade && <span>• Grade: {edu.grade}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditEdu(idx)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-white"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeEdu(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-white"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Social / Portfolio Links */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            Professional Web Presence
          </h3>

          <Input
            label="LinkedIn Profile"
            placeholder="https://linkedin.com/in/username"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
          />

          <Input
            label="GitHub Profile"
            placeholder="https://github.com/username"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
          />

          <Input
            label="Portfolio Website"
            placeholder="https://yourportfolio.com"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
          />
        </Card>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
            Save Complete Profile
          </Button>
        </div>
      </form>

      {/* Experience Modal */}
      {isExpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {expIndexToEdit !== null ? 'Edit Work Experience' : 'Add Work Experience'}
              </h3>
              <button
                type="button"
                onClick={() => setIsExpModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={saveExp} className="space-y-4">
              <Input
                label="Job Title *"
                placeholder="e.g. Senior Software Engineer"
                value={expForm.title}
                onChange={(e) => setExpForm({ ...expForm, title: e.target.value })}
                required
              />
              <Input
                label="Company Name *"
                placeholder="e.g. Stripe, Acme Corp"
                value={expForm.company}
                onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                required
              />
              <Input
                label="Location"
                placeholder="e.g. San Francisco, CA (or Remote)"
                value={expForm.location}
                onChange={(e) => setExpForm({ ...expForm, location: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start Date"
                  placeholder="e.g. Jan 2021"
                  value={expForm.startDate}
                  onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })}
                />
                <Input
                  label="End Date"
                  placeholder="e.g. Dec 2023"
                  value={expForm.endDate}
                  disabled={expForm.isCurrent}
                  onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isCurrentExp"
                  checked={expForm.isCurrent}
                  onChange={(e) => setExpForm({ ...expForm, isCurrent: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="isCurrentExp" className="text-xs text-slate-700 font-medium">
                  I currently work in this role
                </label>
              </div>

              <Textarea
                label="Role Overview & Key Achievements"
                rows={3}
                placeholder="Responsibilities, metrics, technologies used..."
                value={expForm.description}
                onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setIsExpModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  {expIndexToEdit !== null ? 'Save Changes' : 'Add Position'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Education Modal */}
      {isEduModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {eduIndexToEdit !== null ? 'Edit Education' : 'Add Education'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEduModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={saveEdu} className="space-y-4">
              <Input
                label="Degree / Certificate *"
                placeholder="e.g. Bachelor of Science in Computer Science"
                value={eduForm.degree}
                onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                required
              />
              <Input
                label="Institution / University *"
                placeholder="e.g. Stanford University"
                value={eduForm.institution}
                onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                required
              />
              <Input
                label="Field of Study"
                placeholder="e.g. Software Engineering"
                value={eduForm.fieldOfStudy}
                onChange={(e) => setEduForm({ ...eduForm, fieldOfStudy: e.target.value })}
              />

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Start Year"
                  placeholder="e.g. 2017"
                  value={eduForm.startYear}
                  onChange={(e) => setEduForm({ ...eduForm, startYear: e.target.value })}
                />
                <Input
                  label="End Year"
                  placeholder="e.g. 2021"
                  value={eduForm.endYear}
                  onChange={(e) => setEduForm({ ...eduForm, endYear: e.target.value })}
                />
                <Input
                  label="Grade / GPA"
                  placeholder="e.g. 3.8 / 4.0"
                  value={eduForm.grade}
                  onChange={(e) => setEduForm({ ...eduForm, grade: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setIsEduModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  {eduIndexToEdit !== null ? 'Save Changes' : 'Add Education'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
