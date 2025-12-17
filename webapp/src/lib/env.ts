import { z } from 'zod';

export const zEnv = z.object({
  NODE_ENV: z.enum(['development', 'production']),
  VITE_BACKEND_TRPC_URL: z.string().trim().min(1),
  VITE_WEBAPP_URL: z.string().trim().min(1),
  VITE_CLOUDINARY_CLOUD_NAME: z.string().trim().min(1)
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const envFromBackend = (window as any).webappEnvFromBackend;

export const env = zEnv.parse(envFromBackend?.replaceMeWithPublicEnv ? process.env : envFromBackend);
