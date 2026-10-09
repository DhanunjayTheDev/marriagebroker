import { Schema, model, Document, Types } from 'mongoose';

export interface IAstrology extends Document {
  userId: Types.ObjectId;
  profileId: Types.ObjectId;

  birthDate: Date;
  birthTime?: string;
  birthPlace?: string;
  birthCity?: string;
  birthState?: string;
  birthCountry?: string;

  // South Indian astrology
  rasi: string;
  nakshatram: string;
  pada: number;
  lagnam: string;
  gothram: string;

  // Doshas
  doshams: {
    kujaDosham: boolean;
    kujaDoshamLevel?: string;
    manglik: boolean;
    nadiDosha: boolean;
    nadiType?: string;
    kaalSarpDosha: boolean;
    kaalSarpType?: string;
  };

  // Planetary
  moonSign: string;
  sunSign: string;

  // Horoscope document
  horoscopeUrl?: string;
  isHoroscopeVerified: boolean;
  isHoroscopePrivate: boolean;

  // Compatibility caching
  compatibilityCache: Map<string, number>;

  createdAt: Date;
  updatedAt: Date;
}

const AstrologySchema = new Schema<IAstrology>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    profileId: { type: Schema.Types.ObjectId, ref: 'Profile', index: true },

    birthDate: Date,
    birthTime: String,
    birthPlace: String,
    birthCity: String,
    birthState: String,
    birthCountry: { type: String, default: 'India' },

    rasi: {
      type: String,
      enum: [
        'Mesha', 'Vrishabha', 'Mithuna', 'Kataka', 'Simha', 'Kanya',
        'Tula', 'Vrishchika', 'Dhanus', 'Makara', 'Kumbha', 'Meena', '',
      ],
    },
    nakshatram: {
      type: String,
      enum: [
        'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
        'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
        'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
        'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha',
        'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati', '',
      ],
    },
    pada: { type: Number, enum: [1, 2, 3, 4] },
    lagnam: String,
    gothram: String,

    doshams: {
      kujaDosham: { type: Boolean, default: false },
      kujaDoshamLevel: { type: String, enum: ['low', 'medium', 'high', ''] },
      manglik: { type: Boolean, default: false },
      nadiDosha: { type: Boolean, default: false },
      nadiType: { type: String, enum: ['aadi', 'madhya', 'anthya', ''] },
      kaalSarpDosha: { type: Boolean, default: false },
      kaalSarpType: String,
    },

    moonSign: String,
    sunSign: String,
    horoscopeUrl: String,
    isHoroscopeVerified: { type: Boolean, default: false },
    isHoroscopePrivate: { type: Boolean, default: false },

    compatibilityCache: { type: Map, of: Number, default: new Map() },
  },
  { timestamps: true }
);

AstrologySchema.index({ rasi: 1, nakshatram: 1 });
AstrologySchema.index({ 'doshams.kujaDosham': 1 });

export const AstrologyModel = model<IAstrology>('Astrology', AstrologySchema);
