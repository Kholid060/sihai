import { newUserValidation } from '~/server/validation/auth-email.validation';

export default defineEventHandler(async (event) => {
  const newUser = await readValidatedBody(event, (body) =>
    newUserValidation.parse(body),
  );
  return newUser;
});
