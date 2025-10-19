import { Router } from 'express';
import tokenController from '../controllers/tokenController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

// Protected routes - require authentication
router.post('/revoke-all', 
  authenticate,
  tokenController.revokeAllTokens
);

router.get('/sessions', 
  authenticate,
  tokenController.getActiveSessions
);

// Admin only route for cleanup
router.delete('/cleanup', 
  authenticate,
  tokenController.cleanupTokens
);

export default router;