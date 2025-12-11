import { z } from 'zod';

export const zEnv = z.object({
  NODE_ENV: z.enum(['development', 'production']),
  VITE_BACKEND_TRPC_URL: z.string().trim().min(1),
  VITE_WEBAPP_URL: z.string().trim().min(1),
  VITE_CLOUDINARY_CLOUD_NAME: z.string().trim().min(1)
});


export const env = zEnv.parse(process.env)
