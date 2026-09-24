import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../store/AuthContext';
import { Card, Skeleton } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Select';
import { CheckCircle2, User, Phone, MapPin, Globe, Plus, X } from 'lucide-react';

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
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

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
            Your information is automatically displayed to employers when applying.
          </p>
        </div>
        {saveSuccess && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Changes Saved Successfully
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
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
              placeholder="e.g. Senior Full-Stack Engineer"
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
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            Key Competencies & Skills
          </h3>

          <div className="flex gap-2">
            <Input
              placeholder="Type a skill (e.g. React, Node.js, Docker)..."
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
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-red-600 focus:outline-none"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </Card>

        {/* Social / Portfolio Links */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            Professional Profiles
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

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
