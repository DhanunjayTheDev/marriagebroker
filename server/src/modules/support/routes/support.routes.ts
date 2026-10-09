import { Router, Request, Response } from 'express';
import { TicketModel } from '../model/ticket.model';
import { authenticate } from '../../../middleware/auth.middleware';
import { requirePermission } from '../../../middleware/rbac.middleware';
import { Permission } from '../../../constants';
import { sendSuccess, sendCreated, buildPagination } from '../../../utils/response';
import { AppError } from '../../../utils/AppError';
import { ErrorCode } from '../../../constants';
import { Types } from 'mongoose';
import { enqueueNotification } from '../../../queues/notification.queue';

let ticketCounter = 0;
const generateTicketNumber = () => `TKT${Date.now()}${(++ticketCounter).toString().padStart(4, '0')}`;

const router = Router();
router.use(authenticate);

router.post('/', async (req: Request, res: Response) => {
  const { category, subject, message } = req.body;
  const ticket = await TicketModel.create({
    ticketNumber: generateTicketNumber(),
    userId: req.user!.userId,
    category,
    subject,
    status: 'open',
    messages: [{
      senderId: req.user!.userId,
      senderType: 'user',
      content: message,
    }],
  });
  sendCreated(res, ticket, 'Support ticket created');
});

router.get('/', async (req: Request, res: Response) => {
  const { page = '1', limit = '20', status } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const query: Record<string, unknown> = { userId: req.user!.userId };
  if (status) query.status = status;

  const [tickets, total] = await Promise.all([
    TicketModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit as string)).lean(),
    TicketModel.countDocuments(query),
  ]);
  sendSuccess(res, tickets, 'Tickets', 200, buildPagination(parseInt(page as string), parseInt(limit as string), total));
});

router.post('/:id/message', async (req: Request, res: Response) => {
  const ticket = await TicketModel.findById(req.params.id);
  if (!ticket) throw AppError.notFound(ErrorCode.TICKET_NOT_FOUND, 'Ticket not found');

  const isOwner = String(ticket.userId) === req.user!.userId;
  if (!isOwner) throw AppError.forbidden(ErrorCode.FORBIDDEN, 'Not authorized');

  ticket.messages.push({
    senderId: new Types.ObjectId(req.user!.userId),
    senderType: 'user',
    content: req.body.message,
    attachments: [],
    createdAt: new Date(),
  } as any);
  ticket.status = 'reopened';
  await ticket.save();

  sendSuccess(res, ticket, 'Message added');
});

// Staff routes
router.patch('/:id/assign', requirePermission(Permission.CRM_MANAGE), async (req: Request, res: Response) => {
  await TicketModel.updateOne({ _id: req.params.id }, { $set: { assignedTo: req.body.assigneeId, status: 'in_progress' } });
  sendSuccess(res, null, 'Ticket assigned');
});

router.patch('/:id/resolve', requirePermission(Permission.CRM_MANAGE), async (req: Request, res: Response) => {
  const ticket = await TicketModel.findByIdAndUpdate(
    req.params.id,
    { $set: { status: 'resolved', resolvedAt: new Date() } },
    { new: true }
  );
  if (ticket) {
    await enqueueNotification({
      userId: String(ticket.userId),
      type: 'support_reply' as any,
      title: 'Ticket Resolved',
      body: `Your ticket #${ticket.ticketNumber} has been resolved.`,
      channels: ['push', 'email'],
      priority: 'normal',
    });
  }
  sendSuccess(res, ticket, 'Ticket resolved');
});

export { router as supportRoutes };
