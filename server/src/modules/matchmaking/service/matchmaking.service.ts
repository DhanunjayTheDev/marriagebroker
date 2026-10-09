import { Types } from 'mongoose';
import { UserModel } from '../../users/model/user.model';
import { ProfileModel, IProfile } from '../../profiles/model/profile.model';
import { AstrologyModel } from '../../astrology/model/astrology.model';
import { MatchModel } from '../model/match.model';
import { matchCache } from '../../../services/cache.service';
import { logger } from '../../../utils/logger';

interface MatchScore {
  total: number;
  breakdown: Record<string, number>;
  explanation: string;
}

export class MatchmakingService {
  private readonly WEIGHTS = {
    religion: 15,
    caste: 10,
    astrology: 15,
    education: 10,
    income: 10,
    family: 8,
    lifestyle: 8,
    interests: 7,
    personality: 7,
    location: 5,
    health: 3,
    assets: 2,
  };

  async generateMatches(userId: string, limit = 50): Promise<void> {
    const user = await UserModel.findById(userId).lean();
    if (!user) return;

    const userProfile = await ProfileModel.findOne({ userId }).lean();
    if (!userProfile) return;

    const userAstrology = await AstrologyModel.findOne({ userId }).lean();

    // Find candidates of opposite/preferred gender
    const targetGender = user.gender === 'male' ? 'female' : 'male';

    const candidates = await UserModel.find({
      _id: { $ne: userId },
      gender: targetGender,
      isDeleted: false,
      status: 'active',
      'profile.completionScore': { $gte: 40 },
    }, { _id: 1 }).limit(500).lean();

    const scores: Array<{ userId: string; score: MatchScore }> = [];

    for (const candidate of candidates) {
      const candidateProfile = await ProfileModel.findOne({ userId: candidate._id }).lean();
      if (!candidateProfile) continue;

      const candidateAstrology = await AstrologyModel.findOne({ userId: candidate._id }).lean();

      const score = this.calculateCompatibility(
        userProfile as any,
        candidateProfile as any,
        userAstrology,
        candidateAstrology
      );

      if (score.total >= 30) {
        scores.push({ userId: String(candidate._id), score });
      }
    }

    // Sort by score descending
    scores.sort((a, b) => b.score.total - a.score.total);
    const top = scores.slice(0, limit);

    // Upsert matches
    const ops = top.map((item, index) => ({
      updateOne: {
        filter: {
          userId: new Types.ObjectId(userId),
          matchedUserId: new Types.ObjectId(item.userId),
        },
        update: {
          $set: {
            userId: new Types.ObjectId(userId),
            matchedUserId: new Types.ObjectId(item.userId),
            score: item.score.total,
            breakdown: item.score.breakdown as any,
            explanation: item.score.explanation,
            rankPosition: index + 1,
            source: 'algorithm' as const,
            isExpired: false,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
        upsert: true,
      },
    }));

    if (ops.length > 0) {
      await MatchModel.bulkWrite(ops);
    }

    await matchCache.del(`matches:${userId}`);
    logger.info(`Generated ${top.length} matches for user ${userId}`);
  }

  calculateCompatibility(
    profile1: Partial<IProfile>,
    profile2: Partial<IProfile>,
    astro1?: any,
    astro2?: any
  ): MatchScore {
    let total = 0;
    const breakdown: Record<string, number> = {};
    const explanationParts: string[] = [];

    // Religion
    const religionScore = this.scoreReligion(profile1, profile2);
    breakdown.religion = religionScore;
    total += religionScore * (this.WEIGHTS.religion / 100);

    // Caste
    const casteScore = this.scoreCaste(profile1, profile2);
    breakdown.caste = casteScore;
    total += casteScore * (this.WEIGHTS.caste / 100);

    // Astrology
    const astrologyScore = astro1 && astro2 ? this.scoreAstrology(astro1, astro2) : 50;
    breakdown.astrology = astrologyScore;
    total += astrologyScore * (this.WEIGHTS.astrology / 100);

    // Education
    const educationScore = this.scoreEducation(profile1, profile2);
    breakdown.education = educationScore;
    total += educationScore * (this.WEIGHTS.education / 100);

    // Income compatibility
    const incomeScore = this.scoreIncome(profile1, profile2);
    breakdown.income = incomeScore;
    total += incomeScore * (this.WEIGHTS.income / 100);

    // Family
    const familyScore = this.scoreFamily(profile1, profile2);
    breakdown.family = familyScore;
    total += familyScore * (this.WEIGHTS.family / 100);

    // Lifestyle
    const lifestyleScore = this.scoreLifestyle(profile1, profile2);
    breakdown.lifestyle = lifestyleScore;
    total += lifestyleScore * (this.WEIGHTS.lifestyle / 100);

    // Interests overlap
    const interestsScore = this.scoreInterests(profile1, profile2);
    breakdown.interests = interestsScore;
    total += interestsScore * (this.WEIGHTS.interests / 100);

    // Personality
    const personalityScore = this.scorePersonality(profile1, profile2);
    breakdown.personality = personalityScore;
    total += personalityScore * (this.WEIGHTS.personality / 100);

    // Location
    const locationScore = this.scoreLocation(profile1, profile2);
    breakdown.location = locationScore;
    total += locationScore * (this.WEIGHTS.location / 100);

    // Normalize to 100
    const normalizedScore = Math.min(100, Math.round(total * 10));

    // Build explanation
    if (normalizedScore >= 80) explanationParts.push('Excellent compatibility');
    else if (normalizedScore >= 60) explanationParts.push('Good compatibility');
    else if (normalizedScore >= 40) explanationParts.push('Moderate compatibility');

    if (religionScore >= 80) explanationParts.push('Same religion and values');
    if (astrologyScore >= 75) explanationParts.push('Strong astrological match');
    if (lifestyleScore >= 80) explanationParts.push('Similar lifestyle preferences');

    return {
      total: normalizedScore,
      breakdown,
      explanation: explanationParts.join('. '),
    };
  }

  private scoreReligion(p1: Partial<IProfile>, p2: Partial<IProfile>): number {
    if (!p1.religion?.religion || !p2.religion?.religion) return 50;
    if (p1.religion.religion === p2.religion.religion) return 100;
    return 30;
  }

  private scoreCaste(p1: Partial<IProfile>, p2: Partial<IProfile>): number {
    if (!p1.religion?.caste || !p2.religion?.caste) return 50;
    if (p1.religion.caste === p2.religion.caste) {
      if (p1.religion.subCaste === p2.religion.subCaste) return 100;
      return 80;
    }
    return 20;
  }

  private scoreAstrology(a1: any, a2: any): number {
    let score = 50;

    // Nadi compatibility (critical  same nadi = bad match)
    if (a1.doshams?.nadiType && a2.doshams?.nadiType) {
      if (a1.doshams.nadiType === a2.doshams.nadiType) score -= 30;
      else score += 20;
    }

    // Kuja dosham compatibility
    if (a1.doshams?.kujaDosham === a2.doshams?.kujaDosham) score += 15;

    // Rasi compatibility (simplified)
    const rasiCompat: Record<string, string[]> = {
      Mesha: ['Simha', 'Dhanus', 'Mithuna', 'Kumbha'],
      Vrishabha: ['Kanya', 'Makara', 'Kataka', 'Meena'],
      Mithuna: ['Tula', 'Kumbha', 'Mesha', 'Simha'],
    };
    if (a1.rasi && a2.rasi && rasiCompat[a1.rasi]?.includes(a2.rasi)) {
      score += 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  private scoreEducation(p1: Partial<IProfile>, p2: Partial<IProfile>): number {
    const levels: Record<string, number> = {
      phd: 5, masters: 4, degree: 3, diploma: 2, school: 1, '': 0,
    };
    const l1 = levels[p1.education?.highestDegree?.toLowerCase() ?? ''] ?? 0;
    const l2 = levels[p2.education?.highestDegree?.toLowerCase() ?? ''] ?? 0;
    const diff = Math.abs(l1 - l2);
    if (diff === 0) return 100;
    if (diff === 1) return 75;
    if (diff === 2) return 50;
    return 25;
  }

  private scoreIncome(p1: Partial<IProfile>, p2: Partial<IProfile>): number {
    const i1 = p1.employment?.annualIncome ?? 0;
    const i2 = p2.employment?.annualIncome ?? 0;
    if (!i1 || !i2) return 50;
    const ratio = Math.min(i1, i2) / Math.max(i1, i2);
    return Math.round(ratio * 100);
  }

  private scoreFamily(p1: Partial<IProfile>, p2: Partial<IProfile>): number {
    let score = 50;
    if (p1.family?.familyType && p1.family.familyType === p2.family?.familyType) score += 25;
    if (p1.family?.familyValues && p1.family.familyValues === p2.family?.familyValues) score += 25;
    return Math.min(100, score);
  }

  private scoreLifestyle(p1: Partial<IProfile>, p2: Partial<IProfile>): number {
    let score = 0;
    let factors = 0;

    if (p1.lifestyle?.foodHabits && p2.lifestyle?.foodHabits) {
      score += p1.lifestyle.foodHabits === p2.lifestyle.foodHabits ? 100 : 40;
      factors++;
    }
    if (p1.lifestyle?.smokingHabit && p2.lifestyle?.smokingHabit) {
      score += p1.lifestyle.smokingHabit === p2.lifestyle.smokingHabit ? 100 : 30;
      factors++;
    }
    if (p1.lifestyle?.drinkingHabit && p2.lifestyle?.drinkingHabit) {
      score += p1.lifestyle.drinkingHabit === p2.lifestyle.drinkingHabit ? 100 : 30;
      factors++;
    }

    return factors > 0 ? Math.round(score / factors) : 50;
  }

  private scoreInterests(p1: Partial<IProfile>, p2: Partial<IProfile>): number {
    const i1 = new Set(p1.lifestyle?.interests ?? []);
    const i2 = new Set(p2.lifestyle?.interests ?? []);
    if (i1.size === 0 || i2.size === 0) return 50;
    const intersection = [...i1].filter(x => i2.has(x)).length;
    const union = new Set([...i1, ...i2]).size;
    return Math.round((intersection / union) * 100);
  }

  private scorePersonality(p1: Partial<IProfile>, p2: Partial<IProfile>): number {
    let score = 50;
    if (p1.personality?.introvertExtrovert && p2.personality?.introvertExtrovert) {
      if (p1.personality.introvertExtrovert === p2.personality.introvertExtrovert) score += 30;
      else if (
        (p1.personality.introvertExtrovert === 'introvert' && p2.personality.introvertExtrovert === 'extrovert') ||
        (p1.personality.introvertExtrovert === 'extrovert' && p2.personality.introvertExtrovert === 'introvert')
      ) score += 20;
    }
    if (p1.personality?.wantsChildren && p2.personality?.wantsChildren) {
      if (p1.personality.wantsChildren === p2.personality.wantsChildren) score += 20;
    }
    return Math.min(100, score);
  }

  private scoreLocation(p1: Partial<IProfile>, p2: Partial<IProfile>): number {
    if (p1.location?.city && p1.location.city === p2.location?.city) return 100;
    if (p1.location?.state && p1.location.state === p2.location?.state) return 70;
    if (p1.location?.country && p1.location.country === p2.location?.country) return 40;
    return 20;
  }
}

export const matchmakingService = new MatchmakingService();
