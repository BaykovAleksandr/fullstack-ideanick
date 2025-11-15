import { z } from 'zod';

export const zSignUpTrpcInput = z.object({
  nick: z
    .string()
    .min(1)
    .regex(/^[a-zA-Z0-9-]+$/, 'Nick may contain only letters, numbers and dashes'),
  password: z.string().min(1),
});
