import { Schema, model, Document, Types } from 'mongoose';

export interface IProfile extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;

  // Personal
  personal: {
    height: number; // cm
    weight: number; // kg
    bloodGroup: string;
    complexion: string;
    bodyType: string;
    maritalStatus: string;
    children?: number;
    childrenLivingWith?: boolean;
    aboutMe: string;
    motherTongue: string;
    knownLanguages: string[];
    preferredLanguage: string;
  };

  // Religion & Caste
  religion: {
    religion: string;
    caste: string;
    subCaste: string;
    gotra: string;
    denomination: string;
  };

  // Location
  location: {
    country: string;
    state: string;
    city: string;
    pincode: string;
    isNRI: boolean;
    nriCountry?: string;
    nriState?: string;
    nriCity?: string;
    willingToRelocate: boolean;
    preferredLocations: string[];
  };

  // Education
  education: {
    highestDegree: string;
    fieldOfStudy: string;
    college: string;
    university: string;
    graduationYear?: number;
    additionalDegrees: Array<{
      degree: string;
      field: string;
      institution: string;
      year?: number;
    }>;
    certifications: string[];
  };

  // Employment
  employment: {
    employmentType: string;
    company: string;
    designation: string;
    industry: string;
    experienceYears: number;
    annualIncome: number;
    annualIncomeCurrency: string;
    workLocation: string;
    isIncomePrivate: boolean;
  };

  // Business
  business?: {
    businessName: string;
    businessCategory: string;
    annualTurnover?: number;
    employeeCount?: number;
    businessDescription?: string;
  };

  // Family
  family: {
    familyType: string;
    familyStatus: string;
    familyValues: string;
    familyIncome?: number;
    nativePlaceCity: string;
    nativePlaceState: string;
    nativePlaceCountry: string;
    fatherOccupation: string;
    fatherAlive: boolean;
    motherOccupation: string;
    motherAlive: boolean;
    brothers: number;
    brothersMarried: number;
    sisters: number;
    sistersMarried: number;
  };

  // Lifestyle
  lifestyle: {
    foodHabits: string;
    smokingHabit: string;
    drinkingHabit: string;
    religiousPractice: string;
    fitnessActivities: string[];
    hobbies: string[];
    interests: string[];
    travelPreference: string;
  };

  // Health
  health: {
    hasDisabilities: boolean;
    disabilities?: string[];
    hasDiabetes: boolean;
    hasBP: boolean;
    hasThyroid: boolean;
    hasAsthma: boolean;
    hasHeartCondition: boolean;
    otherConditions?: string;
    isHealthPrivate: boolean;
  };

  // Assets
  assets: {
    house: boolean;
    apartment: boolean;
    villa: boolean;
    agriculturalLand: boolean;
    commercialProperty: boolean;
    gold: boolean;
    stocks: boolean;
    mutualFunds: boolean;
    otherInvestments: boolean;
    vehicles: string[];
    estimatedNetWorth?: number;
    isAssetsPrivate: boolean;
  };

  // Personality
  personality: {
    introvertExtrovert: string;
    isFamilyOriented: boolean;
    isCareerOriented: boolean;
    wantsChildren: string;
    hasPets: boolean;
    petPreference: string;
    financialMindset: string;
    socialActivity: string;
    travelInterest: string;
  };

  // Partner Preferences
  partnerPreferences: {
    ageMin: number;
    ageMax: number;
    heightMin: number;
    heightMax: number;
    maritalStatus: string[];
    religion: string[];
    caste: string[];
    subCaste: string[];
    education: string[];
    profession: string[];
    annualIncomeMin?: number;
    annualIncomeMax?: number;
    complexion: string[];
    bodyType: string[];
    foodHabits: string[];
    smokingHabit: string;
    drinkingHabit: string;
    specialAbilities: string;
    preferredCountry: string[];
    preferredState: string[];
    preferredCity: string[];
    rasi: string[];
    nakshatra: string[];
    hasNRIPreference: boolean;
    nriPreferenceCountry: string[];
    preferenceNote: string;
  };

  // Photos
  photos: Array<{
    _id: Types.ObjectId;
    url: string;
    thumbnailUrl: string;
    isPrivate: boolean;
    isVerified: boolean;
    isMain: boolean;
    order: number;
    uploadedAt: Date;
  }>;

  // Documents (verification)
  documents: Array<{
    type: string;
    url: string;
    status: 'pending' | 'verified' | 'rejected';
    uploadedAt: Date;
  }>;

  // Scores
  completionScore: number;
  profileStrengthScore: number;
  aiMatchScore?: number;
  viewCount: number;

  // Slug for SEO
  slug: string;

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PhotoSchema = new Schema(
  {
    url: { type: String, required: true },
    thumbnailUrl: String,
    isPrivate: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isMain: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ProfileSchema = new Schema<IProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },

    personal: {
      height: { type: Number, min: 100, max: 250 },
      weight: { type: Number, min: 30, max: 300 },
      bloodGroup: String,
      complexion: { type: String, enum: ['very_fair', 'fair', 'wheatish', 'wheatish_brown', 'dark', ''] },
      bodyType: { type: String, enum: ['slim', 'athletic', 'average', 'heavy', ''] },
      maritalStatus: {
        type: String,
        enum: ['never_married', 'divorced', 'widowed', 'awaiting_divorce', 'annulled', ''],
        default: 'never_married',
      },
      children: Number,
      childrenLivingWith: Boolean,
      aboutMe: { type: String, maxlength: 2000 },
      motherTongue: String,
      knownLanguages: [String],
      preferredLanguage: String,
    },

    religion: {
      religion: String,
      caste: String,
      subCaste: String,
      gotra: String,
      denomination: String,
    },

    location: {
      country: { type: String, default: 'India' },
      state: String,
      city: String,
      pincode: String,
      isNRI: { type: Boolean, default: false },
      nriCountry: String,
      nriState: String,
      nriCity: String,
      willingToRelocate: { type: Boolean, default: false },
      preferredLocations: [String],
    },

    education: {
      highestDegree: String,
      fieldOfStudy: String,
      college: String,
      university: String,
      graduationYear: Number,
      additionalDegrees: [
        {
          degree: String,
          field: String,
          institution: String,
          year: Number,
        },
      ],
      certifications: [String],
    },

    employment: {
      employmentType: {
        type: String,
        enum: ['employed_private', 'employed_government', 'self_employed', 'business', 'not_working', 'student', 'retired', ''],
      },
      company: String,
      designation: String,
      industry: String,
      experienceYears: { type: Number, min: 0, max: 60 },
      annualIncome: { type: Number, min: 0 },
      annualIncomeCurrency: { type: String, default: 'INR' },
      workLocation: String,
      isIncomePrivate: { type: Boolean, default: false },
    },

    business: {
      businessName: String,
      businessCategory: String,
      annualTurnover: Number,
      employeeCount: Number,
      businessDescription: String,
    },

    family: {
      familyType: { type: String, enum: ['nuclear', 'joint', 'extended', ''] },
      familyStatus: { type: String, enum: ['middle_class', 'upper_middle_class', 'rich', 'affluent', ''] },
      familyValues: { type: String, enum: ['traditional', 'moderate', 'liberal', ''] },
      familyIncome: Number,
      nativePlaceCity: String,
      nativePlaceState: String,
      nativePlaceCountry: { type: String, default: 'India' },
      fatherOccupation: String,
      fatherAlive: { type: Boolean, default: true },
      motherOccupation: String,
      motherAlive: { type: Boolean, default: true },
      brothers: { type: Number, default: 0 },
      brothersMarried: { type: Number, default: 0 },
      sisters: { type: Number, default: 0 },
      sistersMarried: { type: Number, default: 0 },
    },

    lifestyle: {
      foodHabits: {
        type: String,
        enum: ['vegetarian', 'non_vegetarian', 'eggetarian', 'vegan', 'jain', 'occasionally_non_veg', ''],
      },
      smokingHabit: { type: String, enum: ['never', 'occasionally', 'regularly', ''] },
      drinkingHabit: { type: String, enum: ['never', 'occasionally', 'regularly', ''] },
      religiousPractice: { type: String, enum: ['very_religious', 'religious', 'moderate', 'not_religious', ''] },
      fitnessActivities: [String],
      hobbies: [String],
      interests: [String],
      travelPreference: { type: String, enum: ['love_travel', 'occasional', 'rare', ''] },
    },

    health: {
      hasDisabilities: { type: Boolean, default: false },
      disabilities: [String],
      hasDiabetes: { type: Boolean, default: false },
      hasBP: { type: Boolean, default: false },
      hasThyroid: { type: Boolean, default: false },
      hasAsthma: { type: Boolean, default: false },
      hasHeartCondition: { type: Boolean, default: false },
      otherConditions: String,
      isHealthPrivate: { type: Boolean, default: false },
    },

    assets: {
      house: { type: Boolean, default: false },
      apartment: { type: Boolean, default: false },
      villa: { type: Boolean, default: false },
      agriculturalLand: { type: Boolean, default: false },
      commercialProperty: { type: Boolean, default: false },
      gold: { type: Boolean, default: false },
      stocks: { type: Boolean, default: false },
      mutualFunds: { type: Boolean, default: false },
      otherInvestments: { type: Boolean, default: false },
      vehicles: [String],
      estimatedNetWorth: Number,
      isAssetsPrivate: { type: Boolean, default: false },
    },

    personality: {
      introvertExtrovert: { type: String, enum: ['introvert', 'extrovert', 'ambivert', ''] },
      isFamilyOriented: { type: Boolean, default: true },
      isCareerOriented: { type: Boolean, default: true },
      wantsChildren: { type: String, enum: ['yes', 'no', 'open', 'already_have', ''] },
      hasPets: { type: Boolean, default: false },
      petPreference: String,
      financialMindset: { type: String, enum: ['saver', 'spender', 'balanced', ''] },
      socialActivity: { type: String, enum: ['very_social', 'moderate', 'prefer_small_gatherings', 'homebody', ''] },
      travelInterest: { type: String, enum: ['frequent', 'occasional', 'rare', ''] },
    },

    partnerPreferences: {
      ageMin: { type: Number, default: 21 },
      ageMax: { type: Number, default: 35 },
      heightMin: { type: Number, default: 150 },
      heightMax: { type: Number, default: 200 },
      maritalStatus: [String],
      religion: [String],
      caste: [String],
      subCaste: [String],
      education: [String],
      profession: [String],
      annualIncomeMin: Number,
      annualIncomeMax: Number,
      complexion: [String],
      bodyType: [String],
      foodHabits: [String],
      smokingHabit: { type: String, default: 'never' },
      drinkingHabit: { type: String, default: 'never' },
      specialAbilities: String,
      preferredCountry: [String],
      preferredState: [String],
      preferredCity: [String],
      rasi: [String],
      nakshatra: [String],
      hasNRIPreference: { type: Boolean, default: false },
      nriPreferenceCountry: [String],
      preferenceNote: { type: String, maxlength: 1000 },
    },

    photos: [PhotoSchema],

    documents: [
      {
        type: { type: String },
        url: String,
        status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    completionScore: { type: Number, default: 0, min: 0, max: 100 },
    profileStrengthScore: { type: Number, default: 0, min: 0, max: 100 },
    aiMatchScore: Number,
    viewCount: { type: Number, default: 0 },
    slug: { type: String, unique: true, sparse: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// Search indexes (userId already indexed via field unique: true)
ProfileSchema.index({ 'religion.religion': 1, 'religion.caste': 1 });
ProfileSchema.index({ 'location.state': 1, 'location.city': 1 });
ProfileSchema.index({ 'employment.annualIncome': 1 });
ProfileSchema.index({ 'personal.maritalStatus': 1 });
ProfileSchema.index({ completionScore: -1 });
ProfileSchema.index({ viewCount: -1 });
ProfileSchema.index({ isActive: 1, completionScore: -1 });

// Full-text search
ProfileSchema.index({ 'personal.aboutMe': 'text', 'education.college': 'text', 'employment.company': 'text' });

export const ProfileModel = model<IProfile>('Profile', ProfileSchema);
