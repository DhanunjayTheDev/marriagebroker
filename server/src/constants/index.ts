export * from './roles';
export * from './permissions';
export * from './errorCodes';

export const GENDER = ['male', 'female', 'other'] as const;
export type Gender = typeof GENDER[number];

export const MARITAL_STATUS = [
  'never_married',
  'divorced',
  'widowed',
  'awaiting_divorce',
  'annulled',
] as const;
export type MaritalStatus = typeof MARITAL_STATUS[number];

export const RELIGION = [
  'hindu',
  'muslim',
  'christian',
  'sikh',
  'jain',
  'buddhist',
  'parsi',
  'jewish',
  'other',
  'no_religion',
] as const;
export type Religion = typeof RELIGION[number];

export const COMPLEXION = [
  'very_fair',
  'fair',
  'wheatish',
  'wheatish_brown',
  'dark',
] as const;

export const BODY_TYPE = ['slim', 'athletic', 'average', 'heavy'] as const;

export const FOOD_HABIT = ['vegetarian', 'non_vegetarian', 'eggetarian', 'vegan', 'jain', 'occasionally_non_veg'] as const;

export const EMPLOYMENT_TYPE = [
  'employed_private',
  'employed_government',
  'self_employed',
  'business',
  'not_working',
  'student',
  'retired',
] as const;

export const FAMILY_TYPE = ['nuclear', 'joint', 'extended'] as const;
export const FAMILY_STATUS = ['middle_class', 'upper_middle_class', 'rich', 'affluent'] as const;
export const FAMILY_VALUES = ['traditional', 'moderate', 'liberal'] as const;

export const INTEREST_STATUS = [
  'suggested',
  'viewed',
  'sent',
  'received',
  'accepted',
  'declined',
  'chat_started',
  'voice_called',
  'video_called',
  'meeting_scheduled',
  'family_discussion',
  'engaged',
  'married',
  'expired',
  'withdrawn',
] as const;
export type InterestStatus = typeof INTEREST_STATUS[number];

export const CALL_STATUS = ['initiated', 'ringing', 'connected', 'ended', 'missed', 'declined', 'failed'] as const;
export type CallStatus = typeof CALL_STATUS[number];

export const CALL_TYPE = ['voice', 'video'] as const;
export type CallType = typeof CALL_TYPE[number];

export const MEETING_TYPE = ['video', 'family', 'physical'] as const;
export type MeetingType = typeof MEETING_TYPE[number];

export const TICKET_STATUS = ['open', 'in_progress', 'resolved', 'closed', 'reopened'] as const;
export type TicketStatus = typeof TICKET_STATUS[number];

export const TICKET_PRIORITY = ['low', 'medium', 'high', 'critical'] as const;
export type TicketPriority = typeof TICKET_PRIORITY[number];

export const NOTIFICATION_TYPE = [
  'interest_received',
  'interest_accepted',
  'interest_declined',
  'message_received',
  'call_incoming',
  'call_missed',
  'meeting_reminder',
  'profile_viewed',
  'subscription_expiry',
  'subscription_renewed',
  'payment_success',
  'payment_failed',
  'verification_approved',
  'verification_rejected',
  'match_recommendation',
  'profile_completion',
  'daily_matches',
  'support_reply',
  'announcement',
  'system',
] as const;
export type NotificationType = typeof NOTIFICATION_TYPE[number];

export const NOTIFICATION_CHANNEL = ['push', 'email', 'sms', 'whatsapp', 'in_app'] as const;
export type NotificationChannel = typeof NOTIFICATION_CHANNEL[number];

export const VERIFICATION_TYPE = [
  'mobile',
  'email',
  'aadhaar',
  'pan',
  'passport',
  'face',
  'liveness',
  'employment',
  'income',
  'property',
  'background_identity',
  'background_employment',
  'background_education',
  'background_address',
] as const;
export type VerificationType = typeof VERIFICATION_TYPE[number];

export const VERIFICATION_STATUS = ['pending', 'under_review', 'approved', 'rejected', 'expired'] as const;
export type VerificationStatus = typeof VERIFICATION_STATUS[number];

export const AUDIT_ACTION = [
  'user.created',
  'user.updated',
  'user.deleted',
  'user.suspended',
  'user.restored',
  'profile.updated',
  'profile.photo.added',
  'profile.photo.deleted',
  'auth.login',
  'auth.logout',
  'auth.otp.sent',
  'auth.otp.verified',
  'auth.password.changed',
  'auth.2fa.enabled',
  'auth.2fa.disabled',
  'subscription.purchased',
  'subscription.renewed',
  'subscription.cancelled',
  'payment.created',
  'payment.success',
  'payment.failed',
  'payment.refunded',
  'verification.submitted',
  'verification.approved',
  'verification.rejected',
  'interest.sent',
  'interest.accepted',
  'interest.declined',
  'admin.action',
  'admin.user.suspend',
  'admin.user.delete',
  'admin.settings.update',
] as const;
export type AuditAction = typeof AUDIT_ACTION[number];

export const PLATFORMS = ['web', 'android', 'ios', 'admin_panel'] as const;
export type Platform = typeof PLATFORMS[number];

export const CACHE_TTL = {
  SHORT: 60,           // 1 minute
  MEDIUM: 300,         // 5 minutes
  LONG: 3600,          // 1 hour
  VERY_LONG: 86400,    // 24 hours
  WEEK: 604800,        // 7 days
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
