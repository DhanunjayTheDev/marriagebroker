import { Router } from 'express';
import { callController } from '../controller/call.controller';
import { authenticate } from '../../../middleware/auth.middleware';
import { rateLimiter } from '../../../middleware/rateLimiter.middleware';

const router = Router();
router.use(authenticate);

router.post('/initiate', rateLimiter.call, callController.initiateCall.bind(callController));
router.patch('/:callId/status', callController.updateCallStatus.bind(callController));
router.get('/history', callController.getCallHistory.bind(callController));
router.post('/:callId/rate', callController.rateCall.bind(callController));

export { router as callRoutes };
