import { Router } from 'express';
import { Request, Response } from 'express';
import { searchService } from '../service/search.service';
import { SavedSearchModel } from '../model/savedSearch.model';
import { authenticate } from '../../../middleware/auth.middleware';
import { rateLimiter } from '../../../middleware/rateLimiter.middleware';
import { sendSuccess, sendCreated, buildPagination } from '../../../utils/response';
import { UserModel } from '../../users/model/user.model';

const router = Router();
router.use(authenticate);

router.get('/', rateLimiter.search, async (req: Request, res: Response) => {
  const { page = '1', limit = '20', ...filters } = req.query;
  const user = await UserModel.findById(req.user!.userId).lean();
  const results = await searchService.searchProfiles(
    req.user!.userId,
    user?.gender ?? 'male',
    filters as any,
    parseInt(page as string),
    parseInt(limit as string)
  );
  sendSuccess(res, results.results, 'Search results', 200, results.pagination);
});

// Saved searches
router.get('/saved', async (req: Request, res: Response) => {
  const saved = await SavedSearchModel.find({ userId: req.user!.userId }).lean();
  sendSuccess(res, saved, 'Saved searches');
});

router.post('/saved', async (req: Request, res: Response) => {
  const saved = await SavedSearchModel.create({ userId: req.user!.userId, ...req.body });
  sendCreated(res, saved, 'Search saved');
});

router.delete('/saved/:id', async (req: Request, res: Response) => {
  await SavedSearchModel.deleteOne({ _id: req.params.id, userId: req.user!.userId });
  res.status(204).send();
});

router.patch('/saved/:id/alert', async (req: Request, res: Response) => {
  const saved = await SavedSearchModel.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.userId },
    { $set: { alertEnabled: req.body.alertEnabled } },
    { new: true }
  );
  sendSuccess(res, saved, 'Alert updated');
});

export { router as searchRoutes };
