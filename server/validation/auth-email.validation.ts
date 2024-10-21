import { z } from 'zod';
import { validationMessages } from '~/utils/validation-utils';
import {
  DB_USER_NAME_LENGTH,
  DB_USER_PASSWORD_LENGTH,
} from '~/server/const/db.const';

export const newUserValidation = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(1)
    .min(DB_USER_PASSWORD_LENGTH.min, {
      message: validationMessages.minLength(
        'Password',
        DB_USER_PASSWORD_LENGTH.min,
      ),
    })
    .max(DB_USER_PASSWORD_LENGTH.max, {
      message: validationMessages.maxLength(
        'Password',
        DB_USER_PASSWORD_LENGTH.max,
      ),
    }),
  name: z
    .string()
    .min(1)
    .min(DB_USER_NAME_LENGTH.min, {
      message: validationMessages.minLength('Name', DB_USER_NAME_LENGTH.min),
    })
    .max(DB_USER_NAME_LENGTH.max, {
      message: validationMessages.maxLength('Name', DB_USER_NAME_LENGTH.max),
    }),
});
export type NewUserValidation = z.infer<typeof newUserValidation>;
