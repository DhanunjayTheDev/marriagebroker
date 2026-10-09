// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  id: string;
  phone: string;
  phoneVerified: boolean;
  email?: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  role: UserRole;
  status: 'active' | 'suspended' | 'pending_verification' | 'deactivated';
  isDeleted: boolean;
  profileId?: string;
  subscription: {
    plan: SubscriptionPlan;
    status: 'active' | 'expired' | 'cancelled' | 'trial';
    expiresAt?: string;
    startedAt?: string;
  };
  profile: {
    completionScore: number;
    photoUrl?: string;
    thumbnailUrl?: string;
    isPhotoVerified: boolean;
    verificationBadge: boolean;
    trustScore: number;
    profileStrengthScore: number;
    incognitoMode: boolean;
  };
  auth: {
    twoFactorEnabled: boolean;
    tokenVersion: number;
  };
  privacy: {
    hidePhone: boolean;
    hideSalary: boolean;
    hideHoroscope: boolean;
    hideHealthData: boolean;
    hidePropertyData: boolean;
    hideLastSeen: boolean;
  };
  referralCode?: string;
  wallet: { balance: number; currency: string };
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole =
  | 'candidate' | 'parent' | 'guardian'
  | 'relationship_manager' | 'verifier' | 'moderator'
  | 'support' | 'analyst' | 'content_manager'
  | 'admin' | 'super_admin' | 'system';

export type SubscriptionPlan = 'free' | 'silver' | 'gold' | 'platinum' | 'elite' | 'vip_assisted';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export interface Profile {
  _id: string;
  userId: string;
  personal: PersonalInfo;
  religion: ReligionInfo;
  location: LocationInfo;
  education: EducationInfo;
  employment: EmploymentInfo;
  business?: BusinessInfo;
  family: FamilyInfo;
  lifestyle: LifestyleInfo;
  health: HealthInfo;
  assets: AssetsInfo;
  personality: PersonalityInfo;
  partnerPreferences: PartnerPreferences;
  photos: ProfilePhoto[];
  completionScore: number;
  profileStrengthScore: number;
  viewCount: number;
  slug?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalInfo {
  height?: number;
  weight?: number;
  bloodGroup?: string;
  complexion?: string;
  bodyType?: string;
  maritalStatus?: string;
  children?: number;
  childrenLivingWith?: boolean;
  aboutMe?: string;
  motherTongue?: string;
  knownLanguages?: string[];
  preferredLanguage?: string;
}

export interface ReligionInfo {
  religion?: string;
  caste?: string;
  subCaste?: string;
  gotra?: string;
  denomination?: string;
}

export interface LocationInfo {
  country?: string;
  state?: string;
  city?: string;
  pincode?: string;
  isNRI?: boolean;
  nriCountry?: string;
  nriState?: string;
  nriCity?: string;
  willingToRelocate?: boolean;
  preferredLocations?: string[];
}

export interface EducationInfo {
  highestDegree?: string;
  fieldOfStudy?: string;
  college?: string;
  university?: string;
  graduationYear?: number;
  additionalDegrees?: Array<{ degree: string; field: string; institution: string; year?: number }>;
  certifications?: string[];
}

export interface EmploymentInfo {
  employmentType?: string;
  company?: string;
  designation?: string;
  industry?: string;
  experienceYears?: number;
  annualIncome?: number;
  annualIncomeCurrency?: string;
  workLocation?: string;
  isIncomePrivate?: boolean;
}

export interface BusinessInfo {
  businessName?: string;
  businessCategory?: string;
  annualTurnover?: number;
  employeeCount?: number;
  businessDescription?: string;
}

export interface FamilyInfo {
  familyType?: string;
  familyStatus?: string;
  familyValues?: string;
  familyIncome?: number;
  nativePlaceCity?: string;
  nativePlaceState?: string;
  nativePlaceCountry?: string;
  fatherOccupation?: string;
  fatherAlive?: boolean;
  motherOccupation?: string;
  motherAlive?: boolean;
  brothers?: number;
  brothersMarried?: number;
  sisters?: number;
  sistersMarried?: number;
}

export interface LifestyleInfo {
  foodHabits?: string;
  smokingHabit?: string;
  drinkingHabit?: string;
  religiousPractice?: string;
  fitnessActivities?: string[];
  hobbies?: string[];
  interests?: string[];
  travelPreference?: string;
}

export interface HealthInfo {
  hasDisabilities?: boolean;
  disabilities?: string[];
  hasDiabetes?: boolean;
  hasBP?: boolean;
  hasThyroid?: boolean;
  hasAsthma?: boolean;
  hasHeartCondition?: boolean;
  otherConditions?: string;
  isHealthPrivate?: boolean;
}

export interface AssetsInfo {
  house?: boolean;
  apartment?: boolean;
  villa?: boolean;
  agriculturalLand?: boolean;
  commercialProperty?: boolean;
  gold?: boolean;
  stocks?: boolean;
  mutualFunds?: boolean;
  otherInvestments?: boolean;
  vehicles?: string[];
  estimatedNetWorth?: number;
  isAssetsPrivate?: boolean;
}

export interface PersonalityInfo {
  introvertExtrovert?: string;
  isFamilyOriented?: boolean;
  isCareerOriented?: boolean;
  wantsChildren?: string;
  hasPets?: boolean;
  petPreference?: string;
  financialMindset?: string;
  socialActivity?: string;
  travelInterest?: string;
}

export interface PartnerPreferences {
  ageMin?: number;
  ageMax?: number;
  heightMin?: number;
  heightMax?: number;
  maritalStatus?: string[];
  religion?: string[];
  caste?: string[];
  subCaste?: string[];
  education?: string[];
  profession?: string[];
  annualIncomeMin?: number;
  annualIncomeMax?: number;
  complexion?: string[];
  bodyType?: string[];
  foodHabits?: string[];
  smokingHabit?: string;
  drinkingHabit?: string;
  preferredCountry?: string[];
  preferredState?: string[];
  preferredCity?: string[];
  rasi?: string[];
  nakshatra?: string[];
  hasNRIPreference?: boolean;
  nriPreferenceCountry?: string[];
  preferenceNote?: string;
}

export interface ProfilePhoto {
  _id: string;
  url: string;
  thumbnailUrl?: string;
  isPrivate: boolean;
  isVerified: boolean;
  isMain: boolean;
  order: number;
  uploadedAt: string;
}

// ─── Astrology ────────────────────────────────────────────────────────────────
export interface Astrology {
  _id: string;
  userId: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  birthCity?: string;
  birthState?: string;
  birthCountry?: string;
  rasi?: string;
  nakshatram?: string;
  pada?: number;
  lagnam?: string;
  gothram?: string;
  doshams?: {
    kujaDosham: boolean;
    kujaDoshamLevel?: string;
    manglik: boolean;
    nadiDosha: boolean;
    nadiType?: string;
    kaalSarpDosha: boolean;
    kaalSarpType?: string;
  };
  moonSign?: string;
  sunSign?: string;
  horoscopeUrl?: string;
  isHoroscopeVerified: boolean;
  isHoroscopePrivate: boolean;
}

// ─── Match ────────────────────────────────────────────────────────────────────
export interface Match {
  _id: string;
  userId: string;
  matchedUserId: string | MatchedUser;
  score: number;
  breakdown: Record<string, number>;
  explanation: string;
  rankPosition: number;
  isViewed: boolean;
  source: string;
  createdAt: string;
}

export interface MatchedUser {
  _id: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  profile: { completionScore: number; photoUrl?: string; thumbnailUrl?: string; verificationBadge: boolean; trustScore: number };
  subscription: { plan: SubscriptionPlan };
  lastActiveAt?: string;
}

// ─── Interest ─────────────────────────────────────────────────────────────────
export interface Interest {
  _id: string;
  senderId: string | Partial<User>;
  receiverId: string | Partial<User>;
  status: InterestStatus;
  message?: string;
  currentStage: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export type InterestStatus =
  | 'suggested' | 'viewed' | 'sent' | 'received'
  | 'accepted' | 'declined' | 'chat_started' | 'voice_called'
  | 'video_called' | 'meeting_scheduled' | 'family_discussion'
  | 'engaged' | 'married' | 'expired' | 'withdrawn';

// ─── Chat ─────────────────────────────────────────────────────────────────────
export interface Conversation {
  _id: string;
  participants: Array<Partial<User>>;
  lastMessage?: { content: string; senderId: string; type: string; sentAt: string };
  unreadCount: Record<string, number>;
  isActive: boolean;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string | Partial<User>;
  type: MessageType;
  content?: string;
  media?: { url: string; thumbnailUrl?: string; mimeType: string; size: number; duration?: number; filename?: string };
  replyTo?: Partial<Message>;
  reactions: Array<{ userId: string; emoji: string }>;
  readBy: Array<{ userId: string; readAt: string }>;
  deliveredTo: Array<{ userId: string; deliveredAt: string }>;
  isDeleted: boolean;
  isPinned: boolean;
  isStarred: boolean;
  starredBy: string[];
  createdAt: string;
  updatedAt: string;
}

export type MessageType = 'text' | 'image' | 'video' | 'document' | 'voice_note' | 'horoscope' | 'biodata' | 'contact_request' | 'location';

// ─── Notifications ────────────────────────────────────────────────────────────
export interface Notification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  createdAt: string;
}

// ─── Subscription ─────────────────────────────────────────────────────────────
export interface Subscription {
  _id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'expired' | 'cancelled' | 'trial' | 'pending';
  startDate: string;
  endDate: string;
  durationDays: number;
  price: number;
  currency: string;
  autoRenew: boolean;
  createdAt: string;
}

// ─── Payment ──────────────────────────────────────────────────────────────────
export interface Payment {
  _id: string;
  userId: string;
  orderId: string;
  provider: string;
  purpose: string;
  amount: number;
  currency: string;
  status: 'created' | 'pending' | 'paid' | 'failed' | 'refunded';
  paidAt?: string;
  createdAt: string;
}

// ─── Call ─────────────────────────────────────────────────────────────────────
export interface Call {
  _id: string;
  callId: string;
  callerId: string | Partial<User>;
  receiverId: string | Partial<User>;
  type: 'voice' | 'video';
  status: 'initiated' | 'ringing' | 'connected' | 'ended' | 'missed' | 'declined' | 'failed';
  agoraChannel: string;
  callerUid: number;
  receiverUid: number;
  startedAt?: string;
  answeredAt?: string;
  endedAt?: string;
  durationSeconds: number;
  createdAt: string;
}

// ─── Verification ─────────────────────────────────────────────────────────────
export interface Verification {
  _id: string;
  userId: string;
  type: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'expired';
  documentUrl?: string;
  rejectionReason?: string;
  verifiedAt?: string;
  createdAt: string;
}

// ─── Meeting ──────────────────────────────────────────────────────────────────
export interface Meeting {
  _id: string;
  participants: string[];
  type: 'video' | 'family' | 'physical';
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  venue?: string;
  onlineMeetingLink?: string;
  notes?: string;
  outcome?: string;
}

// ─── Support ──────────────────────────────────────────────────────────────────
export interface Ticket {
  _id: string;
  ticketNumber: string;
  userId: string;
  category: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'reopened';
  priority: 'low' | 'medium' | 'high' | 'critical';
  messages: Array<{ senderId: string; senderType: string; content: string; createdAt: string }>;
  createdAt: string;
  updatedAt: string;
}

// ─── API Response ─────────────────────────────────────────────────────────────
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

// ─── Search ───────────────────────────────────────────────────────────────────
export interface SearchFilters {
  gender?: 'male' | 'female';
  ageMin?: number;
  ageMax?: number;
  heightMin?: number;
  heightMax?: number;
  maritalStatus?: string[];
  religion?: string[];
  caste?: string[];
  subCaste?: string[];
  education?: string[];
  employmentType?: string[];
  industry?: string[];
  annualIncomeMin?: number;
  annualIncomeMax?: number;
  foodHabits?: string[];
  smokingHabit?: string[];
  drinkingHabit?: string[];
  familyType?: string[];
  familyValues?: string[];
  country?: string[];
  state?: string[];
  city?: string[];
  isNRI?: boolean;
  rasi?: string[];
  nakshatra?: string[];
  kujaDosham?: boolean;
  manglik?: boolean;
  isVerified?: boolean;
  hasPhoto?: boolean;
  minCompletionScore?: number;
  sortBy?: 'relevance' | 'last_active' | 'newest' | 'completion';
  sortOrder?: 'asc' | 'desc';
}

// ─── Success Story ────────────────────────────────────────────────────────────
export interface SuccessStory {
  _id: string;
  title: string;
  story: string;
  marriageDate?: string;
  photos: string[];
  videoUrl?: string;
  viewCount: number;
  likeCount: number;
  createdAt: string;
}

// ─── Marketplace ──────────────────────────────────────────────────────────────
export interface MarketplaceListing {
  _id: string;
  category: string;
  businessName: string;
  description: string;
  location: { city: string; state: string; country: string };
  photos: string[];
  priceMin?: number;
  priceMax?: number;
  currency: string;
  rating: number;
  reviewCount: number;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
}

export type MarketplaceCategory =
  | 'venue' | 'photography' | 'catering' | 'decoration' | 'makeup' | 'priest'
  | 'event_management' | 'music_band' | 'mehendi' | 'bridal_wear' | 'jewelry'
  | 'invitation' | 'honeymoon' | 'wedding_cake' | 'transportation';

export interface MarketplaceProvider {
  _id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  category: MarketplaceCategory;
  description: string;
  location: { address?: string; city: string; state?: string; country: string; pincode?: string };
  photos: string[];
  logoUrl?: string;
  serviceDetails?: Record<string, unknown>;
  priceMin?: number;
  priceMax?: number;
  currency: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  website?: string;
  socialLinks?: { instagram?: string; facebook?: string; youtube?: string };
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  isActive: boolean;
  createdAt: string;
}

export interface MarketplaceSlot {
  _id: string;
  providerId: string;
  date: string;
  label: string;
  startTime?: string;
  endTime?: string;
  slotType: 'full_day' | 'half_day' | 'hourly' | 'custom';
  capacity: number;
  bookedCount: number;
  price?: number;
  isAvailable: boolean;
  notes?: string;
}

export interface MarketplaceBooking {
  _id: string;
  bookingNumber: string;
  providerId: string | Partial<MarketplaceProvider>;
  slotId: string | Partial<MarketplaceSlot>;
  userId: string;
  eventDate: string;
  eventType: string;
  guestCount?: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
  amount: number;
  advanceAmount?: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'partial' | 'paid';
  cancelledAt?: string;
  createdAt: string;
}

export interface MarketplaceReview {
  _id: string;
  providerId: string;
  userId: string | { firstName: string; lastName: string; profile: { photoUrl?: string } };
  rating: number;
  review: string;
  isVerified: boolean;
  createdAt: string;
}
