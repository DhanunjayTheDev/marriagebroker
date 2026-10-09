import { get, put, patch, upload, del } from './api';
import type { Profile, Astrology, ProfilePhoto } from '../types';

export const profileService = {
  getMyProfile: () => get<{ user: unknown; profile: Profile; astrology: Astrology }>('/profiles/me'),
  getProfile: (userId: string) => get<{ user: unknown; profile: Profile; astrology: Astrology }>(`/profiles/${userId}`),

  updateProfile: (data: Partial<Profile>) => put<Profile>('/profiles/me', data),
  updatePartnerPreferences: (data: unknown) => put('/profiles/me/partner-preferences', data),
  updatePrivacy: (data: unknown) => put('/profiles/me/privacy', data),
  toggleIncognito: () => patch('/profiles/me/incognito'),

  // Photos
  uploadPhotos: (files: File[], onProgress?: (p: number) => void) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('photos', f));
    return upload<ProfilePhoto[]>('/profiles/me/photos', formData, onProgress);
  },
  deletePhoto: (photoId: string) => del(`/profiles/me/photos/${photoId}`),
  setMainPhoto: (photoId: string) => patch(`/profiles/me/photos/${photoId}/main`),

  // Astrology
  getAstrology: () => get<Astrology>('/astrology/me'),
  updateAstrology: (data: Partial<Astrology>) => put<Astrology>('/astrology/me', data),
  getCompatibility: (userId2: string) => get<{ score: number; details: unknown }>(`/astrology/compatibility/${userId2}`),

  // Horoscope upload
  uploadHoroscope: (file: File, onProgress?: (p: number) => void) => {
    const formData = new FormData();
    formData.append('horoscope', file);
    return upload('/profiles/me/photos', formData, onProgress);
  },
};
