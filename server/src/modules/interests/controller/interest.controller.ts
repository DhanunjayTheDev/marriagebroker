import { Request, Response } from 'express';
import { InterestModel } from '../model/interest.model';
import { UserModel } from '../../users/model/user.model';
import { sendSuccess, sendCreated, buildPagination } from '../../../utils/response';
import { AppError } from '../../../utils/AppError';
import { ErrorCode } from '../../../constants';
import { enqueueNotification } from '../../../queues/notification.queue';
import { eventBus, EVENTS } from '../../../events/eventBus';
import { Types } from 'mongoose';

export class InterestController {
  async sendInterest(req: Request, res: Response): Promise<void> {
    const senderId = req.user!.userId;
    const { receiverId, message } = req.body;

    if (senderId === receiverId) {
      throw AppError.badRequest(ErrorCode.INTEREST_SELF_NOT_ALLOWED, 'Cannot send interest to yourself');
    }

    const existing = await InterestModel.findOne({ senderId, receiverId });
    if (existing && !['declined', 'expired', 'withdrawn'].includes(existing.status)) {
      throw AppError.conflict(ErrorCode.INTEREST_ALREADY_SENT, 'Interest already sent');
    }

    const receiver = await UserModel.findById(receiverId);
    if (!receiver || receiver.isDeleted) {
      throw AppError.notFound(ErrorCode.USER_NOT_FOUND, 'User not found');
    }

    const sender = await UserModel.findById(senderId);

    const interest = await InterestModel.findOneAndUpdate(
      { senderId, receiverId },
      {
        $set: {
          status: 'sent',
          message,
          currentStage: 'sent',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        $push: {
          statusHistory: { status: 'sent', changedAt: new Date(), changedBy: senderId },
        },
      },
      { upsert: true, new: true }
    );

    await enqueueNotification({
      userId: receiverId,
      type: 'interest_received',
      title: 'New Interest Received!',
      body: `${sender?.firstName} ${sender?.lastName} has sent you an interest.`,
      channels: ['push', 'email', 'sms'],
      priority: 'high',
    });

    eventBus.publish({
      type: EVENTS.INTEREST_SENT,
      payload: { interestId: String(interest._id), senderId, receiverId },
      userId: senderId,
      timestamp: new Date(),
    });

    sendCreated(res, interest, 'Interest sent successfully');
  }

  async respondToInterest(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { interestId } = req.params;
    const { action } = req.body; // 'accept' | 'decline'

    const interest = await InterestModel.findById(interestId);
    if (!interest) throw AppError.notFound(ErrorCode.INTEREST_NOT_FOUND, 'Interest not found');
    if (String(interest.receiverId) !== userId) throw AppError.forbidden(ErrorCode.FORBIDDEN, 'Not authorized');

    const newStatus = action === 'accept' ? 'accepted' : 'declined';
    interest.status = newStatus as any;
    interest.currentStage = newStatus as any;
    interest.statusHistory.push({ status: newStatus as any, changedAt: new Date(), changedBy: new Types.ObjectId(userId) });
    await interest.save();

    // Notify sender
    await enqueueNotification({
      userId: String(interest.senderId),
      type: action === 'accept' ? 'interest_accepted' : 'interest_declined',
      title: action === 'accept' ? 'Interest Accepted!' : 'Interest Declined',
      body: action === 'accept'
        ? 'Your interest was accepted! Start a conversation now.'
        : 'Your interest was not accepted.',
      channels: ['push', 'email'],
      priority: 'high',
    });

    if (action === 'accept') {
      eventBus.publish({
        type: EVENTS.INTEREST_ACCEPTED,
        payload: { interestId, senderId: String(interest.senderId), receiverId: userId },
        userId,
        timestamp: new Date(),
      });
    }

    sendSuccess(res, interest, `Interest ${action}ed`);
  }

  async withdrawInterest(req: Request, res: Response): Promise<void> {
    const { interestId } = req.params;
    const interest = await InterestModel.findById(interestId);
    if (!interest) throw AppError.notFound(ErrorCode.INTEREST_NOT_FOUND, 'Interest not found');
    if (String(interest.senderId) !== req.user!.userId) {
      throw AppError.forbidden(ErrorCode.FORBIDDEN, 'Not authorized');
    }
    interest.status = 'withdrawn' as any;
    await interest.save();
    sendSuccess(res, null, 'Interest withdrawn');
  }

  async getMyInterests(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { type = 'sent', status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: Record<string, unknown> = {};
    if (type === 'sent') query.senderId = userId;
    else query.receiverId = userId;
    if (status) query.status = status;

    const [interests, total] = await Promise.all([
      InterestModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('senderId', 'firstName lastName profile')
        .populate('receiverId', 'firstName lastName profile')
        .lean(),
      InterestModel.countDocuments(query),
    ]);

    sendSuccess(res, interests, 'Interests retrieved', 200, buildPagination(Number(page), Number(limit), total));
  }

  async updateInterestStage(req: Request, res: Response): Promise<void> {
    const { interestId } = req.params;
    const { stage } = req.body;
    const userId = req.user!.userId;

    const interest = await InterestModel.findById(interestId);
    if (!interest) throw AppError.notFound(ErrorCode.INTEREST_NOT_FOUND, 'Interest not found');

    const isParticipant = [String(interest.senderId), String(interest.receiverId)].includes(userId);
    if (!isParticipant) throw AppError.forbidden(ErrorCode.FORBIDDEN, 'Not authorized');

    interest.currentStage = stage;
    interest.statusHistory.push({ status: stage, changedAt: new Date(), changedBy: new Types.ObjectId(userId) });
    await interest.save();

    sendSuccess(res, interest, 'Stage updated');
  }
}

export const interestController = new InterestController();
