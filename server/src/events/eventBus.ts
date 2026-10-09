import EventEmitter from 'events';
import { logger } from '../utils/logger';

export interface DomainEvent {
  type: string;
  payload: Record<string, unknown>;
  userId?: string;
  timestamp: Date;
}

class DomainEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }

  publish(event: DomainEvent): void {
    logger.debug('Event published', { type: event.type, userId: event.userId });
    this.emit(event.type, event);
    this.emit('*', event);
  }

  subscribe(eventType: string, handler: (event: DomainEvent) => void | Promise<void>): void {
    this.on(eventType, (event: DomainEvent) => {
      Promise.resolve(handler(event)).catch(err => {
        logger.error('Event handler error', { eventType, error: err.message });
      });
    });
  }
}

export const eventBus = new DomainEventBus();

export const EVENTS = {
  USER_REGISTERED: 'user.registered',
  USER_VERIFIED: 'user.verified',
  USER_SUSPENDED: 'user.suspended',
  USER_DELETED: 'user.deleted',
  PROFILE_UPDATED: 'profile.updated',
  PROFILE_PHOTO_ADDED: 'profile.photo.added',
  AUTH_LOGIN: 'auth.login',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_SUSPICIOUS_LOGIN: 'auth.suspicious_login',
  INTEREST_SENT: 'interest.sent',
  INTEREST_ACCEPTED: 'interest.accepted',
  INTEREST_DECLINED: 'interest.declined',
  CHAT_MESSAGE_SENT: 'chat.message.sent',
  CALL_STARTED: 'call.started',
  CALL_ENDED: 'call.ended',
  MEETING_SCHEDULED: 'meeting.scheduled',
  SUBSCRIPTION_PURCHASED: 'subscription.purchased',
  SUBSCRIPTION_EXPIRED: 'subscription.expired',
  PAYMENT_SUCCESS: 'payment.success',
  PAYMENT_FAILED: 'payment.failed',
  VERIFICATION_SUBMITTED: 'verification.submitted',
  VERIFICATION_APPROVED: 'verification.approved',
  VERIFICATION_REJECTED: 'verification.rejected',
  NOTIFICATION_SEND: 'notification.send',
  MATCH_GENERATED: 'match.generated',
  REPORT_SUBMITTED: 'report.submitted',
  TICKET_CREATED: 'ticket.created',
  TICKET_RESOLVED: 'ticket.resolved',
  WALLET_CREDITED: 'wallet.credited',
  WALLET_DEBITED: 'wallet.debited',
} as const;
