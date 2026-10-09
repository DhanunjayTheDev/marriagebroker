export enum Permission {
  // Profile
  PROFILE_VIEW = 'profile:view',
  PROFILE_EDIT = 'profile:edit',
  PROFILE_VIEW_CONTACT = 'profile:view_contact',
  PROFILE_VIEW_HOROSCOPE = 'profile:view_horoscope',
  PROFILE_VIEW_PHOTOS_PRIVATE = 'profile:view_photos_private',
  PROFILE_VIEW_HEALTH = 'profile:view_health',
  PROFILE_VIEW_SALARY = 'profile:view_salary',

  // Interests
  INTEREST_SEND = 'interest:send',
  INTEREST_RECEIVE = 'interest:receive',
  INTEREST_MANAGE = 'interest:manage',

  // Chat
  CHAT_ACCESS = 'chat:access',
  CHAT_SEND_MEDIA = 'chat:send_media',
  CHAT_UNLIMITED = 'chat:unlimited',

  // Calls
  CALL_VOICE = 'call:voice',
  CALL_VIDEO = 'call:video',
  CALL_UNLIMITED = 'call:unlimited',

  // Matchmaking
  MATCH_VIEW_BASIC = 'match:view_basic',
  MATCH_VIEW_ADVANCED = 'match:view_advanced',
  MATCH_AI = 'match:ai',

  // Search
  SEARCH_BASIC = 'search:basic',
  SEARCH_ADVANCED = 'search:advanced',
  SEARCH_SAVE = 'search:save',
  SEARCH_ALERTS = 'search:alerts',

  // Verification
  VERIFICATION_SUBMIT = 'verification:submit',
  VERIFICATION_VIEW_BADGE = 'verification:view_badge',
  VERIFICATION_BACKGROUND = 'verification:background',

  // Contact Access
  CONTACT_REQUEST = 'contact:request',
  CONTACT_VIEW = 'contact:view',
  CONTACT_UNLIMITED = 'contact:unlimited',

  // Photo Access
  PHOTO_REQUEST = 'photo:request',
  PHOTO_VIEW = 'photo:view',

  // Subscription
  SUBSCRIPTION_PURCHASE = 'subscription:purchase',
  SUBSCRIPTION_MANAGE = 'subscription:manage',

  // Wallet
  WALLET_VIEW = 'wallet:view',
  WALLET_USE = 'wallet:use',

  // Support
  SUPPORT_TICKET = 'support:ticket',
  SUPPORT_PRIORITY = 'support:priority',
  SUPPORT_DEDICATED_RM = 'support:dedicated_rm',

  // CRM (Staff only)
  CRM_VIEW = 'crm:view',
  CRM_MANAGE = 'crm:manage',
  CRM_SUGGEST_MATCH = 'crm:suggest_match',

  // Admin
  ADMIN_DASHBOARD = 'admin:dashboard',
  ADMIN_USER_MANAGE = 'admin:user_manage',
  ADMIN_VERIFY = 'admin:verify',
  ADMIN_MODERATE = 'admin:moderate',
  ADMIN_REVENUE = 'admin:revenue',
  ADMIN_ANALYTICS = 'admin:analytics',
  ADMIN_CMS = 'admin:cms',
  ADMIN_SYSTEM = 'admin:system',

  // Data
  DATA_EXPORT = 'data:export',
  DATA_EXPORT_ALL = 'data:export_all',

  // Feature flags
  FEATURE_AI_MATCHING = 'feature:ai_matching',
  FEATURE_VIDEO_CALL = 'feature:video_call',
  FEATURE_MARKETPLACE = 'feature:marketplace',
  FEATURE_BACKGROUND_VERIFY = 'feature:background_verify',
}

import { UserRole, SubscriptionPlan } from './roles';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.CANDIDATE]: [
    Permission.PROFILE_VIEW,
    Permission.PROFILE_EDIT,
    Permission.INTEREST_SEND,
    Permission.INTEREST_RECEIVE,
    Permission.MATCH_VIEW_BASIC,
    Permission.SEARCH_BASIC,
    Permission.VERIFICATION_SUBMIT,
    Permission.CONTACT_REQUEST,
    Permission.PHOTO_REQUEST,
    Permission.SUBSCRIPTION_PURCHASE,
    Permission.WALLET_VIEW,
    Permission.WALLET_USE,
    Permission.SUPPORT_TICKET,
    Permission.DATA_EXPORT,
  ],
  [UserRole.PARENT]: [
    Permission.PROFILE_VIEW,
    Permission.PROFILE_EDIT,
    Permission.INTEREST_SEND,
    Permission.INTEREST_RECEIVE,
    Permission.MATCH_VIEW_BASIC,
    Permission.SEARCH_BASIC,
    Permission.CONTACT_REQUEST,
    Permission.PHOTO_REQUEST,
    Permission.SUBSCRIPTION_PURCHASE,
    Permission.WALLET_VIEW,
    Permission.SUPPORT_TICKET,
    Permission.DATA_EXPORT,
  ],
  [UserRole.GUARDIAN]: [
    Permission.PROFILE_VIEW,
    Permission.PROFILE_EDIT,
    Permission.INTEREST_SEND,
    Permission.INTEREST_RECEIVE,
    Permission.MATCH_VIEW_BASIC,
    Permission.SEARCH_BASIC,
    Permission.CONTACT_REQUEST,
    Permission.SUBSCRIPTION_PURCHASE,
    Permission.SUPPORT_TICKET,
  ],
  [UserRole.SUPPORT]: [
    Permission.PROFILE_VIEW,
    Permission.CRM_VIEW,
    Permission.ADMIN_DASHBOARD,
  ],
  [UserRole.VERIFIER]: [
    Permission.PROFILE_VIEW,
    Permission.ADMIN_VERIFY,
    Permission.ADMIN_DASHBOARD,
  ],
  [UserRole.MODERATOR]: [
    Permission.PROFILE_VIEW,
    Permission.ADMIN_MODERATE,
    Permission.ADMIN_DASHBOARD,
  ],
  [UserRole.CONTENT_MANAGER]: [
    Permission.ADMIN_CMS,
    Permission.ADMIN_DASHBOARD,
  ],
  [UserRole.ANALYST]: [
    Permission.ADMIN_ANALYTICS,
    Permission.ADMIN_REVENUE,
    Permission.ADMIN_DASHBOARD,
    Permission.DATA_EXPORT_ALL,
  ],
  [UserRole.RELATIONSHIP_MANAGER]: [
    Permission.PROFILE_VIEW,
    Permission.CRM_VIEW,
    Permission.CRM_MANAGE,
    Permission.CRM_SUGGEST_MATCH,
    Permission.ADMIN_DASHBOARD,
  ],
  [UserRole.ADMIN]: [
    ...Object.values(Permission),
  ],
  [UserRole.SUPER_ADMIN]: [
    ...Object.values(Permission),
  ],
  [UserRole.SYSTEM]: [
    ...Object.values(Permission),
  ],
};

export const PLAN_PERMISSIONS: Record<SubscriptionPlan, Permission[]> = {
  [SubscriptionPlan.FREE]: [
    Permission.MATCH_VIEW_BASIC,
    Permission.SEARCH_BASIC,
    Permission.INTEREST_SEND,
    Permission.SUPPORT_TICKET,
  ],
  [SubscriptionPlan.SILVER]: [
    Permission.MATCH_VIEW_BASIC,
    Permission.SEARCH_BASIC,
    Permission.SEARCH_ADVANCED,
    Permission.INTEREST_SEND,
    Permission.CHAT_ACCESS,
    Permission.CALL_VOICE,
    Permission.CONTACT_REQUEST,
    Permission.PHOTO_REQUEST,
    Permission.SUPPORT_TICKET,
  ],
  [SubscriptionPlan.GOLD]: [
    Permission.MATCH_VIEW_BASIC,
    Permission.MATCH_VIEW_ADVANCED,
    Permission.SEARCH_BASIC,
    Permission.SEARCH_ADVANCED,
    Permission.SEARCH_SAVE,
    Permission.SEARCH_ALERTS,
    Permission.INTEREST_SEND,
    Permission.CHAT_ACCESS,
    Permission.CHAT_SEND_MEDIA,
    Permission.CALL_VOICE,
    Permission.CALL_VIDEO,
    Permission.CONTACT_REQUEST,
    Permission.CONTACT_VIEW,
    Permission.PHOTO_REQUEST,
    Permission.PHOTO_VIEW,
    Permission.VERIFICATION_VIEW_BADGE,
    Permission.SUPPORT_TICKET,
  ],
  [SubscriptionPlan.PLATINUM]: [
    Permission.MATCH_VIEW_BASIC,
    Permission.MATCH_VIEW_ADVANCED,
    Permission.MATCH_AI,
    Permission.SEARCH_BASIC,
    Permission.SEARCH_ADVANCED,
    Permission.SEARCH_SAVE,
    Permission.SEARCH_ALERTS,
    Permission.INTEREST_SEND,
    Permission.CHAT_ACCESS,
    Permission.CHAT_SEND_MEDIA,
    Permission.CHAT_UNLIMITED,
    Permission.CALL_VOICE,
    Permission.CALL_VIDEO,
    Permission.CALL_UNLIMITED,
    Permission.CONTACT_REQUEST,
    Permission.CONTACT_VIEW,
    Permission.CONTACT_UNLIMITED,
    Permission.PHOTO_REQUEST,
    Permission.PHOTO_VIEW,
    Permission.VERIFICATION_VIEW_BADGE,
    Permission.FEATURE_AI_MATCHING,
    Permission.FEATURE_VIDEO_CALL,
    Permission.SUPPORT_TICKET,
    Permission.SUPPORT_PRIORITY,
  ],
  [SubscriptionPlan.ELITE]: [
    ...Object.values(Permission).filter(p =>
      !p.startsWith('admin:') && !p.startsWith('crm:') && p !== Permission.DATA_EXPORT_ALL
    ),
    Permission.VERIFICATION_BACKGROUND,
    Permission.FEATURE_BACKGROUND_VERIFY,
    Permission.SUPPORT_DEDICATED_RM,
  ],
  [SubscriptionPlan.VIP_ASSISTED]: [
    ...Object.values(Permission).filter(p =>
      !p.startsWith('admin:')
    ),
  ],
};
