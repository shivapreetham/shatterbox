import { z } from 'zod';

export const usernameValidation = z
  .string()
  .min(2, 'Username must be at least 2 characters')
  .max(20, 'Username must be no more than 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username must not contain special characters');


export const signUpSchema = z.object({
  username: usernameValidation,
  email: z.string()
  .email()
  .regex(/^[A-Za-z0-9]+@nitjsr\.ac\.in$/, {
    message: "Please fill a valid email address (ending with @nitjsr.ac.in)",
  }),
  
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
});