import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/StatusBadge';
import {
  Search,
  Briefcase,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Users,
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Next-Gen Enterprise Recruitment & ATS Pipeline</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Hire better.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Build stronger teams.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed">
              A modern applicant tracking platform designed for teams that take hiring seriously. Connect candidates, manage custom ATS evaluation stages, and accelerate recruitment decisions with intelligent insights.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/jobs">
                <Button size="lg" variant="primary" icon={Search} className="w-full sm:w-auto shadow-sm">
                  Find Jobs
                </Button>
              </Link>
              <Link to="/register?role=RECRUITER">
                <Button size="lg" variant="outline" icon={Briefcase} className="w-full sm:w-auto">
                  For Employers
                </Button>
              </Link>
            </div>

            {/* Platform Credibility Metrics */}
            <div className="mt-12 pt-8 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-2xl font-black text-slate-900">7 Stages</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Strict ATS Pipeline</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">Dual JWT</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">HttpOnly Cookies</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">AI Assisted</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Skill Fit Analysis</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">Enterprise</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Role Governance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">
              End-to-End Workflow
            </h2>
            <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              How HireFlow Powers Modern Hiring
            </h3>
            <p className="mt-3 text-sm text-slate-600">
              From application discovery to final offer letters, every step is orchestrated with validation and clarity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Candidate Experience Card */}
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <span className="p-2.5 rounded-lg bg-blue-100 text-blue-700">
                  <FileCheck className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-base font-bold text-slate-900">For Candidates</h4>
                  <p className="text-xs text-slate-500">Transparent job hunting experience</p>
                </div>
              </div>
              <ul className="space-y-3 text-xs text-slate-600 mt-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Discover verified engineering and tech positions with transparent salary bands.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Upload PDF resumes with automated AI skill extraction and improvement tips.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Track your application status in real-time as recruiters advance stages.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Receive calendar invites and online meeting links for scheduled interviews.</span>
                </li>
              </ul>
              <div className="mt-8 pt-6 border-t border-slate-100">
                <Link to="/jobs" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  Explore Open Requisitions <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Recruiter Experience Card */}
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <span className="p-2.5 rounded-lg bg-indigo-100 text-indigo-700">
                  <Layers className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-base font-bold text-slate-900">For Employers & Recruiters</h4>
                  <p className="text-xs text-slate-500">Production-grade recruitment operations</p>
                </div>
              </div>
              <ul className="space-y-3 text-xs text-slate-600 mt-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Manage verified company profiles and publish structured job listings.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>ATS Kanban Pipeline with strict state machine transitions and zero invalid skips.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Automated candidate AI match scoring and skill gap insights.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Schedule interviews, capture rubric evaluation notes, and issue offers.</span>
                </li>
              </ul>
              <div className="mt-8 pt-6 border-t border-slate-100">
                <Link to="/register?role=RECRUITER" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  Register as an Employer <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Decision Support Feature Highlight */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium mb-4">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Decision Support (Not Black Box)</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                AI Intelligence that Empowers Human Recruiters
              </h2>
              <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                HireFlow integrates Google Gemini with deterministic heuristic fallbacks. We extract verified technical skills, highlight strengths, identify potential competency gaps, and generate tailored technical interview questions.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-blue-50 text-blue-600 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Semantic Job-Resume Matching</h4>
                    <p className="text-xs text-slate-500">Calculates match percentages against exact job requirements.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-blue-50 text-blue-600 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Resume Optimization Feedback</h4>
                    <p className="text-xs text-slate-500">Constructive feedback helping candidates put their best foot forward.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-blue-50 text-blue-600 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Structured Interview Rubrics</h4>
                    <p className="text-xs text-slate-500">Objective scorecards for technical skill, communication, and team alignment.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Mock UI Card */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    AI
                  </div>
                  <span className="text-xs font-bold text-slate-800">Match Breakdown Preview</span>
                </div>
                <Badge variant="primary">AI-assisted insight</Badge>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span className="text-slate-700">Overall Requisition Match</span>
                    <span className="text-blue-600 font-bold">92%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs space-y-2">
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
                      Matched Competencies:
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {['React', 'Node.js', 'MongoDB', 'REST API', 'Docker'].map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium text-[11px]">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide">
                      Growth Area:
                    </span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Kubernetes cluster ingress administration (recommended for onboarding).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Ready to upgrade your recruitment pipeline?
          </h2>
          <p className="mt-3 text-sm text-slate-300 max-w-xl mx-auto">
            Experience real commercial SaaS ATS workflows, clean data architecture, and full role-based governance.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register">
              <Button size="lg" variant="primary">
                Get Started Today
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-slate-900 bg-white hover:bg-slate-100">
                Log In to Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
