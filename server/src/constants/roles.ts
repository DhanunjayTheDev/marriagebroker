export enum UserRole {
  CANDIDATE = 'candidate',
  PARENT = 'parent',
  GUARDIAN = 'guardian',
  RELATIONSHIP_MANAGER = 'relationship_manager',
  VERIFIER = 'verifier',
  MODERATOR = 'moderator',
  SUPPORT = 'support',
  ANALYST = 'analyst',
  CONTENT_MANAGER = 'content_manager',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  SYSTEM = 'system',
}

export enum SubscriptionPlan {
  FREE = 'free',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  ELITE = 'elite',
  VIP_ASSISTED = 'vip_assisted',
}

export const STAFF_ROLES: UserRole[] = [
  UserRole.RELATIONSHIP_MANAGER,
  UserRole.VERIFIER,
  UserRole.MODERATOR,
  UserRole.SUPPORT,
  UserRole.ANALYST,
  UserRole.CONTENT_MANAGER,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
];

export const ADMIN_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
];

export const MEMBER_ROLES: UserRole[] = [
  UserRole.CANDIDATE,
  UserRole.PARENT,
  UserRole.GUARDIAN,
];

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.CANDIDATE]: 1,
  [UserRole.PARENT]: 1,
  [UserRole.GUARDIAN]: 1,
  [UserRole.SUPPORT]: 2,
  [UserRole.VERIFIER]: 2,
  [UserRole.MODERATOR]: 3,
  [UserRole.CONTENT_MANAGER]: 3,
  [UserRole.ANALYST]: 3,
  [UserRole.RELATIONSHIP_MANAGER]: 4,
  [UserRole.ADMIN]: 9,
  [UserRole.SUPER_ADMIN]: 10,
  [UserRole.SYSTEM]: 99,
};
