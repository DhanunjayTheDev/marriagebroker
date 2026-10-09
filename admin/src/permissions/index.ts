// ─── RBAC: roles, permissions, matrix ───────────────────────────────────────

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  VERIFICATION_OFFICER = 'verifier',
  MODERATOR = 'moderator',
  SUPPORT_AGENT = 'support',
  RELATIONSHIP_MANAGER = 'relationship_manager',
  FINANCE_MANAGER = 'analyst',         // maps to backend analyst/finance
  MARKETING_MANAGER = 'content_manager',
}

export enum Permission {
  // Dashboard
  DASHBOARD_VIEW = 'dashboard:view',
  // Users
  USER_VIEW = 'user:view',
  USER_MANAGE = 'user:manage',
  USER_SUSPEND = 'user:suspend',
  USER_DELETE = 'user:delete',
  // Profiles
  PROFILE_VIEW = 'profile:view',
  PROFILE_EDIT = 'profile:edit',
  PROFILE_FLAG = 'profile:flag',
  // Verification
  VERIFICATION_VIEW = 'verification:view',
  VERIFICATION_PROCESS = 'verification:process',
  BACKGROUND_VERIFICATION = 'verification:background',
  // Moderation
  MODERATION_VIEW = 'moderation:view',
  MODERATION_ACTION = 'moderation:action',
  // Fraud
  FRAUD_VIEW = 'fraud:view',
  FRAUD_ACTION = 'fraud:action',
  // Matchmaking / AI / Search
  MATCHMAKING_MANAGE = 'matchmaking:manage',
  AI_MANAGE = 'ai:manage',
  SEARCH_MANAGE = 'search:manage',
  // Engagement
  INTEREST_VIEW = 'interest:view',
  CHAT_VIEW = 'chat:view',
  CHAT_MODERATE = 'chat:moderate',
  CALL_VIEW = 'call:view',
  MEETING_VIEW = 'meeting:view',
  // Family / access
  FAMILY_VIEW = 'family:view',
  CONTACT_ACCESS_VIEW = 'contact_access:view',
  PHOTO_ACCESS_VIEW = 'photo_access:view',
  // Finance
  SUBSCRIPTION_MANAGE = 'subscription:manage',
  PAYMENT_VIEW = 'payment:view',
  PAYMENT_REFUND = 'payment:refund',
  WALLET_MANAGE = 'wallet:manage',
  REFERRAL_VIEW = 'referral:view',
  REVENUE_VIEW = 'revenue:view',
  // CRM
  CRM_VIEW = 'crm:view',
  CRM_MANAGE = 'crm:manage',
  // Support
  SUPPORT_VIEW = 'support:view',
  SUPPORT_MANAGE = 'support:manage',
  // Content
  NOTIFICATION_MANAGE = 'notification:manage',
  ANNOUNCEMENT_MANAGE = 'announcement:manage',
  CMS_MANAGE = 'cms:manage',
  SEO_MANAGE = 'seo:manage',
  SUCCESS_STORY_MANAGE = 'success_story:manage',
  MARKETPLACE_MANAGE = 'marketplace:manage',
  // System
  FEATURE_FLAG_MANAGE = 'feature_flag:manage',
  SYSTEM_CONFIG_MANAGE = 'system_config:manage',
  AUDIT_VIEW = 'audit:view',
  ACTIVITY_VIEW = 'activity:view',
  INTERNAL_NOTES = 'internal_notes:manage',
  DATA_EXPORT = 'data_export:manage',
  ACCOUNT_DELETION_MANAGE = 'account_deletion:manage',
  // Analytics
  ANALYTICS_VIEW = 'analytics:view',
  RECOMMENDATION_ANALYTICS = 'recommendation_analytics:view',
  // Infra
  STORAGE_MANAGE = 'storage:manage',
  SECURITY_MANAGE = 'security:manage',
  MONITORING_VIEW = 'monitoring:view',
  CRON_MANAGE = 'cron:manage',
  API_DOCS_VIEW = 'api_docs:view',
  TRANSLATION_MANAGE = 'translation:manage',
}

const ALL = Object.values(Permission);

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  [AdminRole.SUPER_ADMIN]: [...ALL],
  [AdminRole.ADMIN]: ALL.filter((p) => p !== Permission.SECURITY_MANAGE && p !== Permission.SYSTEM_CONFIG_MANAGE),
  [AdminRole.VERIFICATION_OFFICER]: [
    Permission.DASHBOARD_VIEW, Permission.USER_VIEW, Permission.PROFILE_VIEW,
    Permission.VERIFICATION_VIEW, Permission.VERIFICATION_PROCESS, Permission.BACKGROUND_VERIFICATION,
    Permission.INTERNAL_NOTES, Permission.ACTIVITY_VIEW,
  ],
  [AdminRole.MODERATOR]: [
    Permission.DASHBOARD_VIEW, Permission.USER_VIEW, Permission.PROFILE_VIEW, Permission.PROFILE_FLAG,
    Permission.MODERATION_VIEW, Permission.MODERATION_ACTION, Permission.FRAUD_VIEW,
    Permission.CHAT_VIEW, Permission.CHAT_MODERATE, Permission.USER_SUSPEND, Permission.INTERNAL_NOTES,
  ],
  [AdminRole.SUPPORT_AGENT]: [
    Permission.DASHBOARD_VIEW, Permission.USER_VIEW, Permission.PROFILE_VIEW,
    Permission.SUPPORT_VIEW, Permission.SUPPORT_MANAGE, Permission.INTERNAL_NOTES,
    Permission.ACTIVITY_VIEW, Permission.ACCOUNT_DELETION_MANAGE,
  ],
  [AdminRole.RELATIONSHIP_MANAGER]: [
    Permission.DASHBOARD_VIEW, Permission.USER_VIEW, Permission.PROFILE_VIEW,
    Permission.CRM_VIEW, Permission.CRM_MANAGE, Permission.MEETING_VIEW, Permission.INTEREST_VIEW,
    Permission.INTERNAL_NOTES, Permission.ACTIVITY_VIEW,
  ],
  [AdminRole.FINANCE_MANAGER]: [
    Permission.DASHBOARD_VIEW, Permission.PAYMENT_VIEW, Permission.PAYMENT_REFUND,
    Permission.SUBSCRIPTION_MANAGE, Permission.WALLET_MANAGE, Permission.REFERRAL_VIEW,
    Permission.REVENUE_VIEW, Permission.ANALYTICS_VIEW, Permission.DATA_EXPORT,
  ],
  [AdminRole.MARKETING_MANAGER]: [
    Permission.DASHBOARD_VIEW, Permission.NOTIFICATION_MANAGE, Permission.ANNOUNCEMENT_MANAGE,
    Permission.CMS_MANAGE, Permission.SEO_MANAGE, Permission.SUCCESS_STORY_MANAGE,
    Permission.MARKETPLACE_MANAGE, Permission.ANALYTICS_VIEW, Permission.TRANSLATION_MANAGE,
  ],
};

export const ROLE_LABELS: Record<AdminRole, string> = {
  [AdminRole.SUPER_ADMIN]: 'Super Admin',
  [AdminRole.ADMIN]: 'Admin',
  [AdminRole.VERIFICATION_OFFICER]: 'Verification Officer',
  [AdminRole.MODERATOR]: 'Moderator',
  [AdminRole.SUPPORT_AGENT]: 'Support Agent',
  [AdminRole.RELATIONSHIP_MANAGER]: 'Relationship Manager',
  [AdminRole.FINANCE_MANAGER]: 'Finance Manager',
  [AdminRole.MARKETING_MANAGER]: 'Marketing Manager',
};

export const hasPermission = (role: string | undefined, permission: Permission): boolean => {
  if (!role) return false;
  const perms = ROLE_PERMISSIONS[role as AdminRole];
  return perms?.includes(permission) ?? false;
};

export const hasAnyPermission = (role: string | undefined, permissions: Permission[]): boolean =>
  permissions.some((p) => hasPermission(role, p));
