/* eslint-disable no-console */
import 'dotenv/config';
import mongoose, { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config';
import { UserModel } from '../modules/users/model/user.model';
import { ProfileModel } from '../modules/profiles/model/profile.model';
import { AstrologyModel } from '../modules/astrology/model/astrology.model';
import { SubscriptionModel } from '../modules/subscriptions/model/subscription.model';
import { PaymentModel } from '../modules/payments/model/payment.model';
import { InterestModel } from '../modules/interests/model/interest.model';
import { ConversationModel } from '../modules/chat/model/conversation.model';
import { MessageModel } from '../modules/chat/model/message.model';
import { CallModel } from '../modules/calls/model/call.model';
import { MeetingModel } from '../modules/meetings/model/meeting.model';
import { VerificationModel } from '../modules/verification/model/verification.model';
import { NotificationModel } from '../modules/notifications/model/notification.model';
import { WalletTransactionModel } from '../modules/wallet/model/wallet.model';
import { ReferralModel } from '../modules/referrals/model/referral.model';
import { TicketModel } from '../modules/support/model/ticket.model';
import { FeatureFlagModel } from '../modules/feature-flags/model/featureFlag.model';
import { SystemConfigModel } from '../modules/system-config/model/systemConfig.model';
import { CmsPageModel } from '../modules/cms/model/cms.model';
import { AnnouncementModel } from '../modules/announcements/model/announcement.model';
import { SuccessStoryModel } from '../modules/success-stories/model/successStory.model';
import { MarketplaceListingModel } from '../modules/marketplace/model/marketplace.model';
import { MarketplaceProviderModel } from '../modules/marketplace/model/marketplace-provider.model';
import { MarketplaceSlotModel } from '../modules/marketplace/model/marketplace-slot.model';
import { MarketplaceBookingModel } from '../modules/marketplace/model/marketplace-booking.model';
import { MarketplaceReviewModel } from '../modules/marketplace/model/marketplace-review.model';
import { SavedSearchModel } from '../modules/search/model/savedSearch.model';
import { ContactAccessModel } from '../modules/contact-access/model/contactAccess.model';
import { PhotoAccessModel } from '../modules/private-photo-access/model/photoAccess.model';
import { AuditLogModel } from '../modules/audit/model/audit.model';
import { UserRole, SubscriptionPlan } from '../constants';

// ─── helpers ──────────────────────────────────────────────────────────────────
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pickN = <T>(arr: T[], n: number): T[] => [...arr].sort(() => Math.random() - 0.5).slice(0, n);
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const code = (len = 8) => Array.from({ length: len }, () => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[rand(0, 30)]).join('');
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000);
const daysAhead = (d: number) => new Date(Date.now() + d * 86400000);

const MALE_NAMES = ['Arjun', 'Vikram', 'Karthik', 'Rohan', 'Aditya', 'Rahul', 'Sanjay', 'Vivek', 'Aravind', 'Surya', 'Nikhil', 'Pranav', 'Harish', 'Manoj', 'Tej'];
const FEMALE_NAMES = ['Ananya', 'Priya', 'Meera', 'Lavanya', 'Kavya', 'Divya', 'Sneha', 'Pooja', 'Anjali', 'Swathi', 'Nandini', 'Ramya', 'Deepika', 'Sahana', 'Ishita'];
const LAST_NAMES = ['Reddy', 'Sharma', 'Iyer', 'Naidu', 'Rao', 'Gupta', 'Menon', 'Patel', 'Nair', 'Verma', 'Chowdary', 'Pillai'];
const CITIES = [['Hyderabad', 'Telangana'], ['Bangalore', 'Karnataka'], ['Chennai', 'Tamil Nadu'], ['Mumbai', 'Maharashtra'], ['Pune', 'Maharashtra'], ['Delhi', 'Delhi'], ['Kochi', 'Kerala'], ['Vijayawada', 'Andhra Pradesh']];
const RELIGIONS = ['hindu', 'muslim', 'christian', 'jain'];
const CASTES = ['Brahmin', 'Kshatriya', 'Reddy', 'Kamma', 'Nair', 'Iyer', 'Vaishya'];
const DEGREES = ['degree', 'masters', 'phd', 'mbbs', 'engineer', 'mba'];
const COMPANIES = ['Infosys', 'TCS', 'Google', 'Microsoft', 'Amazon', 'Wipro', 'Self Employed', 'Apollo Hospitals'];
const DESIGNATIONS = ['Software Engineer', 'Doctor', 'Architect', 'Consultant', 'Manager', 'Business Owner', 'Professor'];
const RASIS = ['Mesha', 'Vrishabha', 'Mithuna', 'Kataka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanus', 'Makara', 'Kumbha', 'Meena'];
const NAKSHATRAS = ['Ashwini', 'Bharani', 'Rohini', 'Pushya', 'Magha', 'Hasta', 'Swati', 'Anuradha', 'Mula', 'Shravana', 'Revati'];
const FOOD = ['vegetarian', 'non_vegetarian', 'eggetarian', 'jain'];
const INTERESTS = ['Travel', 'Music', 'Cooking', 'Reading', 'Fitness', 'Movies', 'Photography', 'Dancing', 'Cricket', 'Yoga'];

const ADMINS: Array<{ first: string; last: string; email: string; role: UserRole }> = [
  { first: 'Super', last: 'Admin', email: env.ADMIN_EMAIL || 'super@avyuktha.com', role: UserRole.SUPER_ADMIN },
  { first: 'Ops', last: 'Admin', email: 'admin@avyuktha.com', role: UserRole.ADMIN },
  { first: 'Vera', last: 'Verifier', email: 'verifier@avyuktha.com', role: UserRole.VERIFIER },
  { first: 'Mod', last: 'Erator', email: 'moderator@avyuktha.com', role: UserRole.MODERATOR },
  { first: 'Sam', last: 'Support', email: 'support@avyuktha.com', role: UserRole.SUPPORT },
  { first: 'Rita', last: 'Manager', email: 'rm@avyuktha.com', role: UserRole.RELATIONSHIP_MANAGER },
  { first: 'Fin', last: 'Analyst', email: 'finance@avyuktha.com', role: UserRole.ANALYST },
  { first: 'Mark', last: 'Eting', email: 'marketing@avyuktha.com', role: UserRole.CONTENT_MANAGER },
];

const PLANS = Object.values(SubscriptionPlan);
const PLAN_PRICE: Record<string, number> = { free: 0, silver: 999, gold: 1999, platinum: 3499, elite: 5999, vip_assisted: 9999 };

async function seed() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(env.MONGODB_URI);
  console.log('✅ Connected\n');

  console.log('🧹 Wiping collections...');
  await Promise.all([
    UserModel, ProfileModel, AstrologyModel, SubscriptionModel, PaymentModel, InterestModel,
    ConversationModel, MessageModel, CallModel, MeetingModel, VerificationModel, NotificationModel,
    WalletTransactionModel, ReferralModel, TicketModel, FeatureFlagModel, SystemConfigModel,
    CmsPageModel, AnnouncementModel, SuccessStoryModel, MarketplaceListingModel,
    MarketplaceProviderModel, MarketplaceSlotModel, MarketplaceBookingModel, MarketplaceReviewModel,
    SavedSearchModel, ContactAccessModel, PhotoAccessModel, AuditLogModel,
  ].map((m) => (m as mongoose.Model<unknown>).deleteMany({})));
  console.log('✅ Wiped\n');

  // ── Admin / staff users ──
  console.log('👮 Seeding admin & staff users...');
  const adminDocs = await UserModel.insertMany(
    ADMINS.map((a, i) => ({
      phone: `+9190000000${(i + 1).toString().padStart(2, '0')}`,
      phoneVerified: true,
      email: a.email,
      emailVerified: true,
      firstName: a.first,
      lastName: a.last,
      gender: 'other',
      dateOfBirth: new Date('1990-01-01'),
      role: a.role,
      status: 'active',
      referralCode: code(),
      subscription: { plan: SubscriptionPlan.FREE, status: 'active' },
    }))
  );
  const superAdmin = adminDocs[0];
  console.log(`✅ ${adminDocs.length} staff users (login via email OTP  OTP shows in server logs)\n`);

  // ── Candidate members ──
  console.log('💁 Seeding member users + profiles + astrology...');
  const males = MALE_NAMES.length;
  const females = FEMALE_NAMES.length;
  const userDocs: InstanceType<typeof UserModel>[] = [];
  const profilePayloads: Record<string, unknown>[] = [];
  const astroPayloads: Record<string, unknown>[] = [];

  const buildMember = (first: string, gender: 'male' | 'female', idx: number) => {
    const last = pick(LAST_NAMES);
    const [city, state] = pick(CITIES);
    const plan = pick(PLANS);
    const age = rand(24, 34);
    const dob = new Date(new Date().getFullYear() - age, rand(0, 11), rand(1, 28));
    return {
      user: {
        phone: `+9198${gender === 'male' ? '1' : '2'}${(idx + 1).toString().padStart(7, '0')}`,
        phoneVerified: true,
        email: `${first.toLowerCase()}.${last.toLowerCase()}${idx}@example.com`,
        emailVerified: Math.random() > 0.3,
        firstName: first,
        lastName: last,
        gender,
        dateOfBirth: dob,
        role: UserRole.CANDIDATE,
        status: 'active' as const,
        referralCode: code(),
        subscription: { plan, status: 'active' as const, expiresAt: daysAhead(rand(10, 300)), startedAt: daysAgo(rand(1, 60)) },
        profile: {
          completionScore: rand(55, 100),
          isPhotoVerified: Math.random() > 0.5,
          verificationBadge: Math.random() > 0.4,
          trustScore: rand(40, 98),
          profileStrengthScore: rand(50, 95),
          incognitoMode: false,
        },
        wallet: { balance: rand(0, 1500), currency: 'INR' },
        lastActiveAt: daysAgo(rand(0, 20)),
      },
      profile: (userId: Types.ObjectId) => ({
        userId,
        slug: `${first}-${last}-${code(5)}`.toLowerCase(),
        personal: {
          height: rand(150, 188), weight: rand(50, 90),
          complexion: pick(['very_fair', 'fair', 'wheatish', 'wheatish_brown']),
          bodyType: pick(['slim', 'athletic', 'average']),
          maritalStatus: 'never_married',
          aboutMe: `Warm, family-oriented person from ${city}. Looking for a compatible life partner who values tradition and ambition.`,
          motherTongue: pick(['telugu', 'tamil', 'hindi', 'kannada', 'malayalam']),
          knownLanguages: ['English', 'Hindi'],
        },
        religion: { religion: pick(RELIGIONS), caste: pick(CASTES), subCaste: '', gotra: pick(['Bharadwaj', 'Kashyap', 'Vashishta', 'Atri']) },
        location: { country: 'India', state, city, isNRI: Math.random() > 0.8, willingToRelocate: Math.random() > 0.5 },
        education: { highestDegree: pick(DEGREES), fieldOfStudy: pick(['Computer Science', 'Medicine', 'Commerce', 'Engineering']), college: pick(['IIT', 'NIT', 'BITS', 'Osmania University']), graduationYear: rand(2008, 2020) },
        employment: { employmentType: pick(['employed_private', 'employed_government', 'business', 'self_employed']), company: pick(COMPANIES), designation: pick(DESIGNATIONS), industry: pick(['IT', 'Healthcare', 'Finance', 'Education']), experienceYears: rand(2, 14), annualIncome: rand(6, 60) * 100000, annualIncomeCurrency: 'INR', isIncomePrivate: Math.random() > 0.7 },
        family: { familyType: pick(['nuclear', 'joint']), familyStatus: pick(['middle_class', 'upper_middle_class', 'rich']), familyValues: pick(['traditional', 'moderate', 'liberal']), nativePlaceCity: city, nativePlaceState: state, fatherOccupation: pick(['Business', 'Retired', 'Govt Officer', 'Doctor']), motherOccupation: pick(['Homemaker', 'Teacher', 'Doctor']), brothers: rand(0, 2), sisters: rand(0, 2) },
        lifestyle: { foodHabits: pick(FOOD), smokingHabit: 'never', drinkingHabit: pick(['never', 'occasionally']), religiousPractice: pick(['religious', 'moderate']), interests: pickN(INTERESTS, rand(3, 6)), hobbies: pickN(INTERESTS, 3) },
        health: { hasDisabilities: false, hasDiabetes: false, hasBP: false, hasThyroid: Math.random() > 0.85 },
        assets: { house: Math.random() > 0.4, gold: Math.random() > 0.3, vehicles: pick([[], ['Car'], ['Car', 'Bike']]) as string[] },
        personality: { introvertExtrovert: pick(['introvert', 'extrovert', 'ambivert']), isFamilyOriented: true, isCareerOriented: true, wantsChildren: pick(['yes', 'open']) },
        partnerPreferences: { ageMin: age - 5, ageMax: age + 5, heightMin: 150, heightMax: 190, religion: [pick(RELIGIONS)], foodHabits: pickN(FOOD, 2) },
        photos: [],
        completionScore: rand(55, 100),
        profileStrengthScore: rand(50, 95),
        viewCount: rand(0, 500),
      }),
      astro: (userId: Types.ObjectId, profileId: Types.ObjectId) => ({
        userId, profileId,
        birthDate: dob, birthTime: `${rand(1, 12)}:${rand(0, 5)}0`, birthPlace: city, birthCity: city, birthState: state,
        rasi: pick(RASIS), nakshatram: pick(NAKSHATRAS), pada: rand(1, 4), gothram: pick(['Bharadwaj', 'Kashyap', 'Atri']),
        doshams: { kujaDosham: Math.random() > 0.7, manglik: Math.random() > 0.7, nadiDosha: false, kaalSarpDosha: false },
        isHoroscopeVerified: Math.random() > 0.6,
      }),
    };
  };

  const members: ReturnType<typeof buildMember>[] = [];
  MALE_NAMES.forEach((n, i) => members.push(buildMember(n, 'male', i)));
  FEMALE_NAMES.forEach((n, i) => members.push(buildMember(n, 'female', i)));

  for (const m of members) {
    const u = await UserModel.create(m.user);
    userDocs.push(u);
    const p = await ProfileModel.create(m.profile(u._id));
    await UserModel.updateOne({ _id: u._id }, { $set: { profileId: p._id } });
    await AstrologyModel.create(m.astro(u._id, p._id));
  }
  console.log(`✅ ${userDocs.length} members with profiles + astrology\n`);

  const maleUsers = userDocs.filter((u) => u.gender === 'male');
  const femaleUsers = userDocs.filter((u) => u.gender === 'female');

  // ── Subscriptions + Payments ──
  console.log('💳 Seeding subscriptions, payments, wallet...');
  for (const u of userDocs) {
    if (u.subscription.plan === 'free') continue;
    const price = PLAN_PRICE[u.subscription.plan];
    const pay = await PaymentModel.create({
      userId: u._id, orderId: `ord_${code(12)}`, providerOrderId: `rzp_${code(10)}`, providerPaymentId: `pay_${code(10)}`,
      provider: pick(['razorpay', 'cashfree']), purpose: 'subscription', amount: price, currency: 'INR', status: 'paid', paidAt: daysAgo(rand(1, 60)), webhookVerified: true,
    });
    await SubscriptionModel.create({
      userId: u._id, plan: u.subscription.plan, status: 'active', startDate: daysAgo(30), endDate: daysAhead(rand(30, 300)), durationDays: 90, price, currency: 'INR', paymentId: pay._id,
    });
    await WalletTransactionModel.create({
      userId: u._id, type: 'credit', source: 'cashback', amount: rand(50, 200), currency: 'INR', balanceBefore: 0, balanceAfter: rand(50, 200), description: 'Welcome cashback',
    });
  }
  console.log('✅ Subscriptions, payments, wallet txns\n');

  // ── Verifications ──
  console.log('🛡️  Seeding verifications...');
  for (const u of userDocs.slice(0, 20)) {
    for (const type of pickN(['aadhaar', 'pan', 'face', 'employment'], rand(1, 3))) {
      await VerificationModel.create({
        userId: u._id, type, status: pick(['pending', 'under_review', 'approved', 'rejected']),
        documentUrl: 'https://storage.googleapis.com/avyuktha/sample-doc.jpg',
      });
    }
  }
  console.log('✅ Verifications\n');

  // ── Interests + Conversations + Messages ──
  console.log('💌 Seeding interests, chats, calls, meetings...');
  for (let i = 0; i < 30; i++) {
    const sender = pick(maleUsers);
    const receiver = pick(femaleUsers);
    if (String(sender._id) === String(receiver._id)) continue;
    const status = pick(['sent', 'accepted', 'accepted', 'declined', 'chat_started']);
    try {
      const interest = await InterestModel.create({
        senderId: sender._id, receiverId: receiver._id, status, currentStage: status,
        message: 'I found your profile compatible. Looking forward to connecting.',
        statusHistory: [{ status, changedAt: new Date(), changedBy: sender._id }],
      });

      if (['accepted', 'chat_started'].includes(status)) {
        const convo = await ConversationModel.create({ participants: [sender._id, receiver._id], interestId: interest._id });
        const msgs = [
          { senderId: sender._id, content: 'Namaste! Glad we matched.' },
          { senderId: receiver._id, content: 'Namaste! Likewise, would love to know more about your family.' },
          { senderId: sender._id, content: 'Sure, my family is from ' + pick(CITIES)[0] + '. Shall we talk this weekend?' },
        ];
        for (const msg of msgs) {
          await MessageModel.create({ conversationId: convo._id, senderId: msg.senderId, type: 'text', content: msg.content });
        }
        await ConversationModel.updateOne({ _id: convo._id }, { $set: { lastMessage: { content: msgs[2].content, senderId: sender._id, type: 'text', sentAt: new Date() } } });

        // a call + meeting for some
        if (Math.random() > 0.5) {
          await CallModel.create({
            callId: code(16), callerId: sender._id, receiverId: receiver._id, type: pick(['voice', 'video']),
            status: pick(['ended', 'missed']), agoraChannel: `call_${code(8)}`, callerUid: rand(1, 1e6), receiverUid: rand(1, 1e6),
            durationSeconds: rand(0, 1200), startedAt: daysAgo(rand(1, 10)), endedAt: daysAgo(rand(0, 1)),
          });
        }
        if (Math.random() > 0.6) {
          await MeetingModel.create({
            participants: [sender._id, receiver._id], type: pick(['video', 'family', 'physical']),
            scheduledAt: daysAhead(rand(1, 14)), duration: 60, status: pick(['scheduled', 'confirmed']), proposedBy: sender._id,
          });
        }
      }
    } catch { /* duplicate pair  skip */ }
  }
  console.log('✅ Interests, conversations, messages, calls, meetings\n');

  // ── Contact / Photo access ──
  console.log('🔐 Seeding access requests...');
  for (let i = 0; i < 12; i++) {
    const a = pick(maleUsers); const b = pick(femaleUsers);
    if (String(a._id) === String(b._id)) continue;
    try { await ContactAccessModel.create({ requesterId: a._id, targetId: b._id, status: pick(['pending', 'approved', 'denied']) }); } catch { /* dup */ }
    try { await PhotoAccessModel.create({ requesterId: a._id, targetId: b._id, status: pick(['pending', 'approved']) }); } catch { /* dup */ }
  }
  console.log('✅ Contact + photo access\n');

  // ── Notifications + Saved searches + Referrals ──
  console.log('🔔 Seeding notifications, saved searches, referrals...');
  for (const u of userDocs.slice(0, 20)) {
    await NotificationModel.create({ userId: u._id, type: 'interest_received', title: 'New Interest', body: 'Someone is interested in your profile!', channels: ['push', 'in_app'], isRead: Math.random() > 0.5 });
    await NotificationModel.create({ userId: u._id, type: 'match_recommendation', title: 'New Matches', body: 'We found 5 new compatible matches.', channels: ['push'], isRead: false });
    await SavedSearchModel.create({ userId: u._id, name: 'Same caste, Bangalore', filters: { religion: ['hindu'], city: ['Bangalore'], ageMin: 24, ageMax: 32 }, alertEnabled: true });
  }
  for (let i = 0; i < 8; i++) {
    const ref = pick(maleUsers); const newU = femaleUsers[i];
    if (!newU || String(ref._id) === String(newU._id)) continue;
    try { await ReferralModel.create({ referrerId: ref._id, referredUserId: newU._id, referralCode: ref.referralCode!, status: pick(['registered', 'subscribed', 'rewarded']), rewardAmount: pick([0, 500]) }); } catch { /* dup */ }
  }
  console.log('✅ Notifications, saved searches, referrals\n');

  // ── Support tickets ──
  console.log('🎧 Seeding support tickets...');
  for (let i = 0; i < 10; i++) {
    const u = pick(userDocs);
    await TicketModel.create({
      ticketNumber: `TKT${Date.now()}${i.toString().padStart(3, '0')}`, userId: u._id,
      category: pick(['Account', 'Payment', 'Profile', 'Technical', 'Verification']),
      subject: pick(['Unable to upload photo', 'Payment not reflected', 'Verification pending', 'Profile not visible']),
      status: pick(['open', 'in_progress', 'resolved']), priority: pick(['low', 'medium', 'high']),
      messages: [{ senderId: u._id, senderType: 'user', content: 'Please help me resolve this issue.', attachments: [], createdAt: new Date() }],
    });
  }
  console.log('✅ Support tickets\n');

  // ── Feature flags ──
  console.log('🚩 Seeding feature flags...');
  await FeatureFlagModel.insertMany([
    { key: 'video_calls', name: 'Video Calls', description: 'Enable Agora video calling', isEnabled: true, enabledForPlans: ['gold', 'platinum', 'elite', 'vip_assisted'], rolloutPercentage: 100, createdBy: superAdmin._id },
    { key: 'ai_matching', name: 'AI Matching', description: 'AI-powered match recommendations', isEnabled: true, enabledForPlans: ['platinum', 'elite', 'vip_assisted'], rolloutPercentage: 100, createdBy: superAdmin._id },
    { key: 'marketplace', name: 'Wedding Marketplace', description: 'Vendor marketplace', isEnabled: true, rolloutPercentage: 80, createdBy: superAdmin._id },
    { key: 'background_verify', name: 'Background Verification', description: 'Elite background checks', isEnabled: false, enabledForPlans: ['elite', 'vip_assisted'], rolloutPercentage: 50, createdBy: superAdmin._id },
  ]);
  console.log('✅ Feature flags\n');

  // ── System config ──
  console.log('⚙️  Seeding system config...');
  await SystemConfigModel.insertMany([
    { key: 'otp_expiry_minutes', value: 10, type: 'number', category: 'auth', description: 'OTP validity in minutes', isPublic: false },
    { key: 'max_active_sessions', value: 5, type: 'number', category: 'auth', description: 'Max concurrent sessions', isPublic: false },
    { key: 'upload_max_mb', value: 10, type: 'number', category: 'uploads', description: 'Max upload size (MB)', isPublic: true },
    { key: 'referral_reward', value: 500, type: 'number', category: 'referrals', description: 'Reward per successful referral', isPublic: true },
    { key: 'silver_price', value: 999, type: 'number', category: 'subscriptions', description: 'Silver monthly price', isPublic: true },
    { key: 'gold_price', value: 1999, type: 'number', category: 'subscriptions', description: 'Gold monthly price', isPublic: true },
  ].map((c) => ({ ...c, updatedBy: superAdmin._id })));
  console.log('✅ System config\n');

  // ── CMS + Announcements + SEO ──
  console.log('📝 Seeding CMS pages & announcements...');
  await CmsPageModel.insertMany([
    { type: 'page', slug: 'about', title: 'About Avyuktha Matrimony', content: '<p>India\'s most trusted premium matrimony platform.</p>', isPublished: true, author: superAdmin._id },
    { type: 'page', slug: 'privacy-policy', title: 'Privacy Policy', content: '<p>Your privacy matters to us.</p>', isPublished: true, author: superAdmin._id },
    { type: 'page', slug: 'terms', title: 'Terms & Conditions', content: '<p>Terms of using Avyuktha.</p>', isPublished: true, author: superAdmin._id },
    { type: 'blog', slug: '5-tips-perfect-match', title: '5 Tips to Find Your Perfect Match', content: '<p>Finding the right partner...</p>', excerpt: 'Expert advice on finding compatibility.', isPublished: true, category: 'advice', author: superAdmin._id, publishedAt: daysAgo(5) },
    { type: 'blog', slug: 'kundli-matching-guide', title: 'Complete Guide to Kundli Matching', content: '<p>Understanding Gun Milan...</p>', excerpt: 'Astrology compatibility explained.', isPublished: true, category: 'astrology', author: superAdmin._id, publishedAt: daysAgo(12) },
    { type: 'faq', slug: 'faq-verification', title: 'How does verification work?', content: '<p>We verify Aadhaar, PAN, face...</p>', isPublished: true, author: superAdmin._id },
  ]);
  await AnnouncementModel.insertMany([
    { type: 'banner', title: 'New Year Offer  30% Off Gold Plan', content: 'Limited time offer on all premium plans!', target: 'all', isActive: true, priority: 10, startsAt: daysAgo(2), endsAt: daysAhead(15), createdBy: superAdmin._id },
    { type: 'popup', title: 'Complete Your Profile', content: 'Profiles with 80%+ completion get 5x more matches.', target: 'all', isActive: true, priority: 5, createdBy: superAdmin._id },
    { type: 'promotion', title: 'Refer & Earn ₹500', content: 'Invite friends and earn wallet credits.', target: 'premium', targetPlans: ['gold', 'platinum'], isActive: true, priority: 3, createdBy: superAdmin._id },
  ]);
  console.log('✅ CMS pages & announcements\n');

  // ── Success stories ──
  console.log('💑 Seeding success stories...');
  for (let i = 0; i < 5; i++) {
    const m = pick(maleUsers); const f = pick(femaleUsers);
    await SuccessStoryModel.create({
      userId1: m._id, userId2: f._id, title: `${m.firstName} & ${f.firstName}  A Match Made on Avyuktha`,
      story: 'We connected on Avyuktha and instantly felt a deep compatibility. The AI matching understood exactly what we were looking for. Six months later, we are happily married!',
      marriageDate: daysAgo(rand(30, 365)), photos: ['https://storage.googleapis.com/avyuktha/story-sample.jpg'],
      isApproved: true, approvedBy: superAdmin._id, approvedAt: daysAgo(10), isPublic: true, viewCount: rand(100, 5000), likeCount: rand(20, 800),
    });
  }
  console.log('✅ Success stories\n');

  // ── Marketplace ──
  console.log('🛍️  Seeding marketplace listings...');
  const VENDORS = [
    { category: 'venue', businessName: 'Royal Gardens Convention', priceMin: 150000, priceMax: 500000 },
    { category: 'photography', businessName: 'Candid Moments Studio', priceMin: 50000, priceMax: 200000 },
    { category: 'catering', businessName: 'Spice Route Caterers', priceMin: 400, priceMax: 1200 },
    { category: 'decoration', businessName: 'Bloom & Bliss Decor', priceMin: 80000, priceMax: 300000 },
    { category: 'makeup', businessName: 'Glamour Bridal Makeup', priceMin: 25000, priceMax: 80000 },
    { category: 'priest', businessName: 'Sri Vedic Purohits', priceMin: 11000, priceMax: 51000 },
    { category: 'event_management', businessName: 'Grand Affairs Events', priceMin: 200000, priceMax: 1000000 },
  ];
  await MarketplaceListingModel.insertMany(VENDORS.map((v) => {
    const [city, state] = pick(CITIES);
    return {
      ...v, description: `Premium ${v.category} services for your special day. Trusted by 500+ couples.`,
      location: { city, state, country: 'India' }, photos: ['https://storage.googleapis.com/avyuktha/vendor-sample.jpg'],
      currency: 'INR', rating: +(rand(35, 50) / 10).toFixed(1), reviewCount: rand(10, 400), isApproved: true, isActive: true, submittedBy: superAdmin._id,
    };
  }));
  console.log('✅ Marketplace listings\n');

  // ── Marketplace Providers ──
  console.log('🏪 Seeding marketplace providers + slots + reviews...');
  const providerPassword = await bcrypt.hash('Provider@123', 12);

  const providerData = [
    // ── venue ──
    {
      businessName: 'Royal Gardens Convention',
      ownerName: 'Ramesh Reddy',
      email: 'royal.gardens@provider.avyuktha.com',
      phone: '+919901111001',
      category: 'venue',
      description: 'Sprawling 5-acre convention complex with 3 air-conditioned banquet halls, lush outdoor garden, and dedicated bridal suite. Trusted by 700+ couples.',
      location: { city: 'Hyderabad', state: 'Telangana', country: 'India', address: 'Road No. 36, Jubilee Hills' },
      serviceDetails: { capacity: 2000, hallCount: 3, parkingCapacity: 500, hasAC: true, hasGenerator: true, cateringInHouse: true, valet: true, ownDecor: false, roomsAvailable: 20 },
      priceMin: 150000, priceMax: 500000,
      tags: ['convention hall', 'banquet', 'outdoor', 'large venue', 'ac hall'],
      rating: 4.7, reviewCount: 213, slotType: 'full_day', slotLabels: ['Full Day Booking'],
    },
    {
      businessName: 'Brindavan Banquet Hall',
      ownerName: 'Suresh Rao',
      email: 'brindavan.banquet@provider.avyuktha.com',
      phone: '+919901111002',
      category: 'venue',
      description: 'Elegant 3-hall complex in the heart of Bangalore with garden, rooftop, and full veg/non-veg catering. Perfect for weddings upto 1500 guests.',
      location: { city: 'Bangalore', state: 'Karnataka', country: 'India', address: 'Indiranagar, 100 Feet Road' },
      serviceDetails: { capacity: 1500, hallCount: 3, parkingCapacity: 300, hasAC: true, hasGenerator: true, cateringInHouse: true, valet: true, ownDecor: true, roomsAvailable: 15 },
      priceMin: 120000, priceMax: 400000,
      tags: ['banquet', 'garden', 'rooftop', 'bangalore venue'],
      rating: 4.5, reviewCount: 187, slotType: 'full_day', slotLabels: ['Full Day Booking'],
    },
    {
      businessName: 'The Grand Palace Convention',
      ownerName: 'Arun Kumar',
      email: 'grand.palace@provider.avyuktha.com',
      phone: '+919901111003',
      category: 'venue',
      description: 'Heritage-themed convention centre in Chennai with pillarless halls, valet parking, and in-house gourmet catering for up to 1200 guests.',
      location: { city: 'Chennai', state: 'Tamil Nadu', country: 'India', address: 'T. Nagar, Anna Salai' },
      serviceDetails: { capacity: 1200, hallCount: 2, parkingCapacity: 200, hasAC: true, hasGenerator: true, cateringInHouse: true, valet: true, ownDecor: false, roomsAvailable: 10 },
      priceMin: 100000, priceMax: 350000,
      tags: ['heritage', 'pillarless hall', 'gourmet', 'chennai venue'],
      rating: 4.6, reviewCount: 142, slotType: 'full_day', slotLabels: ['Full Day Booking'],
    },
    // ── photography ──
    {
      businessName: 'Candid Moments Studio',
      ownerName: 'Deepak Sharma',
      email: 'candid.moments@provider.avyuktha.com',
      phone: '+919901112001',
      category: 'photography',
      description: 'Award-winning candid wedding photography & cinematography. 10+ years, 800+ weddings across India. Drone shots, same-day edit reels.',
      location: { city: 'Hyderabad', state: 'Telangana', country: 'India', address: 'Banjara Hills, Road No. 12' },
      serviceDetails: { teamSize: 4, droneAvailable: true, sameDayEdit: true, albumIncluded: true, videoIncluded: true, deliveryDays: 30, styles: ['candid', 'cinematic', 'traditional'] },
      priceMin: 60000, priceMax: 250000,
      tags: ['candid photography', 'drone', 'cinematic', 'award-winning'],
      rating: 4.9, reviewCount: 389, slotType: 'full_day', slotLabels: ['Full Day Coverage', 'Half Day Coverage'],
    },
    {
      businessName: 'Frame Perfect Photography',
      ownerName: 'Sanjay Menon',
      email: 'frame.perfect@provider.avyuktha.com',
      phone: '+919901112002',
      category: 'photography',
      description: 'Specialised in South Indian wedding photography with traditional & contemporary styles. Pre-wedding shoots, maternity shoots, and portraits.',
      location: { city: 'Bangalore', state: 'Karnataka', country: 'India', address: 'Koramangala, 5th Block' },
      serviceDetails: { teamSize: 3, droneAvailable: false, sameDayEdit: false, albumIncluded: true, videoIncluded: true, deliveryDays: 45, styles: ['traditional', 'contemporary', 'editorial'] },
      priceMin: 50000, priceMax: 180000,
      tags: ['south indian wedding', 'portrait', 'pre-wedding', 'traditional'],
      rating: 4.6, reviewCount: 256, slotType: 'full_day', slotLabels: ['Full Day Coverage', 'Half Day Coverage'],
    },
    {
      businessName: 'Shutter Stories Mumbai',
      ownerName: 'Nikhil Patel',
      email: 'shutter.stories@provider.avyuktha.com',
      phone: '+919901112003',
      category: 'photography',
      description: 'Luxury wedding photography team covering pan-India weddings. Specialises in destination weddings, Bollywood-style reels, and art albums.',
      location: { city: 'Mumbai', state: 'Maharashtra', country: 'India', address: 'Andheri West, Versova' },
      serviceDetails: { teamSize: 6, droneAvailable: true, sameDayEdit: true, albumIncluded: true, videoIncluded: true, deliveryDays: 60, styles: ['luxury', 'editorial', 'destination', 'cinematic'] },
      priceMin: 100000, priceMax: 400000,
      tags: ['luxury', 'destination', 'cinematic', 'bollywood style'],
      rating: 4.8, reviewCount: 312, slotType: 'full_day', slotLabels: ['Full Day Coverage', 'Half Day Coverage'],
    },
    // ── catering ──
    {
      businessName: 'Spice Route Caterers',
      ownerName: 'Krishnamurthy Rao',
      email: 'spice.route@provider.avyuktha.com',
      phone: '+919901113001',
      category: 'catering',
      description: 'Authentic South Indian catering with 200+ menu items. Specialises in traditional banana leaf meals, temple-style prasad, and modern buffets.',
      location: { city: 'Hyderabad', state: 'Telangana', country: 'India', address: 'Secunderabad, Trimulgherry' },
      serviceDetails: { cuisineTypes: ['south indian', 'andhra', 'telangana'], minGuests: 100, maxGuests: 5000, pricePerPlate: 450, isVegOnly: false, staffIncluded: true, servingStyle: ['buffet', 'banana leaf', 'sit-down'] },
      priceMin: 400, priceMax: 1200,
      tags: ['south indian', 'banana leaf', 'traditional', 'buffet'],
      rating: 4.5, reviewCount: 178, slotType: 'full_day', slotLabels: ['Lunch Service', 'Dinner Service'],
    },
    {
      businessName: 'Maharaj Catering Services',
      ownerName: 'Raju Gupta',
      email: 'maharaj.catering@provider.avyuktha.com',
      phone: '+919901113002',
      category: 'catering',
      description: 'North & South Indian multi-cuisine catering. Live counters, Chinese, Continental, dessert stations. Rajasthani dal-baati specials.',
      location: { city: 'Mumbai', state: 'Maharashtra', country: 'India', address: 'Borivali East, Eksar Road' },
      serviceDetails: { cuisineTypes: ['north indian', 'south indian', 'chinese', 'continental'], minGuests: 200, maxGuests: 3000, pricePerPlate: 700, isVegOnly: false, staffIncluded: true, servingStyle: ['live counters', 'buffet', 'cocktail'] },
      priceMin: 600, priceMax: 1800,
      tags: ['multi-cuisine', 'live counters', 'north indian', 'continental'],
      rating: 4.4, reviewCount: 220, slotType: 'full_day', slotLabels: ['Lunch Service', 'Dinner Service'],
    },
    {
      businessName: 'Sai Annapurna Caterers',
      ownerName: 'Venkatesh Pillai',
      email: 'sai.annapurna@provider.avyuktha.com',
      phone: '+919901113003',
      category: 'catering',
      description: 'Pure vegetarian traditional Tamil Brahmin catering. Authentic satvic meals, mango leaf table settings, and panchayat-style service.',
      location: { city: 'Chennai', state: 'Tamil Nadu', country: 'India', address: 'Mylapore, Luz Church Road' },
      serviceDetails: { cuisineTypes: ['tamil brahmin', 'south indian', 'satvic'], minGuests: 100, maxGuests: 2000, pricePerPlate: 350, isVegOnly: true, staffIncluded: true, servingStyle: ['traditional sit-down', 'banana leaf'] },
      priceMin: 300, priceMax: 900,
      tags: ['pure vegetarian', 'brahmin', 'traditional', 'satvic'],
      rating: 4.8, reviewCount: 301, slotType: 'full_day', slotLabels: ['Lunch Service', 'Dinner Service'],
    },
    // ── decoration ──
    {
      businessName: 'Bloom & Bliss Decor',
      ownerName: 'Meenakshi Iyer',
      email: 'bloom.bliss@provider.avyuktha.com',
      phone: '+919901114001',
      category: 'decoration',
      description: 'Floral & thematic wedding decoration specialists. Fresh flowers, LED setups, mandap design, entry arches, photo booths, and balloon art.',
      location: { city: 'Hyderabad', state: 'Telangana', country: 'India', address: 'KPHB Colony, Phase 4' },
      serviceDetails: { decorTypes: ['floral', 'LED', 'balloon', 'thematic'], mandapIncluded: true, photoBoothIncluded: true, entryArchIncluded: true, team: 15 },
      priceMin: 80000, priceMax: 350000,
      tags: ['floral', 'LED', 'mandap', 'photo booth', 'thematic'],
      rating: 4.7, reviewCount: 196, slotType: 'full_day', slotLabels: ['Setup & Full Day'],
    },
    {
      businessName: 'Floral Fantasy Decorators',
      ownerName: 'Preethi Nair',
      email: 'floral.fantasy@provider.avyuktha.com',
      phone: '+919901114002',
      category: 'decoration',
      description: 'Bespoke wedding decoration studio specialising in premium Dutch flowers, draping, ceiling decor, and palace-style mandaps.',
      location: { city: 'Bangalore', state: 'Karnataka', country: 'India', address: 'Jayanagar, 4th Block' },
      serviceDetails: { decorTypes: ['premium floral', 'draping', 'ceiling decor', 'thematic'], mandapIncluded: true, photoBoothIncluded: true, entryArchIncluded: true, team: 20 },
      priceMin: 120000, priceMax: 500000,
      tags: ['premium floral', 'dutch flowers', 'palace mandap', 'draping'],
      rating: 4.9, reviewCount: 167, slotType: 'full_day', slotLabels: ['Setup & Full Day'],
    },
    // ── makeup ──
    {
      businessName: 'Bridal Glow Makeup Studio',
      ownerName: 'Swathi Reddy',
      email: 'bridal.glow@provider.avyuktha.com',
      phone: '+919901115001',
      category: 'makeup',
      description: 'Luxury bridal makeup by international certified artists. Airbrush, HD, and natural makeup. Pre-bridal facials and skin prep packages.',
      location: { city: 'Hyderabad', state: 'Telangana', country: 'India', address: 'Film Nagar, Madhapur' },
      serviceDetails: { services: ['bridal makeup', 'airbrush', 'HD makeup', 'pre-bridal facials'], travelAvailable: true, travelChargePerKm: 15, trialIncluded: true, skinPrepPackage: true },
      priceMin: 25000, priceMax: 90000,
      tags: ['airbrush', 'HD makeup', 'bridal', 'luxury', 'pre-bridal'],
      rating: 4.8, reviewCount: 428, slotType: 'half_day', slotLabels: ['Morning Bridal', 'Evening Function'],
    },
    {
      businessName: 'Glamour Touch Bridal',
      ownerName: 'Anitha Krishnan',
      email: 'glamour.touch@provider.avyuktha.com',
      phone: '+919901115002',
      category: 'makeup',
      description: 'Specialist in South Indian bridal looks Kanjivaram saree draping, temple jewellery styling, and traditional mukut makeup for brides.',
      location: { city: 'Chennai', state: 'Tamil Nadu', country: 'India', address: 'Adyar, Gandhi Nagar' },
      serviceDetails: { services: ['south indian bridal', 'saree draping', 'temple jewelry styling', 'traditional'], travelAvailable: true, travelChargePerKm: 10, trialIncluded: true, skinPrepPackage: false },
      priceMin: 18000, priceMax: 60000,
      tags: ['south indian', 'kanjivaram draping', 'traditional', 'temple jewelry'],
      rating: 4.7, reviewCount: 293, slotType: 'half_day', slotLabels: ['Morning Bridal', 'Evening Function'],
    },
    // ── priest ──
    {
      businessName: 'Sri Venkateswara Purohit Services',
      ownerName: 'Pandit Srinivasa Murthy',
      email: 'srivenkateswara.purohit@provider.avyuktha.com',
      phone: '+919901116001',
      category: 'priest',
      description: 'Vedic priests trained at Tirumala for Telugu/Kannada Hindu weddings. Saptapadi, Mangalsutra, Namakaranam, Seemantham and all samskaras.',
      location: { city: 'Hyderabad', state: 'Telangana', country: 'India', address: 'Dilsukhnagar, Gandhi Nagar' },
      serviceDetails: { languages: ['Telugu', 'Sanskrit', 'Kannada'], specialisations: ['saptapadi', 'namakaranam', 'seemantham', 'grihapravesham', 'satyanarayan puja'], travelIncluded: true, travelRadius: 100, priestCount: 3 },
      priceMin: 11000, priceMax: 51000,
      tags: ['vedic', 'telugu wedding', 'saptapadi', 'samskaras'],
      rating: 4.9, reviewCount: 534, slotType: 'half_day', slotLabels: ['Morning Ceremony', 'Evening Ceremony'],
    },
    {
      businessName: 'Pandit Ravi Kumar & Associates',
      ownerName: 'Pandit Ravi Kumar',
      email: 'pandit.ravi@provider.avyuktha.com',
      phone: '+919901116002',
      category: 'priest',
      description: 'Senior Vedic Pandit with 25 years of experience in North & South Indian wedding rituals. Available pan-India with prior booking.',
      location: { city: 'Bangalore', state: 'Karnataka', country: 'India', address: 'Basavanagudi, DVG Road' },
      serviceDetails: { languages: ['Kannada', 'Hindi', 'Sanskrit', 'Telugu'], specialisations: ['vivah', 'saptapadi', 'satyanarayan', 'grihapravesham', 'naamkaran'], travelIncluded: false, travelRadius: 200, priestCount: 2 },
      priceMin: 15000, priceMax: 71000,
      tags: ['north south indian', 'vedic pandit', 'pan india', 'vivah'],
      rating: 4.8, reviewCount: 412, slotType: 'half_day', slotLabels: ['Morning Ceremony', 'Evening Ceremony'],
    },
    {
      businessName: 'Vedic Rituals Tamil Priests',
      ownerName: 'Swaminathan Iyer',
      email: 'vedic.rituals.tamil@provider.avyuktha.com',
      phone: '+919901116003',
      category: 'priest',
      description: 'Certified Tamil Brahmin Agama priests specialising in Shaiva & Vaishnava wedding rites, Muhurtham, Kasi Yatra, and Homam.',
      location: { city: 'Chennai', state: 'Tamil Nadu', country: 'India', address: 'Mylapore, Chitrakulam North' },
      serviceDetails: { languages: ['Tamil', 'Sanskrit'], specialisations: ['tamil brahmin wedding', 'homam', 'muhurtham', 'kasi yatra', 'nithyakarma'], travelIncluded: true, travelRadius: 150, priestCount: 4 },
      priceMin: 12000, priceMax: 55000,
      tags: ['tamil brahmin', 'agama', 'homam', 'muhurtham', 'kasi yatra'],
      rating: 4.9, reviewCount: 387, slotType: 'half_day', slotLabels: ['Morning Ceremony', 'Afternoon Ceremony'],
    },
    // ── event_management ──
    {
      businessName: 'Grand Affairs Events',
      ownerName: 'Vivek Anand',
      email: 'grand.affairs@provider.avyuktha.com',
      phone: '+919901117001',
      category: 'event_management',
      description: 'Full-service luxury wedding planners. End-to-end event management venue, décor, catering, entertainment, honeymoon, all coordinated by a dedicated planner.',
      location: { city: 'Hyderabad', state: 'Telangana', country: 'India', address: 'Banjara Hills, Road No. 2' },
      serviceDetails: { servicesIncluded: ['venue', 'decor', 'catering', 'photography', 'priest', 'honeymoon'], teamSize: 25, dedicatedPlanner: true, destinationWeddings: true, experienceYears: 12 },
      priceMin: 300000, priceMax: 2000000,
      tags: ['full service', 'luxury planner', 'destination wedding', 'end to end'],
      rating: 4.8, reviewCount: 142, slotType: 'full_day', slotLabels: ['Full Day Coordination'],
    },
    {
      businessName: 'Dream Wedding Planners',
      ownerName: 'Rohini Kulkarni',
      email: 'dream.wedding@provider.avyuktha.com',
      phone: '+919901117002',
      category: 'event_management',
      description: 'Boutique wedding planning company specialising in intimate weddings under 500 guests. Theme weddings, beach weddings, temple weddings.',
      location: { city: 'Mumbai', state: 'Maharashtra', country: 'India', address: 'Juhu, Gulmohar Road' },
      serviceDetails: { servicesIncluded: ['venue', 'decor', 'catering', 'photography'], teamSize: 15, dedicatedPlanner: true, destinationWeddings: true, experienceYears: 8 },
      priceMin: 200000, priceMax: 1200000,
      tags: ['boutique', 'intimate', 'beach wedding', 'theme wedding'],
      rating: 4.7, reviewCount: 118, slotType: 'full_day', slotLabels: ['Full Day Coordination'],
    },
    // ── music_band ──
    {
      businessName: 'Raaga Wedding Band',
      ownerName: 'Kiran Goud',
      email: 'raaga.band@provider.avyuktha.com',
      phone: '+919901118001',
      category: 'music_band',
      description: 'Classical & contemporary wedding orchestra. 20-piece band performing Carnatic, Filmi, Sufi, and Western sets. Baraat, sangeet, reception.',
      location: { city: 'Hyderabad', state: 'Telangana', country: 'India', address: 'Ameerpet, SR Nagar' },
      serviceDetails: { bandSize: 20, genres: ['carnatic', 'filmi', 'sufi', 'western'], instruments: ['shehnai', 'tabla', 'keyboards', 'violin', 'trumpet'], performanceTypes: ['baraat', 'sangeet', 'reception'], soundSystemIncluded: true },
      priceMin: 50000, priceMax: 300000,
      tags: ['carnatic', 'baraat', 'sufi', 'orchestra', 'sangeet'],
      rating: 4.7, reviewCount: 203, slotType: 'full_day', slotLabels: ['Full Day Performance', 'Evening Performance'],
    },
    {
      businessName: 'Melody Makers Chennai',
      ownerName: 'Prasad Venkat',
      email: 'melody.makers@provider.avyuktha.com',
      phone: '+919901118002',
      category: 'music_band',
      description: 'Tamil wedding specialist band Nadaswaram maestros, nadhaswaram & tavil ensemble, DJ, and live singer for reception.',
      location: { city: 'Chennai', state: 'Tamil Nadu', country: 'India', address: 'Kodambakkam, Bazullah Road' },
      serviceDetails: { bandSize: 12, genres: ['nadaswaram', 'classical', 'folk', 'filmi'], instruments: ['nadaswaram', 'tavil', 'mridangam', 'keyboards'], performanceTypes: ['wedding ceremony', 'reception', 'engagement'], soundSystemIncluded: true },
      priceMin: 30000, priceMax: 150000,
      tags: ['nadaswaram', 'tavil', 'classical', 'tamil wedding'],
      rating: 4.8, reviewCount: 167, slotType: 'full_day', slotLabels: ['Full Day Performance', 'Evening Performance'],
    },
    // ── mehendi ──
    {
      businessName: 'Henna Bliss Mehendi',
      ownerName: 'Fatima Begum',
      email: 'henna.bliss@provider.avyuktha.com',
      phone: '+919901119001',
      category: 'mehendi',
      description: 'Rajasthani bridal mehendi artists. Intricate bridal mehendi, Arabic patterns, indo-Arabic fusion. Team of 6 artists for simultaneous service.',
      location: { city: 'Hyderabad', state: 'Telangana', country: 'India', address: 'Tolichowki, Mehdipatnam' },
      serviceDetails: { styles: ['rajasthani', 'arabic', 'indo-arabic', 'gujarati'], teamSize: 6, travelAvailable: true, travelCharge: 500, organicHenna: true, coneType: 'natural' },
      priceMin: 8000, priceMax: 50000,
      tags: ['rajasthani', 'arabic', 'bridal mehendi', 'organic henna'],
      rating: 4.8, reviewCount: 376, slotType: 'half_day', slotLabels: ['Morning Session', 'Evening Session'],
    },
    {
      businessName: 'Rajasthani Mehendi Art',
      ownerName: 'Sunita Devi',
      email: 'rajasthani.mehendi@provider.avyuktha.com',
      phone: '+919901119002',
      category: 'mehendi',
      description: 'Award-winning mehendi artists from Rajasthan. Specialises in traditional Rajasthani hidden groom portraits, peacock motifs, and modern minimalist patterns.',
      location: { city: 'Bangalore', state: 'Karnataka', country: 'India', address: 'Shivajinagar, Commercial Street' },
      serviceDetails: { styles: ['rajasthani', 'minimalist', 'traditional', 'fusion'], teamSize: 4, travelAvailable: true, travelCharge: 600, organicHenna: true, coneType: 'natural' },
      priceMin: 10000, priceMax: 60000,
      tags: ['award winning', 'hidden portrait', 'peacock', 'minimalist'],
      rating: 4.9, reviewCount: 289, slotType: 'half_day', slotLabels: ['Morning Session', 'Evening Session'],
    },
    // ── bridal_wear ──
    {
      businessName: 'Rani Bridal Boutique',
      ownerName: 'Padmaja Reddy',
      email: 'rani.bridal@provider.avyuktha.com',
      phone: '+919901120001',
      category: 'bridal_wear',
      description: 'Exclusive bridal wear boutique with Kanjivaram silks, Banarasi sarees, lehengas, and custom-tailored bridal outfits. Free alteration, trial included.',
      location: { city: 'Hyderabad', state: 'Telangana', country: 'India', address: 'Nampally, Abids' },
      serviceDetails: { wearTypes: ['kanjivaram silk', 'banarasi', 'lehenga', 'anarkali', 'custom'], rentalAvailable: true, purchaseAvailable: true, alterationIncluded: true, trialIncluded: true, deliveryDays: 7 },
      priceMin: 15000, priceMax: 500000,
      tags: ['kanjivaram', 'banarasi', 'lehenga', 'custom', 'rental'],
      rating: 4.6, reviewCount: 198, slotType: 'half_day', slotLabels: ['Morning Trial', 'Evening Trial'],
    },
    // ── jewelry ──
    {
      businessName: 'Kanchan Jewels & Bridal',
      ownerName: 'Shyam Sunder',
      email: 'kanchan.jewels@provider.avyuktha.com',
      phone: '+919901121001',
      category: 'jewelry',
      description: 'Heritage bridal jewellery gold, diamond, polki, and temple jewellery for South Indian weddings. On-loan bridal sets available.',
      location: { city: 'Hyderabad', state: 'Telangana', country: 'India', address: 'Secunderabad, Paradise Circle' },
      serviceDetails: { jewelleryTypes: ['gold', 'diamond', 'polki', 'temple', 'kundan'], rentalAvailable: true, purchaseAvailable: true, customDesign: true, hallmarked: true, trialSession: true },
      priceMin: 10000, priceMax: 2000000,
      tags: ['gold', 'diamond', 'polki', 'temple jewelry', 'rental'],
      rating: 4.7, reviewCount: 342, slotType: 'half_day', slotLabels: ['Morning Appointment', 'Afternoon Appointment'],
    },
    // ── invitation ──
    {
      businessName: 'Divine Wedding Invitations',
      ownerName: 'Arjun Hegde',
      email: 'divine.invitations@provider.avyuktha.com',
      phone: '+919901122001',
      category: 'invitation',
      description: 'Designer wedding invitations printed, digital, box-style, and eco-friendly. Custom illustrations, gold foiling, custom QR e-invites.',
      location: { city: 'Bangalore', state: 'Karnataka', country: 'India', address: 'Rajajinagar, 1st Block' },
      serviceDetails: { types: ['printed', 'digital', 'box style', 'scroll', 'eco-friendly'], minQuantity: 50, customIllustration: true, goldFoiling: true, digitalEInvite: true, deliveryDays: 10 },
      priceMin: 50, priceMax: 2000,
      tags: ['designer', 'gold foil', 'box invitation', 'digital', 'custom'],
      rating: 4.8, reviewCount: 523, slotType: 'half_day', slotLabels: ['Design Consultation'],
    },
    // ── honeymoon ──
    {
      businessName: 'Bliss Honeymoon Specialists',
      ownerName: 'Aditya Varma',
      email: 'bliss.honeymoon@provider.avyuktha.com',
      phone: '+919901123001',
      category: 'honeymoon',
      description: 'Tailored honeymoon packages Maldives, Bali, Europe, Kerala Backwaters, Himachal. Visa assistance, couple spa, private villa bookings.',
      location: { city: 'Hyderabad', state: 'Telangana', country: 'India', address: 'Begumpet, Prakash Nagar' },
      serviceDetails: { destinations: ['Maldives', 'Bali', 'Kerala', 'Himachal', 'Europe', 'Thailand'], visaAssistance: true, minNights: 4, maxNights: 21, privateSpa: true, privateVilla: true },
      priceMin: 50000, priceMax: 1500000,
      tags: ['maldives', 'bali', 'honeymoon', 'private villa', 'couple spa'],
      rating: 4.8, reviewCount: 214, slotType: 'half_day', slotLabels: ['Planning Consultation'],
    },
    // ── wedding_cake ──
    {
      businessName: 'Sweet Moments Cake Studio',
      ownerName: 'Lakshmi Prasanna',
      email: 'sweet.moments@provider.avyuktha.com',
      phone: '+919901124001',
      category: 'wedding_cake',
      description: 'Luxury custom wedding cakes and dessert tables. Belgian chocolate, fondant sculpting, tiered floral cakes, and eggless options.',
      location: { city: 'Hyderabad', state: 'Telangana', country: 'India', address: 'Kondapur, Hi-Tech City Road' },
      serviceDetails: { cakeTypes: ['tiered', 'sculpted', 'floral', 'naked', 'fondant'], maxTiers: 7, egglessAvailable: true, samplingAvailable: true, deliveryRadius: 50, dessertTableAvailable: true },
      priceMin: 5000, priceMax: 150000,
      tags: ['luxury cake', 'fondant', 'eggless', 'tiered', 'dessert table'],
      rating: 4.9, reviewCount: 412, slotType: 'half_day', slotLabels: ['Order Consultation'],
    },
    // ── transportation ──
    {
      businessName: 'Royal Wedding Cars Hyderabad',
      ownerName: 'Mohammed Irfan',
      email: 'royal.cars@provider.avyuktha.com',
      phone: '+919901125001',
      category: 'transportation',
      description: 'Luxury wedding car rentals vintage cars, white Rolls Royce, BMW, Mercedes, and decorated baraat vehicles. Horse-drawn carriages on request.',
      location: { city: 'Hyderabad', state: 'Telangana', country: 'India', address: 'Saidabad, Malakpet' },
      serviceDetails: { vehicleTypes: ['vintage car', 'Rolls Royce', 'BMW', 'Mercedes', 'horse-drawn carriage', 'decorated auto'], fleetSize: 30, driverIncluded: true, decorationIncluded: true, pricePerDay: true },
      priceMin: 15000, priceMax: 200000,
      tags: ['rolls royce', 'vintage car', 'luxury', 'baraat', 'horse carriage'],
      rating: 4.6, reviewCount: 187, slotType: 'full_day', slotLabels: ['Full Day Hire', 'Half Day Hire'],
    },
  ] as const;

  const createdProviders: { _id: Types.ObjectId; category: string; slotType: string; slotLabels: readonly string[]; priceMin: number }[] = [];

  for (const p of providerData) {
    const doc = await MarketplaceProviderModel.create({
      businessName: p.businessName,
      ownerName: p.ownerName,
      email: p.email,
      phone: p.phone,
      passwordHash: providerPassword,
      category: p.category,
      description: p.description,
      location: p.location,
      serviceDetails: p.serviceDetails,
      priceMin: p.priceMin,
      priceMax: p.priceMax,
      currency: 'INR',
      tags: p.tags,
      photos: [`https://storage.googleapis.com/avyuktha/marketplace/${p.category}-sample.jpg`],
      rating: p.rating,
      reviewCount: p.reviewCount,
      status: 'approved',
      isActive: true,
    });
    createdProviders.push({ _id: doc._id as Types.ObjectId, category: p.category, slotType: p.slotType, slotLabels: p.slotLabels, priceMin: p.priceMin });
  }
  console.log(`✅ ${createdProviders.length} marketplace providers\n`);

  // ── Slots for time-based providers ──
  console.log('📅 Seeding provider slots...');
  const SLOT_CATEGORIES = new Set(['venue', 'photography', 'catering', 'priest', 'music_band', 'makeup', 'mehendi', 'decoration', 'event_management', 'bridal_wear', 'jewelry', 'invitation', 'transportation']);
  const DAYS_AHEAD = 60;
  const allSlots: Record<string, unknown>[] = [];

  for (const provider of createdProviders) {
    if (!SLOT_CATEGORIES.has(provider.category)) continue;
    for (let d = 1; d <= DAYS_AHEAD; d++) {
      const date = new Date();
      date.setDate(date.getDate() + d);
      date.setHours(0, 0, 0, 0);
      for (const label of provider.slotLabels) {
        allSlots.push({
          providerId: provider._id,
          date,
          label,
          slotType: provider.slotType,
          capacity: 1,
          bookedCount: 0,
          price: provider.priceMin,
          isAvailable: true,
        });
      }
    }
  }

  await MarketplaceSlotModel.insertMany(allSlots);
  console.log(`✅ ${allSlots.length} slots created\n`);

  // ── Sample bookings ──
  console.log('📋 Seeding sample bookings...');
  const venueProviders = createdProviders.filter((p) => p.category === 'venue');
  const photoProviders = createdProviders.filter((p) => p.category === 'photography');
  const sampleBookings: Record<string, unknown>[] = [];

  const getSlot = async (providerId: Types.ObjectId) =>
    MarketplaceSlotModel.findOne({ providerId, bookedCount: 0, isAvailable: true }).sort({ date: 1 });

  for (const u of userDocs.slice(0, 5)) {
    const vp = pick(venueProviders);
    const slot = await getSlot(vp._id);
    if (slot) {
      sampleBookings.push({
        bookingNumber: `BK${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 100)}`,
        providerId: vp._id,
        slotId: slot._id,
        userId: u._id,
        eventDate: slot.date,
        eventType: pick(['Wedding', 'Engagement', 'Reception', 'Mehendi']),
        guestCount: rand(200, 800),
        customerName: `${u.firstName} ${u.lastName}`,
        customerPhone: u.phone,
        amount: rand(150000, 400000),
        status: pick(['confirmed', 'pending']) as 'confirmed' | 'pending',
        paymentStatus: 'paid' as const,
        notes: 'Booked via seed data.',
      });
      await MarketplaceSlotModel.updateOne({ _id: slot._id }, { $inc: { bookedCount: 1 }, $set: { isAvailable: false } });
    }
  }

  for (const u of userDocs.slice(5, 10)) {
    const pp = pick(photoProviders);
    const slot = await getSlot(pp._id);
    if (slot) {
      sampleBookings.push({
        bookingNumber: `BK${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 100)}`,
        providerId: pp._id,
        slotId: slot._id,
        userId: u._id,
        eventDate: slot.date,
        eventType: 'Wedding',
        guestCount: rand(100, 300),
        customerName: `${u.firstName} ${u.lastName}`,
        customerPhone: u.phone,
        amount: rand(60000, 200000),
        status: 'confirmed' as const,
        paymentStatus: 'paid' as const,
        notes: 'Photography booking via seed.',
      });
      await MarketplaceSlotModel.updateOne({ _id: slot._id }, { $inc: { bookedCount: 1 }, $set: { isAvailable: false } });
    }
  }

  await MarketplaceBookingModel.insertMany(sampleBookings);
  console.log(`✅ ${sampleBookings.length} sample bookings\n`);

  // ── Reviews for providers ──
  console.log('⭐ Seeding provider reviews...');
  const reviewTexts = [
    'Absolutely fantastic experience! Highly recommended.',
    'Very professional team. Everything was on point.',
    'Excellent service. Will definitely book again.',
    'The best in the city. Our wedding was a dream!',
    'Great value for money. Very accommodating.',
  ];
  const reviews: Record<string, unknown>[] = [];
  for (const provider of createdProviders.slice(0, 10)) {
    for (const u of pickN(userDocs, 3)) {
      reviews.push({
        providerId: provider._id,
        userId: u._id,
        rating: rand(4, 5),
        review: pick(reviewTexts),
        isVerified: true,
      });
    }
  }
  try { await MarketplaceReviewModel.insertMany(reviews, { ordered: false }); } catch { /* ignore duplicate key */ }
  console.log(`✅ ${reviews.length} provider reviews\n`);

  // ── Audit logs ──
  console.log('📜 Seeding audit logs...');
  await AuditLogModel.insertMany(
    Array.from({ length: 20 }).map(() => ({
      performedBy: pick(adminDocs)._id, action: pick(['auth.login', 'user.suspended', 'verification.approved', 'payment.success', 'admin.action']),
      entityType: 'User', entityId: String(pick(userDocs)._id), ipAddress: `49.${rand(1, 255)}.${rand(1, 255)}.${rand(1, 255)}`, platform: 'admin_panel',
    }))
  );
  console.log('✅ Audit logs\n');

  // ── Summary ──
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 SEED COMPLETE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📧 ADMIN LOGINS (admin panel  email OTP, OTP printed in API server logs):');
  ADMINS.forEach((a) => console.log(`   ${a.role.padEnd(22)} ${a.email}`));
  console.log('\n📱 SAMPLE MEMBER LOGINS (client  mobile/email OTP, OTP printed in API server logs):');
  console.log(`   Male:   ${maleUsers[0].phone}  /  ${maleUsers[0].email}`);
  console.log(`   Female: ${femaleUsers[0].phone}  /  ${femaleUsers[0].email}`);
  console.log(`\n   Total: ${adminDocs.length} staff + ${userDocs.length} members`);
  console.log('\n💡 Login flow: enter email/phone → request OTP → read OTP from the running API server console.');
  console.log('\n🏪 MARKETPLACE PROVIDER LOGINS (POST /api/v1/marketplace/providers/auth/login):');
  console.log('   Password for all providers: Provider@123');
  console.log('   Venue:           royal.gardens@provider.avyuktha.com');
  console.log('   Photography:     candid.moments@provider.avyuktha.com');
  console.log('   Catering:        spice.route@provider.avyuktha.com');
  console.log('   Decoration:      bloom.bliss@provider.avyuktha.com');
  console.log('   Makeup:          bridal.glow@provider.avyuktha.com');
  console.log('   Priest:          srivenkateswara.purohit@provider.avyuktha.com');
  console.log('   Event Mgmt:      grand.affairs@provider.avyuktha.com');
  console.log('   Music Band:      raaga.band@provider.avyuktha.com');
  console.log('   Mehendi:         henna.bliss@provider.avyuktha.com');
  console.log('   Bridal Wear:     rani.bridal@provider.avyuktha.com');
  console.log('   Jewelry:         kanchan.jewels@provider.avyuktha.com');
  console.log('   Invitation:      divine.invitations@provider.avyuktha.com');
  console.log('   Honeymoon:       bliss.honeymoon@provider.avyuktha.com');
  console.log('   Wedding Cake:    sweet.moments@provider.avyuktha.com');
  console.log('   Transportation:  royal.cars@provider.avyuktha.com\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
