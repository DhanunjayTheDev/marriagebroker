export interface AdminUser {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  profile: { photoUrl?: string };
  auth: { twoFactorEnabled: boolean };
  lastActiveAt?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: { code: string; details?: unknown };
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PlatformUser {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  gender: string;
  dateOfBirth: string;
  role: string;
  status: 'active' | 'suspended' | 'pending_verification' | 'deactivated';
  isDeleted: boolean;
  subscription: { plan: string; status: string; expiresAt?: string };
  profile: { completionScore: number; photoUrl?: string; verificationBadge: boolean; trustScore: number; profileStrengthScore: number };
  lastActiveAt?: string;
  createdAt: string;
}

export interface Verification {
  _id: string;
  userId: { _id: string; firstName: string; lastName: string; phone: string } | string;
  type: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'expired';
  documentUrl?: string;
  documentBackUrl?: string;
  selfieUrl?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface Payment {
  _id: string;
  userId: string;
  orderId: string;
  provider: string;
  purpose: string;
  amount: number;
  currency: string;
  status: string;
  paidAt?: string;
  createdAt: string;
}

export interface Ticket {
  _id: string;
  ticketNumber: string;
  userId: string;
  assignedTo?: string;
  category: string;
  subject: string;
  status: string;
  priority: string;
  messages: Array<{ senderId: string; senderType: string; content: string; createdAt: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureFlag {
  _id: string;
  key: string;
  name: string;
  description: string;
  isEnabled: boolean;
  enabledForRoles: string[];
  enabledForPlans: string[];
  enabledForCountries: string[];
  rolloutPercentage: number;
  createdAt: string;
}

export interface SystemConfig {
  _id: string;
  key: string;
  value: unknown;
  type: string;
  category: string;
  description: string;
  isPublic: boolean;
}

export interface AuditLog {
  _id: string;
  userId?: string;
  performedBy?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  platform?: string;
  createdAt: string;
}

export interface CmsPage {
  _id: string;
  type: string;
  slug: string;
  title: string;
  content: string;
  isPublished: boolean;
  category?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  _id: string;
  type: string;
  title: string;
  content: string;
  target: string;
  isActive: boolean;
  priority: number;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
}

export interface DashboardStats {
  users: { total: number; active: number; todayRegistrations: number };
  revenue: { total: number; currency: string };
  tickets: { open: number };
  verifications: { pending: number };
}
