import { UserModel } from '../../users/model/user.model';
import { ProfileModel } from '../../profiles/model/profile.model';
import { AstrologyModel } from '../../astrology/model/astrology.model';
import { searchCache } from '../../../services/cache.service';
import { buildPagination } from '../../../utils/response';

export interface SearchFilters {
  // Basic
  gender?: 'male' | 'female';
  ageMin?: number;
  ageMax?: number;
  heightMin?: number;
  heightMax?: number;
  maritalStatus?: string[];
  motherTongue?: string[];

  // Religion
  religion?: string[];
  caste?: string[];
  subCaste?: string[];
  gothram?: string[];

  // Location
  country?: string[];
  state?: string[];
  city?: string[];
  isNRI?: boolean;
  nriCountry?: string[];
  willingToRelocate?: boolean;

  // Education
  highestDegree?: string[];
  fieldOfStudy?: string[];
  college?: string[];

  // Employment
  employmentType?: string[];
  industry?: string[];
  designation?: string[];
  annualIncomeMin?: number;
  annualIncomeMax?: number;

  // Lifestyle
  foodHabits?: string[];
  smokingHabit?: string[];
  drinkingHabit?: string[];
  fitnessActivities?: string[];
  hobbies?: string[];

  // Family
  familyType?: string[];
  familyStatus?: string[];
  familyValues?: string[];

  // Health
  hasDisabilities?: boolean;

  // Verification
  isVerified?: boolean;
  hasBadge?: boolean;

  // Astrology
  rasi?: string[];
  nakshatra?: string[];
  kujaDosham?: boolean;
  manglik?: boolean;

  // Assets
  hasHouse?: boolean;
  hasVehicle?: boolean;

  // Personality
  introvertExtrovert?: string[];
  wantsChildren?: string[];

  // Subscription
  plan?: string[];

  // Profile quality
  minCompletionScore?: number;
  hasPhoto?: boolean;

  // Sort
  sortBy?: 'relevance' | 'last_active' | 'newest' | 'completion';
  sortOrder?: 'asc' | 'desc';
}

export class SearchService {
  async searchProfiles(
    currentUserId: string,
    currentGender: string,
    filters: SearchFilters,
    page: number,
    limit: number
  ): Promise<{ results: any[]; total: number; pagination: any }> {
    const skip = (page - 1) * limit;

    // Build match query
    const profileQuery: Record<string, unknown> = { isActive: true };

    // Apply all profile-level filters
    if (filters.heightMin !== undefined) profileQuery['personal.height'] = { $gte: filters.heightMin };
    if (filters.heightMax !== undefined) {
      profileQuery['personal.height'] = {
        ...(profileQuery['personal.height'] as object ?? {}),
        $lte: filters.heightMax,
      };
    }
    if (filters.maritalStatus?.length) profileQuery['personal.maritalStatus'] = { $in: filters.maritalStatus };
    if (filters.motherTongue?.length) profileQuery['personal.motherTongue'] = { $in: filters.motherTongue };

    if (filters.religion?.length) profileQuery['religion.religion'] = { $in: filters.religion };
    if (filters.caste?.length) profileQuery['religion.caste'] = { $in: filters.caste };
    if (filters.subCaste?.length) profileQuery['religion.subCaste'] = { $in: filters.subCaste };
    if (filters.gothram?.length) profileQuery['religion.gothram'] = { $in: filters.gothram };

    if (filters.country?.length) profileQuery['location.country'] = { $in: filters.country };
    if (filters.state?.length) profileQuery['location.state'] = { $in: filters.state };
    if (filters.city?.length) profileQuery['location.city'] = { $in: filters.city };
    if (filters.isNRI !== undefined) profileQuery['location.isNRI'] = filters.isNRI;
    if (filters.nriCountry?.length) profileQuery['location.nriCountry'] = { $in: filters.nriCountry };
    if (filters.willingToRelocate !== undefined) profileQuery['location.willingToRelocate'] = filters.willingToRelocate;

    if (filters.highestDegree?.length) profileQuery['education.highestDegree'] = { $in: filters.highestDegree };
    if (filters.fieldOfStudy?.length) profileQuery['education.fieldOfStudy'] = { $in: filters.fieldOfStudy };

    if (filters.employmentType?.length) profileQuery['employment.employmentType'] = { $in: filters.employmentType };
    if (filters.industry?.length) profileQuery['employment.industry'] = { $in: filters.industry };
    if (filters.annualIncomeMin !== undefined) {
      profileQuery['employment.annualIncome'] = { $gte: filters.annualIncomeMin };
    }
    if (filters.annualIncomeMax !== undefined) {
      profileQuery['employment.annualIncome'] = {
        ...(profileQuery['employment.annualIncome'] as object ?? {}),
        $lte: filters.annualIncomeMax,
      };
    }

    if (filters.foodHabits?.length) profileQuery['lifestyle.foodHabits'] = { $in: filters.foodHabits };
    if (filters.smokingHabit?.length) profileQuery['lifestyle.smokingHabit'] = { $in: filters.smokingHabit };
    if (filters.drinkingHabit?.length) profileQuery['lifestyle.drinkingHabit'] = { $in: filters.drinkingHabit };

    if (filters.familyType?.length) profileQuery['family.familyType'] = { $in: filters.familyType };
    if (filters.familyValues?.length) profileQuery['family.familyValues'] = { $in: filters.familyValues };

    if (filters.hasDisabilities !== undefined) profileQuery['health.hasDisabilities'] = filters.hasDisabilities;

    if (filters.wantsChildren?.length) profileQuery['personality.wantsChildren'] = { $in: filters.wantsChildren };
    if (filters.introvertExtrovert?.length) profileQuery['personality.introvertExtrovert'] = { $in: filters.introvertExtrovert };

    if (filters.minCompletionScore !== undefined) {
      profileQuery['completionScore'] = { $gte: filters.minCompletionScore };
    }
    if (filters.hasPhoto) {
      profileQuery['photos'] = { $elemMatch: { isMain: true } };
    }

    // User-level filters
    const targetGender = filters.gender ?? (currentGender === 'male' ? 'female' : 'male');
    const userQuery: Record<string, unknown> = {
      _id: { $ne: currentUserId },
      gender: targetGender,
      isDeleted: false,
      status: 'active',
    };

    if (filters.ageMin !== undefined || filters.ageMax !== undefined) {
      const now = new Date();
      const dobQuery: Record<string, Date> = {};
      if (filters.ageMax !== undefined) {
        dobQuery.$gte = new Date(now.getFullYear() - filters.ageMax, now.getMonth(), now.getDate());
      }
      if (filters.ageMin !== undefined) {
        dobQuery.$lte = new Date(now.getFullYear() - filters.ageMin, now.getMonth(), now.getDate());
      }
      userQuery['dateOfBirth'] = dobQuery;
    }

    if (filters.isVerified) userQuery['profile.verificationBadge'] = true;
    if (filters.hasBadge) userQuery['profile.verificationBadge'] = true;
    if (filters.plan?.length) userQuery['subscription.plan'] = { $in: filters.plan };

    // Fetch matching users
    const matchingUsers = await UserModel.find(userQuery, { _id: 1 }).lean();
    const userIds = matchingUsers.map(u => u._id);

    if (userIds.length === 0) {
      return { results: [], total: 0, pagination: buildPagination(page, limit, 0) };
    }

    profileQuery['userId'] = { $in: userIds };

    // Sort
    const sortMap: Record<string, Record<string, 1 | -1>> = {
      relevance: { completionScore: -1 },
      last_active: { updatedAt: -1 },
      newest: { createdAt: -1 },
      completion: { completionScore: -1 },
    };
    const sort = sortMap[filters.sortBy ?? 'relevance'];

    const [profiles, total] = await Promise.all([
      ProfileModel.find(profileQuery)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('userId', 'firstName lastName gender dateOfBirth subscription profile status lastActiveAt')
        .lean(),
      ProfileModel.countDocuments(profileQuery),
    ]);

    // Handle astrology filters (post-join for now)
    let results = profiles;
    if (filters.rasi?.length || filters.nakshatra?.length || filters.kujaDosham !== undefined || filters.manglik !== undefined) {
      const profileUserIds = profiles.map(p => (p.userId as any)?._id ?? p.userId);
      const astrologyQuery: Record<string, unknown> = { userId: { $in: profileUserIds } };
      if (filters.rasi?.length) astrologyQuery['rasi'] = { $in: filters.rasi };
      if (filters.nakshatra?.length) astrologyQuery['nakshatram'] = { $in: filters.nakshatra };
      if (filters.kujaDosham !== undefined) astrologyQuery['doshams.kujaDosham'] = filters.kujaDosham;
      if (filters.manglik !== undefined) astrologyQuery['doshams.manglik'] = filters.manglik;

      const astroMatches = await AstrologyModel.find(astrologyQuery, { userId: 1 }).lean();
      const astroUserIds = new Set(astroMatches.map(a => String(a.userId)));
      results = profiles.filter(p => astroUserIds.has(String((p.userId as any)?._id ?? p.userId)));
    }

    return {
      results,
      total,
      pagination: buildPagination(page, limit, total),
    };
  }
}

export const searchService = new SearchService();
