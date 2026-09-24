import { Router } from 'express';
import { jobController } from './job.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { ROLES } from '../../utils/constants.js';

const router = Router();

// Public routes
router.get('/', jobController.searchJobs);
router.get('/:id', (req, res, next) => {
  // Optional auth to attach isSaved / hasApplied flags
  const authHeader = req.headers.authorization;
  const cookie = req.cookies?.accessToken;
  if (authHeader || cookie) {
    return authenticate(req, res, () => jobController.getJobById(req, res, next));
  }
  jobController.getJobById(req, res, next);
});

// Protected routes
router.use(authenticate);

// Recruiter specific
router.post('/', authorize(ROLES.RECRUITER, ROLES.ADMIN), jobController.createJob);
router.get('/recruiter/my-jobs', authorize(ROLES.RECRUITER, ROLES.ADMIN), jobController.getRecruiterJobs);
router.patch('/:id', authorize(ROLES.RECRUITER, ROLES.ADMIN), jobController.updateJob);
router.post('/:id/publish', authorize(ROLES.RECRUITER, ROLES.ADMIN), jobController.publishJob);
router.post('/:id/close', authorize(ROLES.RECRUITER, ROLES.ADMIN), jobController.closeJob);

// Candidate actions on jobs
router.post('/:id/save', authorize(ROLES.CANDIDATE), jobController.saveJob);
router.delete('/:id/save', authorize(ROLES.CANDIDATE), jobController.unsaveJob);
router.post('/:id/apply', authorize(ROLES.CANDIDATE), jobController.applyForJob);

export default router;
