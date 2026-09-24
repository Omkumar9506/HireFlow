import { Router } from 'express';
import { companyController } from './company.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { ROLES } from '../../utils/constants.js';

const router = Router();

// Public routes
router.get('/', companyController.getAllCompanies);
router.get('/:id', companyController.getCompanyById);

// Protected routes
router.use(authenticate);

router.post('/', authorize(ROLES.RECRUITER, ROLES.ADMIN), companyController.createCompany);
router.get('/user/me', authorize(ROLES.RECRUITER), companyController.getMyCompany);
router.patch('/:id', authorize(ROLES.RECRUITER, ROLES.ADMIN), companyController.updateCompany);
router.patch('/:id/verify', authorize(ROLES.ADMIN), companyController.verifyCompany);

export default router;
