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

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hireflow_ats';

const cleanDatabase = async () => {
  try {
    console.log('Connecting to target database...');
    console.log('URI:', MONGODB_URI.replace(/:([^:@]+)@/, ':****@')); // Hide password in logs

    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully. Removing all dummy and test records...');

    const results = await Promise.all([
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

    console.log('----------------------------------------------------');
    console.log('Database wipe completed successfully:');
    console.log(`- Users deleted:         ${results[0].deletedCount}`);
    console.log(`- Candidates deleted:    ${results[1].deletedCount}`);
    console.log(`- Recruiters deleted:    ${results[2].deletedCount}`);
    console.log(`- Companies deleted:     ${results[3].deletedCount}`);
    console.log(`- Jobs deleted:          ${results[4].deletedCount}`);
    console.log(`- Applications deleted:  ${results[5].deletedCount}`);
    console.log(`- Resumes deleted:       ${results[6].deletedCount}`);
    console.log(`- Interviews deleted:    ${results[7].deletedCount}`);
    console.log(`- Notifications deleted: ${results[8].deletedCount}`);
    console.log(`- Saved Jobs deleted:    ${results[9].deletedCount}`);
    console.log(`- Audit Logs deleted:    ${results[10].deletedCount}`);
    console.log('----------------------------------------------------');
    console.log('Target database is now completely clean and ready for real data.');

    process.exit(0);
  } catch (error) {
    console.error('Error during database cleanup:', error);
    process.exit(1);
  }
};

cleanDatabase();
