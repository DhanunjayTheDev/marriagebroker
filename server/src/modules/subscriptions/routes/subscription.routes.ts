import { Router } from 'express';
import { subscriptionController } from '../controller/subscription.controller';
import { authenticate } from '../../../middleware/auth.middleware';
import { rateLimiter } from '../../../middleware/rateLimiter.middleware';

const router = Router();

router.get('/plans', subscriptionController.getPlans.bind(subscriptionController));
router.use(authenticate);
router.post('/order', rateLimiter.payment, subscriptionController.createOrder.bind(subscriptionController));
router.post('/verify', rateLimiter.payment, subscriptionController.verifyPayment.bind(subscriptionController));
router.get('/me', subscriptionController.getMySubscription.bind(subscriptionController));
router.get('/me/history', subscriptionController.getSubscriptionHistory.bind(subscriptionController));

export { router as subscriptionRoutes };
