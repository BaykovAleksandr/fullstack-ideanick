import * as dotenv from 'dotenv';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// Функция для поиска файла .env
const findEnvFilePath = (dir: string, pathPart: string): string | null => {
  const maybeEnvFilePath = path.join(dir, pathPart);
  if (fs.existsSync(maybeEnvFilePath)) {
    return maybeEnvFilePath;
  }
  if (dir === '/') {
    return null;
  }
  return findEnvFilePath(path.dirname(dir), pathPart);
};

// Загружаем переменные окружения из разных файлов
const webappEnvFilePath = findEnvFilePath(__dirname, 'webapp/.env');
if (webappEnvFilePath) {
  dotenv.config({ path: webappEnvFilePath, override: true });
  dotenv.config({
    path: `${webappEnvFilePath}.${process.env.NODE_ENV || 'development'}`,
    override: true,
  });
}

const backendEnvFilePath = findEnvFilePath(__dirname, 'backend/.env');
if (backendEnvFilePath) {
  dotenv.config({ path: backendEnvFilePath, override: true });
  dotenv.config({
    path: `${backendEnvFilePath}.${process.env.NODE_ENV || 'development'}`,
    override: true,
  });
}

// Также загружаем стандартный .env файл
dotenv.config();

const zNonemptyTrimmed = z.string().trim().min(1);
const zNonemptyTrimmedRequiredOnNotLocal = zNonemptyTrimmed.optional().refine(
  // eslint-disable-next-line node/no-process-env
  (val) => process.env.HOST_ENV === 'local' || !!val,
  'Required on local host'
);

const zEnv = z.object({
  PORT: zNonemptyTrimmed,
  HOST_ENV: z.enum(['local', 'production']),
  DATABASE_URL: zNonemptyTrimmed,
  JWT_SECRET: zNonemptyTrimmed,
  PASSWORD_SALT: zNonemptyTrimmed,
  INITIAL_ADMIN_PASSWORD: zNonemptyTrimmed,
  WEBAPP_URL: zNonemptyTrimmed,
  BREVO_API_KEY: zNonemptyTrimmedRequiredOnNotLocal,
  FROM_EMAIL_NAME: zNonemptyTrimmed,
  FROM_EMAIL_ADDRESS: zNonemptyTrimmed,
  DEBUG: z
    .string()
    .optional()
    .default('')
    .refine((val) => {
      const hostEnv = process.env.HOST_ENV;
      const nodeEnv = process.env.NODE_ENV;

      if (hostEnv === 'local') return true;

      if (nodeEnv === 'production') {
        return !!val && val.length > 0;
      }

      return true;
    }, 'Required on not local host on production'),
  CLOUDINARY_API_KEY: zNonemptyTrimmedRequiredOnNotLocal,
  CLOUDINARY_API_SECRET: zNonemptyTrimmedRequiredOnNotLocal,
  CLOUDINARY_CLOUD_NAME: zNonemptyTrimmed,
  // Добавляем NODE_ENV из коммита
  NODE_ENV: z.enum(['test', 'development', 'production']).optional().default('development'),
});

// eslint-disable-next-line node/no-process-env
export const env = zEnv.parse({
  // Сохраняем все существующие переменные
  ...process.env,
  // Устанавливаем NODE_ENV по умолчанию если не задан
  NODE_ENV: process.env.NODE_ENV || 'development',
});
