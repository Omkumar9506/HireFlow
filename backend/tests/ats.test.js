import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { ENV } from '../src/config/env.js';
import { APPLICATION_STATUS } from '../src/utils/constants.js';

describe('HireFlow ATS Backend Test Suite', () => {
  let candidateToken = '';
  let recruiterToken = '';
  let adminToken = '';
  let candidateId = '';
  let testJobId = '';
  let testApplicationId = '';
  let createdJobId = '';

  beforeAll(async () => {
    await mongoose.connect(ENV.MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('1. Authentication & Role Authorization', () => {
    it('should log in as Admin successfully', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'admin@hireflow.dev',
        password: 'Password123!',
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('ADMIN');
      adminToken = res.body.data.accessToken;
    });

    it('should log in as Recruiter successfully', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'recruiter@hireflow.dev',
        password: 'Password123!',
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('RECRUITER');
      recruiterToken = res.body.data.accessToken;
    });

    it('should log in as Candidate successfully', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'candidate@hireflow.dev',
        password: 'Password123!',
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('CANDIDATE');
      candidateToken = res.body.data.accessToken;
      candidateId = res.body.data.user.id;
    });

    it('should register a new Candidate account and return tokens and cookies', async () => {
      const uniqueEmail = `test.candidate.${Date.now()}@hireflow.dev`;
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'New Test Candidate',
        email: uniqueEmail,
        password: 'Password123!',
        role: 'CANDIDATE',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('CANDIDATE');
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.headers['set-cookie']).toBeDefined();

      // Test duplicate registration rejection
      const dupRes = await request(app).post('/api/v1/auth/register').send({
        name: 'Duplicate',
        email: uniqueEmail,
        password: 'Password123!',
        role: 'CANDIDATE',
      });
      expect(dupRes.status).toBe(409);
      expect(dupRes.body.success).toBe(false);
    });

    it('should rotate refresh token and issue new access token on refresh', async () => {
      // Login to get cookies
      const loginRes = await request(app).post('/api/v1/auth/login').send({
        email: 'candidate@hireflow.dev',
        password: 'Password123!',
      });
      const cookie = loginRes.headers['set-cookie'];

      const refreshRes = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', cookie);

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.success).toBe(true);
      expect(refreshRes.body.data.accessToken).toBeDefined();
      expect(refreshRes.headers['set-cookie']).toBeDefined();
    });

    it('should block Candidate from accessing Admin endpoints (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${candidateToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow Admin to access Admin statistics', async () => {
      const res = await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.overview.totalUsers).toBeGreaterThan(0);
    });
  });

  describe('2. Phase 3: Candidate & Recruiter Profile Management', () => {
    it('should retrieve logged-in candidate profile with user details', async () => {
      const res = await request(app)
        .get('/api/v1/candidates/me')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.userId).toBeDefined();
      expect(res.body.data.userId.email).toBe('candidate@hireflow.dev');
      expect(Array.isArray(res.body.data.skills)).toBe(true);
    });

    it('should update candidate profile and synchronize user name', async () => {
      const updatedHeadline = 'Lead Full-Stack Systems Architect';
      const updatedSkills = ['React', 'Node.js', 'Express', 'MongoDB', 'Docker', 'Kubernetes', 'AWS', 'TypeScript', 'GraphQL'];

      const res = await request(app)
        .patch('/api/v1/candidates/me')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          headline: updatedHeadline,
          skills: updatedSkills,
          bio: 'Passionate engineering lead specializing in high-throughput cloud architectures.',
          phone: '+1 (555) 987-6543',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.headline).toBe(updatedHeadline);
      expect(res.body.data.skills).toEqual(expect.arrayContaining(['GraphQL', 'Kubernetes']));
      expect(res.body.data.phone).toBe('+1 (555) 987-6543');
    });

    it('should retrieve logged-in recruiter profile with company link', async () => {
      const res = await request(app)
        .get('/api/v1/recruiters/me')
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.userId).toBeDefined();
      expect(res.body.data.userId.email).toBe('recruiter@hireflow.dev');
      expect(res.body.data.designation).toBeDefined();
    });

    it('should update recruiter profile designation and phone', async () => {
      const res = await request(app)
        .patch('/api/v1/recruiters/me')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          designation: 'VP of Global Talent Acquisition',
          phone: '+1 (415) 555-9988',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.designation).toBe('VP of Global Talent Acquisition');
      expect(res.body.data.phone).toBe('+1 (415) 555-9988');
    });
  });

  describe('3. Phase 4: Company Profile & Admin Verification Flow', () => {
    let unapprovedRecruiterToken = '';
    let pendingCompanyId = '';

    it('should register a new recruiter without an approved company', async () => {
      const email = `new.recruiter.${Date.now()}@hireflow.dev`;
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Startup Founder Recruiter',
        email,
        password: 'Password123!',
        role: 'RECRUITER',
      });
      expect(res.status).toBe(201);
      unapprovedRecruiterToken = res.body.data.accessToken;
    });

    it('should create a new company with PENDING status for the new recruiter', async () => {
      const compName = `NextGen Labs ${Date.now()}`;
      const res = await request(app)
        .post('/api/v1/companies')
        .set('Authorization', `Bearer ${unapprovedRecruiterToken}`)
        .send({
          name: compName,
          industry: 'Artificial Intelligence',
          location: 'San Jose, CA',
          website: 'https://nextgen.example.com',
          employeeCount: '11-50',
          foundedYear: 2024,
          description: 'Autonomous AI agents for enterprise automation.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.verificationStatus).toBe('PENDING');
      pendingCompanyId = res.body.data._id;
    });

    it('should block unapproved company from publishing live jobs (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${unapprovedRecruiterToken}`)
        .send({
          title: 'Senior AI Engineer',
          description: 'Building deep learning systems with PyTorch and Transformers.',
          employmentType: 'FULL_TIME',
          workMode: 'REMOTE',
          location: 'San Jose, CA',
          skills: ['Python', 'PyTorch', 'Docker'],
          status: 'PUBLISHED', // Attempting to publish without approval
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/verified and approved/i);
    });

    it('should allow unapproved company to save job as DRAFT', async () => {
      const res = await request(app)
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${unapprovedRecruiterToken}`)
        .send({
          title: 'Draft ML Researcher',
          description: 'Drafting requirements for next quarter.',
          employmentType: 'FULL_TIME',
          workMode: 'REMOTE',
          location: 'San Jose, CA',
          skills: ['Python'],
          status: 'DRAFT',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('DRAFT');
    });

    it('should allow Admin to list companies and inspect pending verification queue', async () => {
      const res = await request(app)
        .get('/api/v1/admin/companies?status=PENDING')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.items)).toBe(true);
      const found = res.body.data.items.find((c) => c._id === pendingCompanyId);
      expect(found).toBeDefined();
    });

    it('should allow Admin to approve company verification request', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/companies/${pendingCompanyId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'APPROVED' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.verificationStatus).toBe('APPROVED');
    });

    it('should now allow the approved company recruiter to publish live jobs', async () => {
      const res = await request(app)
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${unapprovedRecruiterToken}`)
        .send({
          title: 'Senior AI Engineer (Live)',
          description: 'Building deep learning systems with PyTorch and Transformers.',
          employmentType: 'FULL_TIME',
          workMode: 'REMOTE',
          location: 'San Jose, CA',
          skills: ['Python', 'PyTorch', 'Docker'],
          status: 'PUBLISHED',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PUBLISHED');
    });
  });

  describe('4. Phase 5: Job Management, Search, Filtering, Saved Jobs & Pagination', () => {
    it('should search published jobs with faceted filtering and pagination metadata', async () => {
      const res = await request(app).get('/api/v1/jobs?page=1&limit=5');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);
      expect(res.body.data.pagination).toBeDefined();
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.limit).toBe(5);
      expect(typeof res.body.data.pagination.total).toBe('number');
      expect(typeof res.body.data.pagination.totalPages).toBe('number');
      expect(typeof res.body.data.pagination.hasNextPage).toBe('boolean');
      testJobId = res.body.data.items[0]._id;
    });

    it('should filter jobs by keyword search', async () => {
      const res = await request(app).get('/api/v1/jobs?search=Engineer');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);
      expect(res.body.data.items.some(j => j.title.toLowerCase().includes('engineer'))).toBe(true);
    });

    it('should allow recruiter to create a comprehensive job requisition with details', async () => {
      const res = await request(app)
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          title: 'Principal Distributed Systems Architect',
          description: 'Design and scale multi-tenant cloud-native microservices.',
          responsibilities: [
            'Architect scalable backend distributed systems',
            'Lead architectural design reviews and technical roadmaps',
          ],
          requirements: [
            '8+ years of high-concurrency Node.js / Go / Rust experience',
            'Strong background in distributed consensus algorithms',
          ],
          benefits: ['Comprehensive health & dental coverage', '$5,000 annual learning stipend'],
          employmentType: 'FULL_TIME',
          workMode: 'HYBRID',
          location: 'San Francisco, CA',
          salary: { min: 180000, max: 240000, currency: 'USD', period: 'yearly' },
          experience: { min: 7, max: 12 },
          skills: ['Node.js', 'Go', 'Distributed Systems', 'Kubernetes', 'MongoDB'],
          openings: 2,
          status: 'PUBLISHED',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Principal Distributed Systems Architect');
      expect(res.body.data.salary.min).toBe(180000);
      createdJobId = res.body.data._id;
    });

    it('should allow recruiter to update job details', async () => {
      const res = await request(app)
        .patch(`/api/v1/jobs/${createdJobId}`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          title: 'Staff / Principal Distributed Systems Architect',
          openings: 3,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Staff / Principal Distributed Systems Architect');
      expect(res.body.data.openings).toBe(3);
    });

    it('should allow recruiter to close a job requisition', async () => {
      const res = await request(app)
        .post(`/api/v1/jobs/${createdJobId}/close`)
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('CLOSED');
    });

    it('should allow recruiter to republish a closed job requisition', async () => {
      const res = await request(app)
        .post(`/api/v1/jobs/${createdJobId}/publish`)
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PUBLISHED');
    });

    it('should allow candidate to save a job to their saved jobs list', async () => {
      const res = await request(app)
        .post(`/api/v1/jobs/${createdJobId}/save`)
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should show isSaved: true when candidate fetches the job details', async () => {
      const res = await request(app)
        .get(`/api/v1/jobs/${createdJobId}`)
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isSaved).toBe(true);
    });

    it('should list the job in candidate saved jobs', async () => {
      const res = await request(app)
        .get('/api/v1/candidates/saved-jobs')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const found = res.body.data.find((j) => j._id === createdJobId);
      expect(found).toBeDefined();
    });

    it('should allow candidate to unsave the job', async () => {
      const res = await request(app)
        .delete(`/api/v1/jobs/${createdJobId}/save`)
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const checkRes = await request(app)
        .get(`/api/v1/jobs/${createdJobId}`)
        .set('Authorization', `Bearer ${candidateToken}`);
      expect(checkRes.body.data.isSaved).toBe(false);
    });
  });

  describe('5. Phase 6: Applications & ATS Pipeline State Machine', () => {
    let phase6AppId = '';

    it('should allow candidate to submit a job application', async () => {
      const res = await request(app)
        .post(`/api/v1/jobs/${createdJobId}/apply`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          coverLetter: 'I am highly interested in this distributed systems architect role.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('APPLIED');
      phase6AppId = res.body.data._id;
    });

    it('should strictly reject duplicate application to the same job (409 Conflict)', async () => {
      const res = await request(app)
        .post(`/api/v1/jobs/${createdJobId}/apply`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ coverLetter: 'Duplicate attempt' });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already applied/i);
    });

    it('should allow recruiter to retrieve applications for the job on ATS Kanban board', async () => {
      const res = await request(app)
        .get(`/api/v1/applications/job/${createdJobId}`)
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const found = res.body.data.find(a => a._id === phase6AppId);
      expect(found).toBeDefined();
    });

    it('should allow recruiter to add internal hiring evaluation notes', async () => {
      const res = await request(app)
        .post(`/api/v1/applications/${phase6AppId}/notes`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({ note: 'Candidate profile shows extensive microservices background. Advancing to screening.' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[res.body.data.length - 1].note).toContain('Advancing to screening');
    });

    it('should strictly reject invalid status jumps (e.g. APPLIED -> HIRED directly)', async () => {
      const res = await request(app)
        .patch(`/api/v1/applications/${phase6AppId}/status`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({ status: 'HIRED' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid ATS pipeline transition/i);
    });

    it('should forbid candidate from modifying evaluation stage (403 Forbidden)', async () => {
      const res = await request(app)
        .patch(`/api/v1/applications/${phase6AppId}/status`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ status: 'SHORTLISTED' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should advance smoothly through valid state machine transitions: APPLIED -> SCREENING -> SHORTLISTED -> INTERVIEW -> SELECTED -> OFFERED -> HIRED', async () => {
      const steps = [
        { next: 'SCREENING', reason: 'Resume matched tech stack' },
        { next: 'SHORTLISTED', reason: 'Hiring manager approved profile' },
        { next: 'INTERVIEW', reason: 'Technical loop scheduled' },
        { next: 'SELECTED', reason: 'Strong interview signals' },
        { next: 'OFFERED', reason: 'Formal offer extended' },
        { next: 'HIRED', reason: 'Candidate signed offer letter' },
      ];

      for (const step of steps) {
        const res = await request(app)
          .patch(`/api/v1/applications/${phase6AppId}/status`)
          .set('Authorization', `Bearer ${recruiterToken}`)
          .send({ status: step.next, reason: step.reason });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe(step.next);
      }

      // Check full audit trail
      const finalRes = await request(app)
        .get(`/api/v1/applications/${phase6AppId}`)
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(finalRes.status).toBe(200);
      expect(finalRes.body.data.statusHistory.length).toBe(7);
      expect(finalRes.body.data.status).toBe('HIRED');
    });

    it('should prevent any transition from terminal HIRED state', async () => {
      const res = await request(app)
        .patch(`/api/v1/applications/${phase6AppId}/status`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({ status: 'REJECTED' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Terminal state/i);
    });

    it('should allow candidate to withdraw an active application', async () => {
      const anotherRecruiterJob = await request(app)
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          title: 'Infrastructure Automation Engineer',
          description: 'Terraform and AWS infrastructure orchestration.',
          employmentType: 'FULL_TIME',
          workMode: 'REMOTE',
          location: 'San Francisco, CA',
          skills: ['AWS', 'Terraform'],
          status: 'PUBLISHED',
        });

      const applyRes = await request(app)
        .post(`/api/v1/jobs/${anotherRecruiterJob.body.data._id}/apply`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ coverLetter: 'Interested in DevOps' });

      const withdrawRes = await request(app)
        .patch(`/api/v1/applications/${applyRes.body.data._id}/status`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ status: 'WITHDRAWN', reason: 'Accepted another offer' });

      expect(withdrawRes.status).toBe(200);
      expect(withdrawRes.body.success).toBe(true);
      expect(withdrawRes.body.data.status).toBe('WITHDRAWN');
    });
  });

  describe('6. Phase 7: Resume Storage, Multer Validation & Parsing', () => {
    let uploadedResumeId = '';
    let secondResumeId = '';

    it('should reject resume upload with invalid file extension (400 Bad Request)', async () => {
      const res = await request(app)
        .post('/api/v1/resumes/upload')
        .set('Authorization', `Bearer ${candidateToken}`)
        .attach('resume', Buffer.from('malicious payload'), 'exploit.exe');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/only pdf, doc, and docx/i);
    });

    it('should reject upload without a file attached (400 Bad Request)', async () => {
      const res = await request(app)
        .post('/api/v1/resumes/upload')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should successfully upload and parse a valid PDF resume', async () => {
      // Create a minimal valid PDF header buffer
      const samplePdfContent = Buffer.from(
        '%PDF-1.4\n1 0 obj\n<< /Title (Software Engineer Resume) /Author (Candidate) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF'
      );

      const res = await request(app)
        .post('/api/v1/resumes/upload')
        .set('Authorization', `Bearer ${candidateToken}`)
        .attach('resume', samplePdfContent, 'John_Doe_Lead_Engineer.pdf');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fileName).toBe('John_Doe_Lead_Engineer.pdf');
      expect(res.body.data.fileUrl).toBeDefined();
      expect(res.body.data.aiAnalysis).toBeDefined();
      uploadedResumeId = res.body.data._id;
    });

    it('should allow candidate to retrieve all their uploaded resumes', async () => {
      const res = await request(app)
        .get('/api/v1/candidates/resumes')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some((r) => r._id === uploadedResumeId)).toBe(true);
    });

    it('should upload a second resume and allow switching primary status', async () => {
      const samplePdfContent = Buffer.from('%PDF-1.4\nSecond Resume\n%%EOF');
      const uploadRes = await request(app)
        .post('/api/v1/resumes/upload')
        .set('Authorization', `Bearer ${candidateToken}`)
        .attach('resume', samplePdfContent, 'Alternative_Resume.pdf');

      expect(uploadRes.status).toBe(201);
      secondResumeId = uploadRes.body.data._id;

      // Set second resume as primary
      const primaryRes = await request(app)
        .patch(`/api/v1/resumes/${secondResumeId}/primary`)
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(primaryRes.status).toBe(200);
      expect(primaryRes.body.success).toBe(true);
      expect(primaryRes.body.data.isPrimary).toBe(true);

      // Verify on candidate profile that resumeId updated
      const candRes = await request(app)
        .get('/api/v1/candidates/me')
        .set('Authorization', `Bearer ${candidateToken}`);
      expect(candRes.body.data.resumeId._id).toBe(secondResumeId);
    });

    it('should allow candidate to delete a resume', async () => {
      const delRes = await request(app)
        .delete(`/api/v1/candidates/resumes/${uploadedResumeId}`)
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(delRes.status).toBe(200);
      expect(delRes.body.success).toBe(true);

      // Check it is no longer returned in list
      const listRes = await request(app)
        .get('/api/v1/candidates/resumes')
        .set('Authorization', `Bearer ${candidateToken}`);
      expect(listRes.body.data.some((r) => r._id === uploadedResumeId)).toBe(false);
    });
  });

  describe('7. Phase 8: Interview Management System', () => {
    let testInterviewId = '';
    let interviewApplicationId = '';

    beforeAll(async () => {
      // Find an application owned by the recruiter to schedule interview
      const appsRes = await request(app)
        .get(`/api/v1/applications/job/${createdJobId}`)
        .set('Authorization', `Bearer ${recruiterToken}`);

      if (appsRes.body.data && appsRes.body.data.length > 0) {
        interviewApplicationId = appsRes.body.data[0]._id;
      }
    });

    it('should schedule a new interview and link to application', async () => {
      const scheduleTime = new Date(Date.now() + 86400000 * 2).toISOString(); // 2 days from now
      const res = await request(app)
        .post('/api/v1/interviews')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          applicationId: interviewApplicationId,
          type: 'ONLINE',
          scheduledAt: scheduleTime,
          duration: 45,
          meetingLink: 'https://meet.google.com/hfw-live-interview',
          notes: 'Focus on distributed algorithms and Kubernetes orchestration.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.type).toBe('ONLINE');
      expect(res.body.data.status).toBe('SCHEDULED');
      expect(res.body.data.meetingLink).toBe('https://meet.google.com/hfw-live-interview');
      testInterviewId = res.body.data._id;
    });

    it('should allow candidate to list their scheduled interviews', async () => {
      const res = await request(app)
        .get('/api/v1/interviews')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const found = res.body.data.find((i) => i._id === testInterviewId);
      expect(found).toBeDefined();
      expect(found.applicationId).toBeDefined();
    });

    it('should allow recruiter to reschedule an interview and update status to RESCHEDULED', async () => {
      const newScheduleTime = new Date(Date.now() + 86400000 * 3).toISOString(); // 3 days from now
      const res = await request(app)
        .patch(`/api/v1/interviews/${testInterviewId}`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          scheduledAt: newScheduleTime,
          notes: 'Rescheduled upon candidate availability request.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('RESCHEDULED');
    });

    it('should allow recruiter to submit an evaluation rubric and complete interview', async () => {
      const res = await request(app)
        .post(`/api/v1/interviews/${testInterviewId}/feedback`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          rating: 5,
          technicalSkillScore: 5,
          communicationScore: 4,
          cultureFitScore: 5,
          strengths: 'Exceptional knowledge of distributed storage and consensus protocols.',
          weaknesses: 'Minimal experience with Rust but willing to learn.',
          recommendation: 'STRONG_HIRE',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('COMPLETED');
      expect(res.body.data.feedback.recommendation).toBe('STRONG_HIRE');
      expect(res.body.data.feedback.rating).toBe(5);
    });

    it('should forbid candidate from submitting interview evaluation feedback (403 Forbidden)', async () => {
      const res = await request(app)
        .post(`/api/v1/interviews/${testInterviewId}/feedback`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ rating: 5, recommendation: 'STRONG_HIRE' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('8. Phase 9: Notifications & Email Dispatching', () => {
    let sampleNotificationId = '';

    it('should retrieve logged-in candidate notifications and unread counter', async () => {
      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.notifications)).toBe(true);
      expect(typeof res.body.data.unreadCount).toBe('number');

      if (res.body.data.notifications.length > 0) {
        sampleNotificationId = res.body.data.notifications[0]._id;
      }
    });

    it('should mark an individual notification as read', async () => {
      if (!sampleNotificationId) return;

      const res = await request(app)
        .patch(`/api/v1/notifications/${sampleNotificationId}/read`)
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should mark all candidate notifications as read', async () => {
      const res = await request(app)
        .patch('/api/v1/notifications/read-all')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify unread count is now 0
      const listRes = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(listRes.body.data.unreadCount).toBe(0);
    });
  });

  describe('9. Phase 10: AI Intelligence & Heuristic Matching Engine', () => {
    it('should analyze resume text and extract skills, strengths, and suggestions', async () => {
      const sampleResume = `
        Jordan Hayes - Senior Software Engineer
        Skills: React, Node.js, Express, MongoDB, Docker, Kubernetes, AWS, TypeScript
        Experience: 6 years building distributed systems and high-throughput microservices.
        Education: B.S. in Computer Science.
      `;

      const res = await request(app)
        .post('/api/v1/ai/resume/analyze')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ text: sampleResume });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.detectedSkills)).toBe(true);
      expect(res.body.data.detectedSkills.length).toBeGreaterThan(0);
      expect(Array.isArray(res.body.data.strengths)).toBe(true);
      expect(Array.isArray(res.body.data.improvementSuggestions)).toBe(true);
    });

    it('should reject AI resume analyze when no text or resumeId provided (400 Bad Request)', async () => {
      const res = await request(app)
        .post('/api/v1/ai/resume/analyze')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should analyze job description and extract requirements, keywords, and experience level', async () => {
      const res = await request(app)
        .post('/api/v1/ai/job/analyze')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          title: 'Senior Cloud DevOps Engineer',
          description: 'Looking for a senior engineer with deep Docker, Kubernetes, AWS, and CI/CD expertise.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.requiredSkills).toBeDefined();
      expect(res.body.data.experienceLevel).toBe('Senior');
      expect(Array.isArray(res.body.data.keywords)).toBe(true);
    });

    it('should compute match score between candidate profile and a published job', async () => {
      const res = await request(app)
        .post(`/api/v1/ai/job/${createdJobId}/match`)
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.data.matchScore).toBe('number');
      expect(res.body.data.matchScore).toBeGreaterThanOrEqual(0);
      expect(res.body.data.matchScore).toBeLessThanOrEqual(100);
      expect(Array.isArray(res.body.data.matchedSkills)).toBe(true);
      expect(Array.isArray(res.body.data.missingSkills)).toBe(true);
      expect(res.body.data.explanation).toBeDefined();
    });

    it('should generate tailored interview questions for a role', async () => {
      const res = await request(app)
        .post('/api/v1/ai/interview/questions')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          jobTitle: 'Principal Distributed Systems Architect',
          skills: ['Node.js', 'Kubernetes', 'MongoDB'],
          experienceLevel: 'Lead',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].question).toBeDefined();
      expect(res.body.data[0].category).toBeDefined();
    });
  });
});
