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

  describe('3. Job Requisition & Discovery', () => {
    it('should search published jobs with pagination', async () => {
      const res = await request(app).get('/api/v1/jobs?page=1&limit=5');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);
      expect(res.body.data.pagination.page).toBe(1);
      testJobId = res.body.data.items[0]._id;
    });

    it('should fetch single job details', async () => {
      const res = await request(app)
        .get(`/api/v1/jobs/${testJobId}`)
        .set('Authorization', `Bearer ${candidateToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBeDefined();
    });
  });

  describe('3. ATS Application State Machine & Business Rules', () => {
    it('should prevent duplicate application to the same job', async () => {
      // Find a job candidate already applied to in seed
      const jobsRes = await request(app).get('/api/v1/candidates/applications').set('Authorization', `Bearer ${candidateToken}`);
      if (jobsRes.body.data.length > 0) {
        const appliedJobId = jobsRes.body.data[0].jobId._id;
        const res = await request(app)
          .post(`/api/v1/jobs/${appliedJobId}/apply`)
          .set('Authorization', `Bearer ${candidateToken}`)
          .send({ coverLetter: 'Duplicate attempt' });
        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
      }
    });

    it('should validate legal status transitions in ATS pipeline', async () => {
      // Fetch an application in APPLIED status
      const appsRes = await request(app)
        .get(`/api/v1/applications/job/${testJobId}`)
        .set('Authorization', `Bearer ${recruiterToken}`);

      if (appsRes.body.data && appsRes.body.data.length > 0) {
        const appToTest = appsRes.body.data[0];
        testApplicationId = appToTest._id;

        // Try invalid transition: e.g. APPLIED -> HIRED directly (skipping interview, offer, etc.)
        if (appToTest.status === APPLICATION_STATUS.APPLIED) {
          const invalidRes = await request(app)
            .patch(`/api/v1/applications/${testApplicationId}/status`)
            .set('Authorization', `Bearer ${recruiterToken}`)
            .send({ status: APPLICATION_STATUS.HIRED });

          expect(invalidRes.status).toBe(400);
          expect(invalidRes.body.success).toBe(false);
          expect(invalidRes.body.message).toContain('Invalid ATS pipeline transition');

          // Valid transition: APPLIED -> SCREENING
          const validRes = await request(app)
            .patch(`/api/v1/applications/${testApplicationId}/status`)
            .set('Authorization', `Bearer ${recruiterToken}`)
            .send({ status: APPLICATION_STATUS.SCREENING, reason: 'Passed resume screening' });

          expect(validRes.status).toBe(200);
          expect(validRes.body.data.status).toBe(APPLICATION_STATUS.SCREENING);
        }
      }
    });
  });
});
