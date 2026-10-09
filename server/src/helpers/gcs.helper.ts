import { Storage, File } from '@google-cloud/storage';
import sharp from 'sharp';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';
import { ErrorCode } from '../constants';

let gcsStorage: Storage;

const getStorage = (): Storage => {
  if (!gcsStorage) {
    gcsStorage = new Storage({
      projectId: env.GCS_PROJECT_ID,
      keyFilename: env.GCS_KEY_FILE_PATH || undefined,
    });
  }
  return gcsStorage;
};

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const ALLOWED_DOC_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

export type UploadFolder =
  | 'photos'
  | 'videos'
  | 'voice_notes'
  | 'documents'
  | 'verification'
  | 'marketplace'
  | 'success_stories'
  | 'chat_media'
  | 'horoscopes'
  | 'thumbnails';

export interface UploadResult {
  url: string;
  signedUrl?: string;
  filename: string;
  size: number;
  mimeType: string;
  bucket: string;
  path: string;
}

export const uploadBuffer = async (
  buffer: Buffer,
  mimeType: string,
  folder: UploadFolder,
  userId: string,
  isPrivate = false,
  options?: { resize?: { width: number; height: number }; quality?: number }
): Promise<UploadResult> => {
  const storage = getStorage();
  const bucketName = isPrivate ? env.GCS_PRIVATE_BUCKET : env.GCS_PUBLIC_BUCKET;
  const bucket = storage.bucket(bucketName);

  let processedBuffer = buffer;
  let finalMimeType = mimeType;

  // Process images resize, convert to WebP for optimization
  if (ALLOWED_IMAGE_TYPES.includes(mimeType) && folder !== 'documents' && folder !== 'verification') {
    let transformer = sharp(buffer).withMetadata();
    if (options?.resize) {
      transformer = transformer.resize(options.resize.width, options.resize.height, {
        fit: 'cover',
        withoutEnlargement: true,
      });
    }
    transformer = transformer.webp({ quality: options?.quality ?? 85 });
    processedBuffer = await transformer.toBuffer();
    finalMimeType = 'image/webp';
  }

  const ext = finalMimeType.split('/')[1] ?? 'bin';
  const filename = `${uuidv4()}.${ext === 'webp' ? 'webp' : ext}`;
  const filePath = `${folder}/${userId}/${filename}`;

  const file: File = bucket.file(filePath);

  await file.save(processedBuffer, {
    metadata: {
      contentType: finalMimeType,
      cacheControl: isPrivate ? 'no-store' : 'public, max-age=31536000',
      metadata: { userId, folder, uploadedAt: new Date().toISOString() },
    },
    public: !isPrivate,
    resumable: processedBuffer.length > 5 * 1024 * 1024,
  });

  const url = isPrivate
    ? `gs://${bucketName}/${filePath}`
    : `${env.GCS_CDN_URL || `https://storage.googleapis.com/${bucketName}`}/${filePath}`;

  logger.debug('File uploaded to GCS', { bucket: bucketName, path: filePath, size: processedBuffer.length });

  return {
    url,
    filename,
    size: processedBuffer.length,
    mimeType: finalMimeType,
    bucket: bucketName,
    path: filePath,
  };
};

export const getSignedUrl = async (
  bucketName: string,
  filePath: string,
  expiresInMinutes = 60
): Promise<string> => {
  const storage = getStorage();
  const [url] = await storage.bucket(bucketName).file(filePath).getSignedUrl({
    action: 'read',
    expires: Date.now() + expiresInMinutes * 60 * 1000,
  });
  return url;
};

export const deleteFile = async (bucketName: string, filePath: string): Promise<void> => {
  try {
    const storage = getStorage();
    await storage.bucket(bucketName).file(filePath).delete();
    logger.debug('File deleted from GCS', { bucket: bucketName, path: filePath });
  } catch (error) {
    logger.warn('GCS delete failed', { error, filePath });
  }
};

export const generateThumbnail = async (
  buffer: Buffer,
  userId: string
): Promise<UploadResult> => {
  const thumbBuffer = await sharp(buffer)
    .resize(200, 200, { fit: 'cover' })
    .webp({ quality: 70 })
    .toBuffer();

  return uploadBuffer(thumbBuffer, 'image/webp', 'thumbnails', userId, false);
};

export const validateFileType = (mimeType: string, category: 'image' | 'video' | 'document'): void => {
  const allowed = {
    image: ALLOWED_IMAGE_TYPES,
    video: ALLOWED_VIDEO_TYPES,
    document: ALLOWED_DOC_TYPES,
  }[category];

  if (!allowed.includes(mimeType)) {
    throw new AppError(
      ErrorCode.FILE_TYPE_NOT_ALLOWED,
      `File type ${mimeType} not allowed for ${category}`,
      400
    );
  }
};
