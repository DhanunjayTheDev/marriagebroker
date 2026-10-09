import { Router, Request, Response } from 'express';
import multer from 'multer';
import { VerificationModel } from '../model/verification.model';
import { UserModel } from '../../users/model/user.model';
import { authenticate } from '../../../middleware/auth.middleware';
import { requirePermission } from '../../../middleware/rbac.middleware';
import { Permission } from '../../../constants';
import { sendSuccess, sendCreated } from '../../../utils/response';
import { uploadBuffer, validateFileType } from '../../../helpers/gcs.helper';
import { AppError } from '../../../utils/AppError';
import { ErrorCode } from '../../../constants';
import { enqueueNotification } from '../../../queues/notification.queue';
import { verificationQueue } from '../../../queues';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
router.use(authenticate);

router.post(
  '/submit',
  requirePermission(Permission.VERIFICATION_SUBMIT),
  upload.fields([
    { name: 'document', maxCount: 1 },
    { name: 'documentBack', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { type } = req.body;
    const files = (req as any).files;

    const existing = await VerificationModel.findOne({ userId, type, status: { $in: ['pending', 'under_review'] } });
    if (existing) throw AppError.conflict(ErrorCode.VERIFICATION_ALREADY_SUBMITTED, 'Verification already submitted');

    let documentUrl, documentBackUrl, selfieUrl;

    if (files?.document?.[0]) {
      validateFileType(files.document[0].mimetype, 'document');
      const result = await uploadBuffer(files.document[0].buffer, files.document[0].mimetype, 'verification', userId, true);
      documentUrl = result.url;
    }
    if (files?.documentBack?.[0]) {
      const result = await uploadBuffer(files.documentBack[0].buffer, files.documentBack[0].mimetype, 'verification', userId, true);
      documentBackUrl = result.url;
    }
    if (files?.selfie?.[0]) {
      validateFileType(files.selfie[0].mimetype, 'image');
      const result = await uploadBuffer(files.selfie[0].buffer, files.selfie[0].mimetype, 'verification', userId, true);
      selfieUrl = result.url;
    }

    const verification = await VerificationModel.create({
      userId, type, documentUrl, documentBackUrl, selfieUrl,
      status: 'pending',
    });

    await verificationQueue.add('process', { verificationId: String(verification._id), type }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });

    sendCreated(res, verification, 'Verification submitted');
  }
);

router.get('/me', async (req: Request, res: Response) => {
  const verifications = await VerificationModel.find({ userId: req.user!.userId }).lean();
  sendSuccess(res, verifications, 'Verification status');
});

// Admin: approve/reject
router.patch('/:id/approve', requirePermission(Permission.ADMIN_VERIFY), async (req: Request, res: Response) => {
  const verification = await VerificationModel.findByIdAndUpdate(
    req.params.id,
    { $set: { status: 'approved', verifiedBy: req.user!.userId, verifiedAt: new Date(), notes: req.body.notes } },
    { new: true }
  );

  if (verification) {
    await UserModel.updateOne(
      { _id: verification.userId },
      { $set: { 'profile.verificationBadge': true } }
    );
    await enqueueNotification({
      userId: String(verification.userId),
      type: 'verification_approved' as any,
      title: 'Verification Approved!',
      body: `Your ${verification.type} verification has been approved.`,
      channels: ['push', 'email'],
      priority: 'high',
    });
  }

  sendSuccess(res, verification, 'Verification approved');
});

router.patch('/:id/reject', requirePermission(Permission.ADMIN_VERIFY), async (req: Request, res: Response) => {
  const verification = await VerificationModel.findByIdAndUpdate(
    req.params.id,
    { $set: { status: 'rejected', rejectedBy: req.user!.userId, rejectedAt: new Date(), rejectionReason: req.body.reason } },
    { new: true }
  );

  if (verification) {
    await enqueueNotification({
      userId: String(verification.userId),
      type: 'verification_rejected' as any,
      title: 'Verification Rejected',
      body: `Your ${verification.type} verification was rejected: ${req.body.reason}`,
      channels: ['push', 'email'],
      priority: 'normal',
    });
  }

  sendSuccess(res, verification, 'Verification rejected');
});

export { router as verificationRoutes };
