import mongoose from 'mongoose';
import { env } from '../config';
import { logger } from '../utils/logger';

const mongooseOptions: mongoose.ConnectOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  heartbeatFrequencyMS: 10000,
  family: 4,
};

export const connectDatabase = async (): Promise<void> => {
  mongoose.set('strict', true);
  mongoose.set('strictQuery', false);

  mongoose.connection.on('connecting', () => logger.debug('MongoDB connecting...'));
  mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
  mongoose.connection.on('disconnecting', () => logger.warn('MongoDB disconnecting'));
  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected  reconnecting...');
    setTimeout(() => connectDatabase(), 5000);
  });
  mongoose.connection.on('error', (err: Error) =>
    logger.error('MongoDB error', { error: err.message })
  );

  await mongoose.connect(env.MONGODB_URI, mongooseOptions);
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
};

export const getDbStatus = (): 'connected' | 'disconnected' | 'connecting' => {
  const states: Record<number, 'connected' | 'disconnected' | 'connecting'> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnected',
  };
  return states[mongoose.connection.readyState] ?? 'disconnected';
};
