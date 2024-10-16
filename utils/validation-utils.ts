export const validationMessages = {
  minLength(name: string, length: number) {
    return `${name} must be atleast ${length} characters`;
  },
  maxLength(name: string, length: number) {
    return `${name} must less than ${length} characters`;
  },
};
