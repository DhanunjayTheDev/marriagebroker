import { Router } from 'express';
import { profileController, profileUpload } from '../controller/profile.controller';
import { authenticate } from '../../../middleware/auth.middleware';
import { rateLimiter } from '../../../middleware/rateLimiter.middleware';

const router = Router();

router.use(authenticate);

router.get('/me', profileController.getProfile.bind(profileController));
router.get('/:userId', profileController.getProfile.bind(profileController));
router.put('/me', profileController.updateProfile.bind(profileController));
router.put('/me/partner-preferences', profileController.updatePartnerPreferences.bind(profileController));
router.put('/me/privacy', profileController.updatePrivacy.bind(profileController));
router.patch('/me/incognito', profileController.toggleIncognito.bind(profileController));

// Photos
router.post('/me/photos', rateLimiter.upload, profileUpload, profileController.uploadPhoto.bind(profileController));
router.delete('/me/photos/:photoId', profileController.deletePhoto.bind(profileController));
router.patch('/me/photos/:photoId/main', profileController.setMainPhoto.bind(profileController));

export { router as profileRoutes };
