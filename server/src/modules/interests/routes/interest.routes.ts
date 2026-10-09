import { Router } from 'express';
import { interestController } from '../controller/interest.controller';
import { authenticate } from '../../../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.post('/', interestController.sendInterest.bind(interestController));
router.get('/', interestController.getMyInterests.bind(interestController));
router.post('/:interestId/respond', interestController.respondToInterest.bind(interestController));
router.delete('/:interestId', interestController.withdrawInterest.bind(interestController));
router.patch('/:interestId/stage', interestController.updateInterestStage.bind(interestController));

export { router as interestRoutes };
