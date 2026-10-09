import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CallModel } from '../model/call.model';
import { generateAgoraToken, generateCallChannel, generateUidFromUserId } from '../../../integrations/agora/agora.integration';
import { sendSuccess, sendCreated, buildPagination } from '../../../utils/response';
import { AppError } from '../../../utils/AppError';
import { ErrorCode } from '../../../constants';
import { getSocketServer } from '../../../sockets';
import { eventBus, EVENTS } from '../../../events/eventBus';

export class CallController {
  async initiateCall(req: Request, res: Response): Promise<void> {
    const callerId = req.user!.userId;
    const { receiverId, type } = req.body;

    const callId = uuidv4();
    const channel = generateCallChannel(callId);
    const callerUid = generateUidFromUserId(callerId);
    const receiverUid = generateUidFromUserId(receiverId);

    const callerToken = generateAgoraToken(channel, callerUid, 'publisher');
    const receiverToken = generateAgoraToken(channel, receiverUid, 'publisher');

    const call = await CallModel.create({
      callId,
      callerId,
      receiverId,
      type,
      status: 'initiated',
      agoraChannel: channel,
      agoraToken: callerToken.token,
      callerUid,
      receiverUid,
      startedAt: new Date(),
    });

    // Notify receiver via socket
    try {
      const io = getSocketServer();
      io.of('/call').to(`user:${receiverId}`).emit('call_incoming', {
        callId,
        callerId,
        type,
        agoraToken: receiverToken.token,
        channel,
        uid: receiverUid,
      });
    } catch { /* socket optional */ }

    eventBus.publish({
      type: EVENTS.CALL_STARTED,
      payload: { callId, callerId, receiverId, type },
      userId: callerId,
      timestamp: new Date(),
    });

    sendCreated(res, {
      callId,
      channel,
      token: callerToken.token,
      uid: callerUid,
      expiresAt: callerToken.expiresAt,
    }, 'Call initiated');
  }

  async updateCallStatus(req: Request, res: Response): Promise<void> {
    const { callId } = req.params;
    const { status, durationSeconds } = req.body;
    const userId = req.user!.userId;

    const call = await CallModel.findOneAndUpdate(
      { callId, $or: [{ callerId: userId }, { receiverId: userId }] },
      {
        $set: {
          status,
          ...(status === 'connected' && { answeredAt: new Date() }),
          ...(status === 'ended' && {
            endedAt: new Date(),
            durationSeconds: durationSeconds ?? 0,
            endedBy: userId,
          }),
        },
      },
      { new: true }
    );

    if (!call) throw AppError.notFound(ErrorCode.CALL_NOT_FOUND, 'Call not found');

    if (status === 'ended') {
      eventBus.publish({
        type: EVENTS.CALL_ENDED,
        payload: { callId, durationSeconds: call.durationSeconds },
        userId,
        timestamp: new Date(),
      });
    }

    sendSuccess(res, call, 'Call status updated');
  }

  async getCallHistory(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { page = 1, limit = 20, type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: Record<string, unknown> = {
      $or: [{ callerId: userId }, { receiverId: userId }],
      isDeleted: false,
    };
    if (type) query.type = type;

    const [calls, total] = await Promise.all([
      CallModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('callerId', 'firstName lastName profile.photoUrl')
        .populate('receiverId', 'firstName lastName profile.photoUrl')
        .lean(),
      CallModel.countDocuments(query),
    ]);

    sendSuccess(res, calls, 'Call history retrieved', 200, buildPagination(Number(page), Number(limit), total));
  }

  async rateCall(req: Request, res: Response): Promise<void> {
    const { callId } = req.params;
    const { score, feedback } = req.body;

    await CallModel.updateOne(
      { callId, $or: [{ callerId: req.user!.userId }, { receiverId: req.user!.userId }] },
      { $set: { rating: { score, feedback } } }
    );

    sendSuccess(res, null, 'Call rated');
  }
}

export const callController = new CallController();
