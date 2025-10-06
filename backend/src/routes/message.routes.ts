import { Router } from 'express';
import {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
  getUnreadCount,
  checkChatAllowed,
} from '../controllers/message.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, sendMessage);
router.get('/conversations', authenticate, getConversations);
router.get('/unread-count', authenticate, getUnreadCount);
router.get('/check-chat/:shiftId', authenticate, checkChatAllowed);
router.get('/:userId', authenticate, getMessages);
router.put('/:id/read', authenticate, markAsRead);

export default router;
