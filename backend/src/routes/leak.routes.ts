import { Router } from 'express';
import { LeakController } from '../controllers/leak.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../config/multer.config';

const router = Router();

// Public routes
router.get('/', LeakController.getLeaks);
router.get('/:id', LeakController.getLeakById);

// Protected routes (require auth)
router.use(authenticate);

router.post('/', upload.single('photo'), LeakController.reportLeak);
router.get('/my', LeakController.getMyLeaks);
router.get('/user/my', LeakController.getMyLeaks); // Handle /my instead of using root
router.post('/:id/upvote', LeakController.upvoteLeak);

export default router;
