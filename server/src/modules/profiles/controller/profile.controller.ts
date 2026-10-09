import { Request, Response } from 'express';
import { ProfileModel } from '../model/profile.model';
import { UserModel } from '../../users/model/user.model';
import { AstrologyModel } from '../../astrology/model/astrology.model';
import { sendSuccess, sendCreated, sendNoContent } from '../../../utils/response';
import { AppError } from '../../../utils/AppError';
import { ErrorCode } from '../../../constants';
import { profileCache } from '../../../services/cache.service';
import { uploadBuffer, validateFileType, generateThumbnail } from '../../../helpers/gcs.helper';
import { auditService } from '../../audit/model/audit.model';
import multer from 'multer';
import { Types } from 'mongoose';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

/**
 * Flattens a nested update payload into dot-notation leaf paths so Mongo's $set
 * only touches the specific fields present, instead of replacing whole sub-documents
 * (a bare `$set: { personal: {...} }` wipes any personal.* field not in that object).
 */
function flattenForSet(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      Object.assign(result, flattenForSet(value as Record<string, unknown>, path));
    } else {
      result[path] = value;
    }
  }
  return result;
}

export const profileUpload = upload.fields([
  { name: 'photos', maxCount: 10 },
  { name: 'horoscope', maxCount: 1 },
]);

export class ProfileController {
  async getProfile(req: Request, res: Response): Promise<void> {
    const targetId = req.params.userId ?? req.user!.userId;
    const isOwn = targetId === req.user!.userId;

    const cacheKey = isOwn ? `own:${targetId}` : `view:${req.user!.userId}:${targetId}`;
    const cached = await profileCache.get(cacheKey);
    if (cached) {
      sendSuccess(res, cached, 'Profile retrieved');
      return;
    }

    const [user, profile, astrology] = await Promise.all([
      UserModel.findOne({ _id: targetId, isDeleted: false }, '-passwordHash -auth.twoFactorSecret').lean(),
      ProfileModel.findOne({ userId: targetId }).lean(),
      AstrologyModel.findOne({ userId: targetId }).lean(),
    ]);

    if (!user) throw AppError.notFound(ErrorCode.USER_NOT_FOUND, 'Profile not found');

    // Increment view count (non-own views)
    if (!isOwn) {
      await ProfileModel.updateOne({ userId: targetId }, { $inc: { viewCount: 1 } });
    }

    const data = { user, profile, astrology };
    await profileCache.set(cacheKey, data, 300);
    sendSuccess(res, data, 'Profile retrieved');
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const updateData = flattenForSet(req.body);

    const profile = await ProfileModel.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    // Recalculate completion score
    const score = this.calculateCompletionScore(profile as any);
    await Promise.all([
      ProfileModel.updateOne({ userId }, { $set: { completionScore: score } }),
      UserModel.updateOne({ _id: userId }, { $set: { 'profile.completionScore': score } }),
    ]);

    await profileCache.delPattern(`*:${userId}*`);

    await auditService.log({
      userId: new Types.ObjectId(userId),
      action: 'profile.updated' as any,
      entityType: 'Profile',
      entityId: userId,
    });

    sendSuccess(res, { profile, completionScore: score }, 'Profile updated');
  }

  async uploadPhoto(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const files = (req as any).files?.photos as Express.Multer.File[];
    if (!files?.length) throw AppError.badRequest(ErrorCode.FILE_NOT_FOUND, 'No photos provided');

    const uploaded = [];
    for (const file of files) {
      validateFileType(file.mimetype, 'image');
      const [result, thumb] = await Promise.all([
        uploadBuffer(file.buffer, file.mimetype, 'photos', userId, false, { resize: { width: 1080, height: 1350 } }),
        generateThumbnail(file.buffer, userId),
      ]);
      uploaded.push({ url: result.url, thumbnailUrl: thumb.url });
    }

    // Add to profile photos
    for (const photo of uploaded) {
      await ProfileModel.updateOne(
        { userId },
        {
          $push: {
            photos: {
              url: photo.url,
              thumbnailUrl: photo.thumbnailUrl,
              isPrivate: false,
              isMain: false,
              order: 0,
              uploadedAt: new Date(),
            },
          },
        }
      );
    }

    // Set first photo as main if no main exists
    const profile = await ProfileModel.findOne({ userId });
    const hasMain = profile?.photos.some(p => p.isMain);
    if (!hasMain && profile?.photos.length) {
      await ProfileModel.updateOne(
        { userId, 'photos._id': profile.photos[0]._id },
        { $set: { 'photos.$.isMain': true } }
      );
      await UserModel.updateOne(
        { _id: userId },
        {
          $set: {
            'profile.photoUrl': profile.photos[0].url,
            'profile.thumbnailUrl': profile.photos[0].thumbnailUrl,
          },
        }
      );
    }

    await profileCache.delPattern(`*:${userId}*`);
    sendCreated(res, uploaded, 'Photos uploaded');
  }

  async deletePhoto(req: Request, res: Response): Promise<void> {
    const { photoId } = req.params;
    await ProfileModel.updateOne(
      { userId: req.user!.userId },
      { $pull: { photos: { _id: photoId } } }
    );
    await profileCache.delPattern(`*:${req.user!.userId}*`);
    sendNoContent(res);
  }

  async setMainPhoto(req: Request, res: Response): Promise<void> {
    const { photoId } = req.params;
    const userId = req.user!.userId;

    await ProfileModel.updateOne(
      { userId },
      { $set: { 'photos.$[].isMain': false } }
    );
    await ProfileModel.updateOne(
      { userId, 'photos._id': photoId },
      { $set: { 'photos.$.isMain': true } }
    );

    const profile = await ProfileModel.findOne({ userId, 'photos._id': photoId });
    const mainPhoto = profile?.photos.find(p => String(p._id) === photoId);
    if (mainPhoto) {
      await UserModel.updateOne(
        { _id: userId },
        { $set: { 'profile.photoUrl': mainPhoto.url, 'profile.thumbnailUrl': mainPhoto.thumbnailUrl } }
      );
    }

    await profileCache.delPattern(`*:${userId}*`);
    sendSuccess(res, null, 'Main photo updated');
  }

  async updatePartnerPreferences(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const updateData = flattenForSet({ partnerPreferences: req.body });
    await ProfileModel.updateOne(
      { userId },
      { $set: updateData },
      { upsert: true, runValidators: true }
    );
    await profileCache.delPattern(`*:${userId}*`);
    sendSuccess(res, null, 'Partner preferences updated');
  }

  async updatePrivacy(req: Request, res: Response): Promise<void> {
    const updateData = flattenForSet({ privacy: req.body });
    await UserModel.updateOne(
      { _id: req.user!.userId },
      { $set: updateData },
      { runValidators: true }
    );
    await profileCache.delPattern(`*:${req.user!.userId}*`);
    sendSuccess(res, null, 'Privacy settings updated');
  }

  async toggleIncognito(req: Request, res: Response): Promise<void> {
    const user = await UserModel.findById(req.user!.userId);
    const current = user?.profile.incognitoMode ?? false;
    await UserModel.updateOne(
      { _id: req.user!.userId },
      { $set: { 'profile.incognitoMode': !current } }
    );
    sendSuccess(res, { incognitoMode: !current }, `Incognito mode ${!current ? 'enabled' : 'disabled'}`);
  }

  private calculateCompletionScore(profile: any): number {
    const sections = [
      { weight: 15, check: () => !!profile?.personal?.aboutMe && profile.personal.aboutMe.length > 50 },
      { weight: 10, check: () => !!profile?.personal?.height && !!profile?.personal?.complexion },
      { weight: 10, check: () => !!profile?.religion?.religion && !!profile?.religion?.caste },
      { weight: 10, check: () => !!profile?.location?.state && !!profile?.location?.city },
      { weight: 10, check: () => !!profile?.education?.highestDegree },
      { weight: 10, check: () => !!profile?.employment?.employmentType },
      { weight: 10, check: () => !!profile?.family?.familyType },
      { weight: 10, check: () => !!profile?.lifestyle?.foodHabits },
      { weight: 10, check: () => profile?.photos?.length > 0 },
      { weight: 5, check: () => !!profile?.partnerPreferences?.ageMin },
    ];

    return sections.reduce((score, s) => score + (s.check() ? s.weight : 0), 0);
  }
}

export const profileController = new ProfileController();
