import { Router } from 'express';
import { chatController, chatMediaUpload } from '../controller/chat.controller';
import { authenticate } from '../../../middleware/auth.middleware';
import { rateLimiter } from '../../../middleware/rateLimiter.middleware';

const router = Router();
router.use(authenticate);

router.get('/conversations', chatController.getConversations.bind(chatController));
router.post('/conversations', chatController.getOrCreateConversation.bind(chatController));
router.get('/conversations/:conversationId/messages', rateLimiter.chat, chatController.getMessages.bind(chatController));
router.post('/conversations/:conversationId/messages', rateLimiter.chat, chatMediaUpload, chatController.sendMessage.bind(chatController));
router.delete('/messages/:messageId', chatController.deleteMessage.bind(chatController));
router.patch('/messages/:messageId/pin', chatController.pinMessage.bind(chatController));
router.patch('/messages/:messageId/star', chatController.starMessage.bind(chatController));

export { router as chatRoutes };
