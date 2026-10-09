import { CorsOptions } from 'cors';
import { env } from './index';

export const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) {
      // Allow non-browser clients (mobile apps, Postman, curl)
      return callback(null, true);
    }
    if (env.ALLOWED_ORIGINS.includes(origin) || env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    callback(new Error(`CORS: Origin "${origin}" not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Device-ID',
    'X-App-Version',
    'X-Platform',
    'Accept-Language',
    'X-Request-ID',
  ],
  exposedHeaders: ['X-Request-ID', 'X-Rate-Limit-Remaining'],
  maxAge: 86400,
  optionsSuccessStatus: 204,
};
