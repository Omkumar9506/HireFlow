import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { User } from '../src/modules/auth/user.model.js';
import { Candidate } from '../src/modules/candidates/candidate.model.js';
import { Recruiter } from '../src/modules/recruiters/recruiter.model.js';
import { Company } from '../src/modules/companies/company.model.js';
import { Job } from '../src/modules/jobs/job.model.js';
import { Application } from '../src/modules/applications/application.model.js';
import { Resume } from '../src/modules/resumes/resume.model.js';
import { Interview } from '../src/modules/interviews/interview.model.js';
import { Notification } from '../src/modules/notifications/notification.model.js';
import { SavedJob } from '../src/modules/jobs/savedJob.model.js';
import { AuditLog } from '../src/modules/admin/auditLog.model.js';

import {
  ROLES,
  COMPANY_STATUS,
  JOB_STATUS,
  EMPLOYMENT_TYPE,
  WORK_MODE,
  APPLICATION_STATUS,
  INTERVIEW_TYPE,
  INTERVIEW_STATUS,
} from '../src/utils/constants.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hireflow_ats';

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB for seeding...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully. Cleaning existing database records...');

    // Clear collections
    await Promise.all([
      User.deleteMany({}),
      Candidate.deleteMany({}),
      Recruiter.deleteMany({}),
      Company.deleteMany({}),
      Job.deleteMany({}),
      Application.deleteMany({}),
      Resume.deleteMany({}),
      Interview.deleteMany({}),
      Notification.deleteMany({}),
      SavedJob.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    console.log('Existing collections cleared. Seeding initial accounts...');
    const defaultPasswordHash = await User.hashPassword('Password123!');

    // 1. Create Admin
    const admin = await User.create({
      name: 'Eleanor Vance (Platform Admin)',
      email: 'admin@hireflow.dev',
      passwordHash: defaultPasswordHash,
      role: ROLES.ADMIN,
      isEmailVerified: true,
      isActive: true,
    });

    // 2. Create Recruiters
    const recruiter1User = await User.create({
      name: 'James Reynolds (Lead Recruiter)',
      email: 'recruiter@hireflow.dev',
      passwordHash: defaultPasswordHash,
      role: ROLES.RECRUITER,
      isEmailVerified: true,
      isActive: true,
    });

    const recruiter2User = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah.recruiter@hireflow.dev',
      passwordHash: defaultPasswordHash,
      role: ROLES.RECRUITER,
      isEmailVerified: true,
      isActive: true,
    });

    const recruiter3User = await User.create({
      name: 'David Kim',
      email: 'david.recruiter@hireflow.dev',
      passwordHash: defaultPasswordHash,
      role: ROLES.RECRUITER,
      isEmailVerified: true,
      isActive: true,
    });

    // 3. Create Companies
    const company1 = await Company.create({
      name: 'CloudScale Technologies',
      description: 'Enterprise cloud infrastructure, container orchestration, and multi-region microservices monitoring platform.',
      industry: 'Cloud Infrastructure & DevOps',
      website: 'https://cloudscale.example.com',
      location: 'San Francisco, CA',
      employeeCount: '250-500',
      foundedYear: 2019,
      createdBy: recruiter1User._id,
      verificationStatus: COMPANY_STATUS.APPROVED,
    });

    const company2 = await Company.create({
      name: 'FinEdge Systems',
      description: 'High-frequency institutional trading systems, automated clearing, and algorithmic portfolio intelligence.',
      industry: 'Financial Technology',
      website: 'https://finedge.example.com',
      location: 'New York, NY',
      employeeCount: '100-250',
      foundedYear: 2016,
      createdBy: recruiter2User._id,
      verificationStatus: COMPANY_STATUS.APPROVED,
    });

    const company3 = await Company.create({
      name: 'HealthPulse AI',
      description: 'AI-assisted medical diagnostics, clinical telemetry pipeline, and predictive patient care workflows.',
      industry: 'HealthTech & AI',
      website: 'https://healthpulse.example.com',
      location: 'Boston, MA',
      employeeCount: '50-100',
      foundedYear: 2021,
      createdBy: recruiter3User._id,
      verificationStatus: COMPANY_STATUS.APPROVED,
    });

    // Link Recruiters
    await Recruiter.create({
      userId: recruiter1User._id,
      companyId: company1._id,
      designation: 'Senior Director of Talent',
      phone: '+1 (415) 555-0191',
    });

    await Recruiter.create({
      userId: recruiter2User._id,
      companyId: company2._id,
      designation: 'Head of Global Recruiting',
      phone: '+1 (212) 555-0144',
    });

    await Recruiter.create({
      userId: recruiter3User._id,
      companyId: company3._id,
      designation: 'Principal Technical Recruiter',
      phone: '+1 (617) 555-0177',
    });

    // 4. Create Candidates
    const candUsersData = [
      {
        name: 'Jordan Hayes (Full-Stack Engineer)',
        email: 'candidate@hireflow.dev',
        headline: 'Senior Full-Stack Engineer | React, Node.js, Distributed Systems',
        bio: 'Passionate software craftsman with 6 years experience architecting cloud applications and high-throughput REST/GraphQL APIs.',
        skills: ['React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS', 'TypeScript'],
        location: 'San Francisco, CA',
      },
      {
        name: 'Alex Rivera',
        email: 'alex.dev@hireflow.dev',
        headline: 'Cloud & DevOps Architect | Kubernetes, Terraform, Go',
        bio: 'DevOps specialist focused on Kubernetes automation, CI/CD pipeline acceleration, and zero-downtime microservices.',
        skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'Go', 'Linux', 'CI/CD'],
        location: 'Austin, TX',
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@hireflow.dev',
        headline: 'Lead Frontend Engineer | React, UI Performance, Design Systems',
        bio: 'Frontend engineer dedicated to accessible, pixel-perfect user interfaces and snappy 60fps web performance.',
        skills: ['React', 'JavaScript', 'Tailwind CSS', 'Redux', 'Jest', 'TypeScript', 'GraphQL'],
        location: 'Seattle, WA',
      },
      {
        name: 'Marcus Chen',
        email: 'marcus.chen@hireflow.dev',
        headline: 'Machine Learning & Python Backend Developer',
        bio: 'Data scientist and ML engineer developing NLP pipelines, PyTorch models, and real-time inference microservices.',
        skills: ['Python', 'PyTorch', 'FastAPI', 'Docker', 'MongoDB', 'Machine Learning', 'Git'],
        location: 'Boston, MA',
      },
      {
        name: 'Elena Rostova',
        email: 'elena.rostova@hireflow.dev',
        headline: 'Senior Product Manager & Technical Architect',
        bio: 'Bridge between high-level business strategy and technical systems engineering. Scaled SaaS products from $0 to $15M ARR.',
        skills: ['Agile', 'Scrum', 'REST API', 'System Architecture', 'Product Strategy', 'SQL'],
        location: 'New York, NY',
      },
    ];

    const candidates = [];
    const candidateDocs = [];

    for (const data of candUsersData) {
      const user = await User.create({
        name: data.name,
        email: data.email,
        passwordHash: defaultPasswordHash,
        role: ROLES.CANDIDATE,
        isEmailVerified: true,
        isActive: true,
      });

      const candidate = await Candidate.create({
        userId: user._id,
        phone: '+1 (555) 234-5678',
        location: data.location,
        headline: data.headline,
        bio: data.bio,
        skills: data.skills,
        experience: [
          {
            title: 'Senior Software Engineer',
            company: 'Nexus Tech Labs',
            location: data.location,
            startDate: '2021',
            endDate: 'Present',
            isCurrent: true,
            description: 'Led core web application development, improved API response latency by 35%, and mentored 4 junior engineers.',
          },
          {
            title: 'Software Developer',
            company: 'Apex Digital Systems',
            location: data.location,
            startDate: '2019',
            endDate: '2021',
            isCurrent: false,
            description: 'Built scalable microservices and integrated payment gateways with 99.99% uptime.',
          },
        ],
        education: [
          {
            degree: 'Bachelor of Science in Computer Science',
            institution: 'University of Washington',
            startYear: '2015',
            endYear: '2019',
            grade: '3.8 GPA',
          },
        ],
      });

      // Create primary resume for each candidate
      const resume = await Resume.create({
        candidateId: candidate._id,
        fileName: `${data.name.split(' ')[0]}_Resume_2026.pdf`,
        fileUrl: `http://localhost:5000/uploads/resumes/sample-${data.email.split('@')[0]}.pdf`,
        fileType: 'application/pdf',
        fileSize: 145000,
        extractedText: `${data.name}\n${data.headline}\nSkills: ${data.skills.join(', ')}\nExperience: Nexus Tech Labs, Senior Engineer.\nEducation: B.S. in Computer Science.`,
        skills: data.skills,
        experience: 'Over 5 years of demonstrated software engineering leadership and production deployment experience.',
        education: 'B.S. in Computer Science from accredited institution.',
        aiAnalysis: {
          detectedSkills: data.skills,
          experienceSummary: 'Experienced technical practitioner with a demonstrated track record of building production systems.',
          educationSummary: 'Bachelor degree in Computer Science.',
          strengths: ['Strong command of modern frameworks', 'Clean code practices', 'System design competencies'],
          improvementSuggestions: ['Add links to open-source contributions', 'Include quantitative production metrics'],
          analyzedAt: new Date(),
        },
        isPrimary: true,
      });

      candidate.resumeId = resume._id;
      await candidate.save();

      candidates.push({ user, candidate, resume });
      candidateDocs.push(candidate);
    }

    // 5. Create 10 Jobs
    const jobsData = [
      {
        companyId: company1._id,
        recruiterId: recruiter1User._id,
        title: 'Senior Full-Stack Engineer',
        description: 'Join CloudScale Technologies to architect next-generation cloud monitoring portals, high-concurrency event ingestion pipelines, and interactive analytics views.',
        responsibilities: [
          'Design and maintain robust REST APIs using Node.js and MongoDB',
          'Build responsive, highly interactive web applications in React and Tailwind CSS',
          'Collaborate with DevOps engineers on Kubernetes deployments and CI/CD pipelines',
        ],
        requirements: [
          '5+ years experience with full-stack JavaScript (React, Node.js, Express)',
          'Strong understanding of NoSQL database schema design and indexing',
          'Demonstrated experience building automated test suites with Jest',
        ],
        benefits: ['Comprehensive health, dental & vision', '401(k) matching up to 5%', 'Flexible remote work stipend'],
        employmentType: EMPLOYMENT_TYPE.FULL_TIME,
        workMode: WORK_MODE.REMOTE,
        location: 'San Francisco, CA',
        salary: { min: 140000, max: 185000, currency: 'USD', period: 'yearly' },
        experience: { min: 4, max: 8 },
        skills: ['React', 'Node.js', 'Express', 'MongoDB', 'Docker', 'AWS'],
        openings: 2,
        status: JOB_STATUS.PUBLISHED,
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        companyId: company1._id,
        recruiterId: recruiter1User._id,
        title: 'Cloud DevOps Architect',
        description: 'We are seeking an experienced DevOps Architect to scale our multi-cluster Kubernetes platform and automated infrastructure provisioning.',
        responsibilities: [
          'Manage Terraform modules for AWS cloud resources',
          'Optimize Kubernetes ingress controllers and monitoring dashboards',
          'Ensure high availability across 5 global AWS regions',
        ],
        requirements: ['Extensive hands-on Kubernetes and Docker experience', 'Proficiency in Go or Python for automation', 'Solid networking and Linux kernel tuning knowledge'],
        benefits: ['Unlimited PTO', 'Top-tier medical insurance', 'Home office budget'],
        employmentType: EMPLOYMENT_TYPE.FULL_TIME,
        workMode: WORK_MODE.HYBRID,
        location: 'San Francisco, CA',
        salary: { min: 160000, max: 210000, currency: 'USD', period: 'yearly' },
        experience: { min: 5, max: 10 },
        skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'Linux', 'CI/CD'],
        openings: 1,
        status: JOB_STATUS.PUBLISHED,
        applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      },
      {
        companyId: company2._id,
        recruiterId: recruiter2User._id,
        title: 'Backend Systems Engineer (FinTech)',
        description: 'FinEdge Systems is looking for a Backend Engineer to build resilient transaction processing microservices with sub-millisecond execution guarantees.',
        responsibilities: ['Architect low-latency REST and WebSocket services', 'Ensure transactional consistency and audit compliance', 'Profile memory and event loop bottlenecks'],
        requirements: ['Strong expertise in Node.js, Express, or Go', 'Deep understanding of concurrency and caching strategies', 'Experience with SQL/NoSQL distributed databases'],
        benefits: ['Competitive annual performance bonus', '401(k) with 6% company match', 'Catered lunches'],
        employmentType: EMPLOYMENT_TYPE.FULL_TIME,
        workMode: WORK_MODE.ONSITE,
        location: 'New York, NY',
        salary: { min: 155000, max: 195000, currency: 'USD', period: 'yearly' },
        experience: { min: 3, max: 7 },
        skills: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'Docker', 'System Architecture'],
        openings: 3,
        status: JOB_STATUS.PUBLISHED,
        applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      },
      {
        companyId: company2._id,
        recruiterId: recruiter2User._id,
        title: 'Frontend React UI Specialist',
        description: 'Create lightning-fast financial trading dashboards and analytics charts that render thousands of real-time price updates effortlessly.',
        responsibilities: ['Develop modular UI components using React and Tailwind', 'Integrate WebSocket streaming data', 'Optimize rendering performance'],
        requirements: ['4+ years in modern React and state management', 'Experience with Canvas/WebGL charts is a plus', 'Eye for clean UX design'],
        benefits: ['Generous equity package', 'Commuter benefits', 'Health wellness allowance'],
        employmentType: EMPLOYMENT_TYPE.FULL_TIME,
        workMode: WORK_MODE.HYBRID,
        location: 'New York, NY',
        salary: { min: 135000, max: 175000, currency: 'USD', period: 'yearly' },
        experience: { min: 3, max: 6 },
        skills: ['React', 'JavaScript', 'Tailwind CSS', 'Redux', 'REST API'],
        openings: 1,
        status: JOB_STATUS.PUBLISHED,
        applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      },
      {
        companyId: company3._id,
        recruiterId: recruiter3User._id,
        title: 'Machine Learning Infrastructure Engineer',
        description: 'HealthPulse AI needs an ML engineer to build scalable model serving pipelines, data validation flows, and diagnostic telemetry infrastructure.',
        responsibilities: ['Deploy deep learning models with low-latency APIs', 'Build automated retraining pipelines', 'Ensure HIPAA-compliant data security'],
        requirements: ['Proficiency with Python, PyTorch, and Docker', 'Experience serving ML models in cloud environments', 'Strong mathematical foundation'],
        benefits: ['Meaningful mission improving healthcare outcomes', 'Equity grants', 'Flexible work hours'],
        employmentType: EMPLOYMENT_TYPE.FULL_TIME,
        workMode: WORK_MODE.REMOTE,
        location: 'Boston, MA',
        salary: { min: 150000, max: 200000, currency: 'USD', period: 'yearly' },
        experience: { min: 3, max: 8 },
        skills: ['Python', 'PyTorch', 'Docker', 'Machine Learning', 'AWS', 'FastAPI'],
        openings: 2,
        status: JOB_STATUS.PUBLISHED,
        applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
      {
        companyId: company3._id,
        recruiterId: recruiter3User._id,
        title: 'Lead Product Manager - Clinical Telemetry',
        description: 'Drive the roadmap for our flagship medical intelligence system from clinician research through engineering delivery.',
        responsibilities: ['Define customer journeys and PRDs', 'Collaborate with engineering leads on sprint planning', 'Analyze telemetry engagement metrics'],
        requirements: ['5+ years product management experience in SaaS or HealthTech', 'Technical acumen to interface with senior engineers', 'Outstanding communication'],
        benefits: ['Comprehensive healthcare plans', 'Parental leave', 'Annual education stipend'],
        employmentType: EMPLOYMENT_TYPE.FULL_TIME,
        workMode: WORK_MODE.HYBRID,
        location: 'Boston, MA',
        salary: { min: 145000, max: 190000, currency: 'USD', period: 'yearly' },
        experience: { min: 5, max: 9 },
        skills: ['Product Strategy', 'Agile', 'Scrum', 'System Architecture'],
        openings: 1,
        status: JOB_STATUS.PUBLISHED,
        applicationDeadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      },
      {
        companyId: company1._id,
        recruiterId: recruiter1User._id,
        title: 'Associate Software Engineer (Intern/Junior)',
        description: 'A dedicated growth role for emerging developers to learn production engineering, code review best practices, and automated testing.',
        responsibilities: ['Implement feature fixes and unit tests', 'Assist in documentation', 'Participate in daily standups'],
        requirements: ['Knowledge of JavaScript or Python', 'Basic understanding of Git and web protocols', 'Hunger to learn'],
        benefits: ['Mentorship from principal engineers', 'Book allowance', 'Flexible schedule'],
        employmentType: EMPLOYMENT_TYPE.INTERNSHIP,
        workMode: WORK_MODE.REMOTE,
        location: 'San Francisco, CA',
        salary: { min: 70000, max: 95000, currency: 'USD', period: 'yearly' },
        experience: { min: 0, max: 2 },
        skills: ['JavaScript', 'HTML5', 'CSS3', 'Git', 'React'],
        openings: 2,
        status: JOB_STATUS.PUBLISHED,
        applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
      {
        companyId: company2._id,
        recruiterId: recruiter2User._id,
        title: 'Lead QA Automation Engineer',
        description: 'Build robust end-to-end testing frameworks to validate critical transaction clearing paths and security requirements.',
        responsibilities: ['Author Playwright and Jest integration suites', 'Integrate tests into GitHub Actions CI pipelines', 'Analyze test flakiness'],
        requirements: ['Strong automation background in JavaScript or Python', 'Knowledge of load testing tools like k6', 'Detail-oriented approach'],
        benefits: ['Hybrid work model', 'Health & wellness perk', 'Generous 401(k)'],
        employmentType: EMPLOYMENT_TYPE.FULL_TIME,
        workMode: WORK_MODE.HYBRID,
        location: 'New York, NY',
        salary: { min: 130000, max: 165000, currency: 'USD', period: 'yearly' },
        experience: { min: 4, max: 7 },
        skills: ['Jest', 'CI/CD', 'JavaScript', 'REST API', 'Git'],
        openings: 1,
        status: JOB_STATUS.PUBLISHED,
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 1000),
      },
      {
        companyId: company1._id,
        recruiterId: recruiter1User._id,
        title: 'Draft: Site Reliability Engineer',
        description: 'Internal draft job for upcoming Q3 infrastructure expansion.',
        responsibilities: ['SLO and error budget tracking', 'Incident response automation'],
        requirements: ['5+ years SRE experience', 'Prometheus and Grafana'],
        benefits: ['Standard corporate benefits'],
        employmentType: EMPLOYMENT_TYPE.FULL_TIME,
        workMode: WORK_MODE.REMOTE,
        location: 'San Francisco, CA',
        salary: { min: 150000, max: 190000, currency: 'USD', period: 'yearly' },
        experience: { min: 5, max: 9 },
        skills: ['Linux', 'Docker', 'AWS', 'Kubernetes'],
        openings: 1,
        status: JOB_STATUS.DRAFT,
        applicationDeadline: null,
      },
      {
        companyId: company3._id,
        recruiterId: recruiter3User._id,
        title: 'Closed: Senior Bioinformatician',
        description: 'Role successfully filled during previous hiring cycle.',
        responsibilities: ['Genomic sequencing pipeline development'],
        requirements: ['PhD or M.S. in Bioinformatics'],
        benefits: ['Standard benefits'],
        employmentType: EMPLOYMENT_TYPE.FULL_TIME,
        workMode: WORK_MODE.ONSITE,
        location: 'Boston, MA',
        salary: { min: 130000, max: 170000, currency: 'USD', period: 'yearly' },
        experience: { min: 4, max: 8 },
        skills: ['Python', 'Machine Learning'],
        openings: 1,
        status: JOB_STATUS.CLOSED,
        applicationDeadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ];

    const jobs = await Job.create(jobsData);
    console.log(`Created ${jobs.length} jobs.`);

    // 6. Create 20 Applications across all stages of the ATS Pipeline
    const statuses = [
      APPLICATION_STATUS.APPLIED,
      APPLICATION_STATUS.SCREENING,
      APPLICATION_STATUS.SHORTLISTED,
      APPLICATION_STATUS.INTERVIEW,
      APPLICATION_STATUS.SELECTED,
      APPLICATION_STATUS.OFFERED,
      APPLICATION_STATUS.HIRED,
      APPLICATION_STATUS.REJECTED,
      APPLICATION_STATUS.WITHDRAWN,
    ];

    const activePublishedJobs = jobs.filter((j) => j.status === JOB_STATUS.PUBLISHED);

    let appIndex = 0;
    const applications = [];

    // Pair candidates with jobs
    for (let i = 0; i < candidates.length; i++) {
      const cand = candidates[i];
      for (let j = 0; j < 4; j++) {
        const job = activePublishedJobs[(i * 2 + j) % activePublishedJobs.length];
        const status = statuses[appIndex % statuses.length];
        const matchScore = 65 + ((i * 11 + j * 7) % 32); // realistic scores 65 - 97%

        const app = await Application.create({
          jobId: job._id,
          candidateId: cand.candidate._id,
          resumeId: cand.resume._id,
          status,
          coverLetter: `I am very excited to apply for ${job.title} at ${company1.name}. With my hands-on background in ${cand.candidate.skills.slice(0, 3).join(', ')}, I am confident I can make an immediate contribution to your engineering team.`,
          matchScore,
          matchAnalysis: {
            matchedSkills: cand.candidate.skills.filter((s) => job.skills.includes(s)),
            missingSkills: job.skills.filter((s) => !cand.candidate.skills.includes(s)),
            experienceMatch: matchScore > 80 ? 'Strong' : 'Moderate',
            explanation: `Candidate demonstrates strong competency matching ${matchScore}% of target job requirements.`,
          },
          recruiterNotes: [
            {
              authorId: job.recruiterId,
              note: `Candidate profile reviewed. Excellent background in ${cand.candidate.skills[0] || 'core technologies'}.`,
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            },
          ],
          statusHistory: [
            {
              fromStatus: null,
              toStatus: APPLICATION_STATUS.APPLIED,
              changedBy: cand.user._id,
              reason: 'Application submitted',
              changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            },
            ...(status !== APPLICATION_STATUS.APPLIED
              ? [
                  {
                    fromStatus: APPLICATION_STATUS.APPLIED,
                    toStatus: status,
                    changedBy: job.recruiterId,
                    reason: `Moved forward to ${status} stage by recruiter`,
                    changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                  },
                ]
              : []),
          ],
          appliedAt: new Date(Date.now() - (10 - (appIndex % 8)) * 24 * 60 * 60 * 1000),
        });

        applications.push(app);
        appIndex++;
      }
    }

    console.log(`Created ${applications.length} applications.`);

    // 7. Create Interviews for INTERVIEW, SELECTED, OFFERED, HIRED applications
    const interviewApps = applications.filter((a) =>
      [
        APPLICATION_STATUS.INTERVIEW,
        APPLICATION_STATUS.SELECTED,
        APPLICATION_STATUS.OFFERED,
        APPLICATION_STATUS.HIRED,
      ].includes(a.status)
    );

    for (let k = 0; k < interviewApps.length; k++) {
      const app = interviewApps[k];
      const job = jobs.find((j) => j._id.toString() === app.jobId.toString());
      const isPast = k % 2 === 1;

      await Interview.create({
        applicationId: app._id,
        recruiterId: job.recruiterId,
        candidateId: app.candidateId,
        type: k % 3 === 0 ? INTERVIEW_TYPE.ONLINE : INTERVIEW_TYPE.PHONE,
        scheduledAt: isPast
          ? new Date(Date.now() - (k + 1) * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + (k + 1) * 24 * 60 * 60 * 1000 + 3600000),
        duration: 45,
        meetingLink: 'https://meet.google.com/hfw-prod-demo',
        status: isPast ? INTERVIEW_STATUS.COMPLETED : INTERVIEW_STATUS.SCHEDULED,
        notes: 'Technical architectural screening and coding evaluation.',
        feedback: isPast
          ? {
              rating: 4,
              technicalSkillScore: 4,
              communicationScore: 5,
              cultureFitScore: 4,
              strengths: 'Very articulate, strong knowledge of distributed data structures and clean API design.',
              weaknesses: 'Could deepen knowledge of edge-case concurrency locking.',
              recommendation: 'HIRE',
              submittedAt: new Date(),
            }
          : undefined,
      });
    }

    // 8. Create Candidate Saved Jobs
    const candidate1 = candidates[0].candidate;
    await SavedJob.create({ candidateId: candidate1._id, jobId: activePublishedJobs[0]._id });
    await SavedJob.create({ candidateId: candidate1._id, jobId: activePublishedJobs[1]._id });

    // 9. Create Notifications
    await Notification.create({
      userId: candidates[0].user._id,
      type: 'INTERVIEW_SCHEDULED',
      title: 'Interview Scheduled: Senior Full-Stack Engineer',
      message: 'Your technical interview with CloudScale Technologies has been scheduled.',
      metadata: { jobId: activePublishedJobs[0]._id },
      isRead: false,
    });

    await Notification.create({
      userId: recruiter1User._id,
      type: 'NEW_APPLICATION',
      title: 'New Candidate Applied: Senior Full-Stack Engineer',
      message: 'Jordan Hayes applied with 92% match score.',
      metadata: { jobId: activePublishedJobs[0]._id },
      isRead: false,
    });

    // 10. Create Audit Logs
    await AuditLog.create({
      userId: admin._id,
      action: 'COMPANY_VERIFIED',
      entity: 'COMPANY',
      entityId: company1._id.toString(),
      newValue: { verificationStatus: COMPANY_STATUS.APPROVED },
      ipAddress: '127.0.0.1',
      userAgent: 'Seed-Worker/1.0',
    });

    await AuditLog.create({
      userId: recruiter1User._id,
      action: 'JOB_PUBLISHED',
      entity: 'JOB',
      entityId: activePublishedJobs[0]._id.toString(),
      newValue: { title: activePublishedJobs[0].title },
      ipAddress: '127.0.0.1',
      userAgent: 'Seed-Worker/1.0',
    });

    console.log('Seeding complete!');
    console.log('====================================================');
    console.log('DEMO ACCOUNTS FOR LOCAL TESTING:');
    console.log('Admin:     admin@hireflow.dev       / Password123!');
    console.log('Recruiter: recruiter@hireflow.dev   / Password123!');
    console.log('Candidate: candidate@hireflow.dev   / Password123!');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
