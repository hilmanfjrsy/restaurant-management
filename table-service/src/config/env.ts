import dotenv from 'dotenv';

dotenv.config();

interface IEnv {
  PORT: number;
  DATABASE_USERNAME: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_USE_SSL: boolean;
  EVENT_USERNAME: string;
  EVENT_PASSWORD: string;
  EVENT_HOST: string;
  EVENT_PORT: number;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;
  NODE_ENV: 'development' | 'production' | 'test';
  API_KEY: string;
}

export const ENV: IEnv = {
  PORT: parseInt(getEnv('PORT', '3000')),
  DATABASE_USERNAME: getEnv('DATABASE_USERNAME', 'postgres'),
  DATABASE_PASSWORD: getEnv('DATABASE_PASSWORD', 'password'),
  DATABASE_NAME: getEnv('DATABASE_NAME', 'postgres'),
  DATABASE_HOST: getEnv('DATABASE_HOST', 'localhost'),
  DATABASE_PORT: parseInt(getEnv('DATABASE_PORT', '5432')),
  DATABASE_USE_SSL: getEnv('DATABASE_USE_SSL', 'false').toLowerCase() === 'true',
  EVENT_HOST: getEnv('EVENT_HOST', 'localhost'),
  EVENT_PORT: parseInt(getEnv('EVENT_PORT', '5672')),
  EVENT_USERNAME: getEnv('EVENT_USERNAME', 'guest'),
  EVENT_PASSWORD: getEnv('EVENT_PASSWORD', 'guest'),
  REDIS_HOST: getEnv('REDIS_HOST', 'localhost'),
  REDIS_PORT: parseInt(getEnv('REDIS_PORT', '6379')),
  REDIS_PASSWORD: getEnv('REDIS_PASSWORD', ''),
  NODE_ENV: getEnv('NODE_ENV', 'development') as 'development' | 'production' | 'test',
  API_KEY: getEnv('API_KEY', 'secret-api-key'),
};

export function getEnv(variable: string, defaultValue?: string): string {
  const value = process.env[variable];
  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`Environment variable ${variable} is not set`);
    }
    return defaultValue;
  }
  return value;
}