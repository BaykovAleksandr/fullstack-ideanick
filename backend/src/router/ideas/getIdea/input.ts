
import { z } from 'zod';

export const zGetIdeaTrpcInput = z.object({
  ideaNick: z
    .string()
    .min(1)
    .regex(/^[a-zA-Z0-9-]+$/, 'Nick may contain only lowercase letters, numbers and dashes'),
  name: z.string().max(50).default(''),
});
