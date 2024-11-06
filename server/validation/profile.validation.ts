import { z } from 'zod';
import { newUserValidation } from './auth-email.validation';

export const updateProfileValidation = newUserValidation.pick({ name: true });
export type UpdateProfileValidation = z.infer<typeof updateProfileValidation>;

export const updateUserPasswordValidation = z.object({
  currentPassword: z.string().min(1),
  confirmPassword: z.string().min(1),
  newPassword: newUserValidation.shape.password,
});
export type UpdateUserPasswordValidation = z.infer<
  typeof updateUserPasswordValidation
>;
