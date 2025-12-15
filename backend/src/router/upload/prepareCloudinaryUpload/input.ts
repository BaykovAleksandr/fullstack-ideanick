import { cloudinaryUploadTypes } from '../../../../../shared/src/cloudinary';
import { getKeysAsArray } from '../../../../../shared/src/getKeysAsArray';
import { z } from 'zod';

export const zPrepareCloudinaryUploadTrpcInput = z.object({
  type: z.enum(getKeysAsArray(cloudinaryUploadTypes)),
});
