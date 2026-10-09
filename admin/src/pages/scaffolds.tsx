import React from 'react';
import {
  Eye, Flag, AlertTriangle, Heart, MessageSquare, Phone, Calendar, UsersRound,
  Sparkles, Brain, Search, CreditCard, Wallet, Gift, Globe, Star, Store, Bell,
  Lock, Database, Clock, Activity, Trash2, FileText, ShieldCheck, BarChart3,
  UserCheck, Ban, Image, Megaphone, Settings, Code, Languages,
} from 'lucide-react';
import { ModuleScaffold } from './ModuleScaffold';

export const ModerationPage = () => (
  <ModuleScaffold title="Moderation" description="Review reported content and take action" icon={Flag}
    sections={[
      { title: 'Photo Review', description: 'Approve or reject profile and private photos', icon: Image },
      { title: 'Video Review', description: 'Moderate video introductions', icon: Eye },
      { title: 'Profile Content', description: 'Review bios and profile text for policy violations', icon: FileText },
      { title: 'Chat Reports', description: 'Investigate reported messages and conversations', icon: MessageSquare },
      { title: 'User Reports', description: 'Handle user-submitted reports', icon: Flag },
      { title: 'Abuse Reports', description: 'Escalate and act on abuse complaints', icon: AlertTriangle },
    ]} />
);

export const FraudPage = () => (
  <ModuleScaffold title="Fraud Management" description="Detect and investigate fraudulent activity" icon={AlertTriangle}
    sections={[
      { title: 'Duplicate Profiles', description: 'AI-flagged duplicate accounts', icon: UsersRound },
      { title: 'Fake Profiles', description: 'Suspected fake or bot profiles', icon: Ban },
      { title: 'Suspicious Activity', description: 'Anomalous behavior detection', icon: Eye },
      { title: 'Multiple Accounts', description: 'Same device / IP clusters', icon: UsersRound },
      { title: 'Payment Fraud', description: 'Chargebacks and payment anomalies', icon: CreditCard },
      { title: 'Risk Scores', description: 'User risk scoring dashboard', icon: BarChart3 },
    ]} />
);

export const BackgroundVerificationPage = () => (
  <ModuleScaffold title="Background Verification" description="Elite/VIP deep verification checks" icon={Eye}
    sections={[
      { title: 'Identity Check', description: 'Government ID cross-verification', icon: ShieldCheck },
      { title: 'Education Check', description: 'Degree and institution verification', icon: FileText },
      { title: 'Employment Check', description: 'Company and designation verification', icon: UserCheck },
      { title: 'Address Check', description: 'Residential address verification', icon: Globe },
    ]} />
);

export const InterestsPage = () => (
  <ModuleScaffold title="Interest Management" description="Track interest lifecycle and conversion funnel" icon={Heart}
    sections={[
      { title: 'Sent Interests', description: 'All interests sent across platform', icon: Heart },
      { title: 'Accepted Interests', description: 'Mutual matches and acceptances', icon: UserCheck },
      { title: 'Conversion Funnel', description: 'Suggested → Marriage funnel analytics', icon: BarChart3 },
    ]} />
);

export const ChatMonitorPage = () => (
  <ModuleScaffold title="Chat Monitor" description="Monitor conversations and moderate reported messages" icon={MessageSquare}
    sections={[
      { title: 'Active Conversations', description: 'Live conversation volume', icon: MessageSquare },
      { title: 'Reported Messages', description: 'Messages flagged for review', icon: Flag },
      { title: 'Chat Analytics', description: 'Volume, response rates, engagement', icon: BarChart3 },
      { title: 'Export Logs', description: 'Export conversation records for compliance', icon: Database },
    ]} />
);

export const CallsPage = () => (
  <ModuleScaffold title="Call Management" description="Agora RTC monitoring and call analytics" icon={Phone}
    sections={[
      { title: 'Voice Calls', description: 'Voice call logs and duration', icon: Phone },
      { title: 'Video Calls', description: 'Video call logs and quality', icon: Eye },
      { title: 'Call Analytics', description: 'Completed, missed, rejected rates', icon: BarChart3 },
    ]} />
);

export const MeetingsPage = () => (
  <ModuleScaffold title="Meeting Management" description="Video, family, and physical meetings" icon={Calendar}
    sections={[
      { title: 'Scheduled Meetings', description: 'Upcoming meeting calendar', icon: Calendar },
      { title: 'Outcomes', description: 'Meeting results and notes', icon: FileText },
      { title: 'Attendance', description: 'Attendance tracking', icon: UserCheck },
    ]} />
);

export const FamilyPage = () => (
  <ModuleScaffold title="Family Accounts" description="Candidate, parent, and guardian account management" icon={UsersRound}
    sections={[
      { title: 'Candidate Accounts', description: 'Primary member accounts', icon: UserCheck },
      { title: 'Parent Accounts', description: 'Parent-managed profiles', icon: UsersRound },
      { title: 'Guardian Accounts', description: 'Guardian-managed profiles', icon: UsersRound },
      { title: 'Approval Workflows', description: 'Multi-manager approval flows', icon: ShieldCheck },
    ]} />
);

export const MatchmakingPage = () => (
  <ModuleScaffold title="Matchmaking Rules" description="Configure compatibility weights and recommendation logic" icon={Sparkles}
    sections={[
      { title: 'Compatibility Weights', description: 'Tune 12-dimension scoring weights', icon: BarChart3 },
      { title: 'Astrology Rules', description: 'Kundli matching and dosha rules', icon: Star },
      { title: 'Recommendation Logic', description: 'AI recommendation parameters', icon: Brain },
      { title: 'Match Performance', description: 'Match acceptance analytics', icon: BarChart3 },
    ]} />
);

export const AiPage = () => (
  <ModuleScaffold title="AI Management" description="Configure AI features and providers" icon={Brain}
    sections={[
      { title: 'Match Recommendations', description: 'AI recommendation engine settings', icon: Sparkles },
      { title: 'Fraud Detection', description: 'AI fraud model configuration', icon: AlertTriangle },
      { title: 'Content Moderation', description: 'AI moderation thresholds', icon: Flag },
      { title: 'Profile Scoring', description: 'AI profile quality scoring', icon: BarChart3 },
      { title: 'Bio Generation', description: 'AI bio generator settings', icon: FileText },
      { title: 'Provider Config', description: 'LLM provider configuration', icon: Code },
    ]} />
);

export const SearchMgmtPage = () => (
  <ModuleScaffold title="Search Management" description="Search weights, trending, and analytics" icon={Search}
    sections={[
      { title: 'Search Weights', description: 'Relevance ranking configuration', icon: BarChart3 },
      { title: 'Trending Searches', description: 'Popular search terms', icon: Sparkles },
      { title: 'Search Analytics', description: 'Search behavior and performance', icon: BarChart3 },
    ]} />
);

export const PaymentsPage = () => (
  <ModuleScaffold title="Payment Management" description="Transactions, refunds, and revenue" icon={CreditCard}
    sections={[
      { title: 'Transactions', description: 'All Razorpay & Cashfree transactions', icon: CreditCard },
      { title: 'Refunds', description: 'Process and track refunds', icon: Wallet },
      { title: 'Failed Payments', description: 'Investigate failed transactions', icon: AlertTriangle },
      { title: 'Revenue Analytics', description: 'Revenue trends and breakdowns', icon: BarChart3 },
      { title: 'Coupon Usage', description: 'Coupon performance and redemption', icon: Gift },
      { title: 'Ledger', description: 'Complete financial ledger', icon: FileText },
    ]} />
);

export const WalletPage = () => (
  <ModuleScaffold title="Wallet Management" description="Credits, rewards, and balances" icon={Wallet}
    sections={[
      { title: 'Credits', description: 'Manage user wallet credits', icon: Wallet },
      { title: 'Referral Rewards', description: 'Reward distribution tracking', icon: Gift },
      { title: 'Promotional Credits', description: 'Issue promotional credits', icon: Sparkles },
      { title: 'Transaction History', description: 'Credit and debit history', icon: FileText },
    ]} />
);

export const ReferralsPage = () => (
  <ModuleScaffold title="Referral Management" description="Referral codes, performance, and rewards" icon={Gift}
    sections={[
      { title: 'Referral Codes', description: 'All active referral codes', icon: Gift },
      { title: 'Performance', description: 'Referral conversion analytics', icon: BarChart3 },
      { title: 'Reward Distribution', description: 'Track reward payouts', icon: Wallet },
    ]} />
);

export const CrmPage = () => (
  <ModuleScaffold title="CRM" description="Relationship manager dashboard" icon={Heart}
    sections={[
      { title: 'Assigned Users', description: 'Your assigned member portfolio', icon: UsersRound },
      { title: 'Match Suggestions', description: 'Curate and suggest matches', icon: Sparkles },
      { title: 'Follow Ups', description: 'Scheduled follow-up tasks', icon: Clock },
      { title: 'Meeting Scheduling', description: 'Coordinate member meetings', icon: Calendar },
      { title: 'Conversion Tracking', description: 'Track member progression', icon: BarChart3 },
      { title: 'Internal Notes', description: 'Private CRM notes', icon: FileText },
    ]} />
);

export const NotificationsPage = () => (
  <ModuleScaffold title="Notification Management" description="Templates, campaigns, and delivery" icon={Bell}
    sections={[
      { title: 'Templates', description: 'Push, email, SMS, WhatsApp templates', icon: FileText },
      { title: 'Campaigns', description: 'Create and schedule campaigns', icon: Megaphone },
      { title: 'Scheduled', description: 'Upcoming scheduled notifications', icon: Clock },
      { title: 'Delivery Reports', description: 'Delivery and open rates', icon: BarChart3 },
    ]} />
);

export const SeoPage = () => (
  <ModuleScaffold title="SEO Management" description="Meta tags, structured data, and sitemaps" icon={Globe}
    sections={[
      { title: 'Meta Tags', description: 'Page titles and descriptions', icon: FileText },
      { title: 'Open Graph', description: 'Social sharing previews', icon: Image },
      { title: 'Structured Data', description: 'Schema.org markup', icon: Code },
      { title: 'Sitemap & Robots', description: 'Sitemap and robots.txt', icon: Globe },
    ]} />
);

export const SuccessStoriesPage = () => (
  <ModuleScaffold title="Success Stories" description="Manage and approve success stories" icon={Star}
    sections={[
      { title: 'Pending Approval', description: 'Stories awaiting review', icon: Clock },
      { title: 'Published Stories', description: 'Live success stories', icon: Star },
      { title: 'Media Management', description: 'Photos and videos', icon: Image },
    ]} />
);

export const MarketplacePage = () => (
  <ModuleScaffold title="Marketplace Management" description="Wedding vendor listings and approvals" icon={Store}
    sections={[
      { title: 'Vendor Approvals', description: 'Review pending vendor listings', icon: ShieldCheck },
      { title: 'Categories', description: 'Venues, photography, catering, etc.', icon: Store },
      { title: 'Vendor Analytics', description: 'Listing performance', icon: BarChart3 },
    ]} />
);

export const RecommendationAnalyticsPage = () => (
  <ModuleScaffold title="Recommendation Analytics" description="Search behavior and recommendation performance" icon={Brain}
    sections={[
      { title: 'Search Behavior', description: 'User search patterns', icon: Search },
      { title: 'Viewed Profiles', description: 'Profile view analytics', icon: Eye },
      { title: 'Recommendation Performance', description: 'Accept/reject rates', icon: BarChart3 },
    ]} />
);

export const StoragePage = () => (
  <ModuleScaffold title="Storage Management" description="GCP media and document management" icon={Database}
    sections={[
      { title: 'Photos', description: 'Profile and gallery photos', icon: Image },
      { title: 'Videos', description: 'Video introductions', icon: Eye },
      { title: 'Verification Files', description: 'Private verification documents', icon: ShieldCheck },
      { title: 'Storage Analytics', description: 'Usage and lifecycle rules', icon: BarChart3 },
    ]} />
);

export const SecurityPage = () => (
  <ModuleScaffold title="Security Center" description="Roles, permissions, sessions, and access logs" icon={Lock}
    sections={[
      { title: 'Roles & Permissions', description: 'RBAC role configuration', icon: ShieldCheck },
      { title: 'Active Sessions', description: 'All admin and user sessions', icon: UserCheck },
      { title: 'Security Logs', description: 'Security event audit trail', icon: FileText },
      { title: 'IP Monitoring', description: 'Suspicious IP tracking', icon: Globe },
      { title: 'Access Logs', description: 'Resource access history', icon: Eye },
    ]} />
);

export const CronPage = () => (
  <ModuleScaffold title="Cron Jobs" description="Scheduled job monitoring and control" icon={Clock}
    sections={[
      { title: 'Scheduled Jobs', description: 'All registered cron jobs', icon: Clock },
      { title: 'Job History', description: 'Execution history', icon: FileText },
      { title: 'Failed Jobs', description: 'Failed job investigation', icon: AlertTriangle },
      { title: 'Retry Queue', description: 'Manual job retry', icon: Activity },
    ]} />
);

export const ActivityPage = () => (
  <ModuleScaffold title="Activity Timeline" description="Platform-wide activity explorer" icon={Activity}
    sections={[
      { title: 'Registrations', description: 'New user activity', icon: UserCheck },
      { title: 'Profile Updates', description: 'Profile change events', icon: FileText },
      { title: 'Engagement Events', description: 'Interests, chats, calls, meetings', icon: Heart },
      { title: 'Payment Events', description: 'Transaction activity', icon: CreditCard },
    ]} />
);

export const DataExportPage = () => (
  <ModuleScaffold title="Data Export" description="Bulk export platform data" icon={Database}
    sections={[
      { title: 'Export Users', description: 'CSV / Excel / PDF user export', icon: UsersRound },
      { title: 'Export Payments', description: 'Financial data export', icon: CreditCard },
      { title: 'Export Analytics', description: 'Metrics and reports export', icon: BarChart3 },
      { title: 'Export Tickets', description: 'Support data export', icon: FileText },
    ]} />
);

export const AccountDeletionPage = () => (
  <ModuleScaffold title="Account Deletion" description="Manage deletion and restore requests" icon={Trash2}
    sections={[
      { title: 'Deletion Requests', description: 'Pending account deletions', icon: Trash2 },
      { title: 'Restore Requests', description: 'Account restoration requests', icon: Activity },
      { title: 'Compliance Logs', description: 'GDPR/DPDP compliance records', icon: FileText },
    ]} />
);
