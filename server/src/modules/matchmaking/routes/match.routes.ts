import { Router, Request, Response } from 'express';
import { MatchModel } from '../model/match.model';
import { matchmakingService } from '../service/matchmaking.service';
import { authenticate } from '../../../middleware/auth.middleware';
import { sendSuccess, buildPagination } from '../../../utils/response';
import { matchCache } from '../../../services/cache.service';
import { enqueueMatchGeneration } from '../../../queues/matchmaking.queue';

const router = Router();
router.use(authenticate);

router.get('/', async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { page = '1', limit = '20' } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const cacheKey = `matches:${userId}:page:${page}`;
  const cached = await matchCache.get(cacheKey);
  if (cached) {
    sendSuccess(res, (cached as any).data, 'Matches retrieved', 200, (cached as any).pagination);
    return;
  }

  const [matches, total] = await Promise.all([
    MatchModel.find({ userId, isExpired: false })
      .sort({ score: -1 })
      .skip(skip)
      .limit(parseInt(limit as string))
      .populate('matchedUserId', 'firstName lastName gender dateOfBirth profile subscription')
      .lean(),
    MatchModel.countDocuments({ userId, isExpired: false }),
  ]);

  const pagination = buildPagination(parseInt(page as string), parseInt(limit as string), total);
  await matchCache.set(cacheKey, { data: matches, pagination }, 300);
  sendSuccess(res, matches, 'Matches retrieved', 200, pagination);
});

router.post('/refresh', async (req: Request, res: Response) => {
  await enqueueMatchGeneration(req.user!.userId, 1);
  sendSuccess(res, null, 'Match refresh queued');
});

router.patch('/:matchId/view', async (req: Request, res: Response) => {
  await MatchModel.updateOne(
    { _id: req.params.matchId, userId: req.user!.userId },
    { $set: { isViewed: true, viewedAt: new Date() } }
  );
  sendSuccess(res, null, 'Marked as viewed');
});

export { router as matchRoutes };
