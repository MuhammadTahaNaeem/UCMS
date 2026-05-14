import { z } from "zod";

const studentEmailPattern = /^[^\s@]+@student\.ntu\.edu\.pk$/i;
const staffEmailPattern = /^[^\s@]+@ntu\.edu\.pk$/i;
const strongPasswordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const studentEmailMessage = "Student email must end with @student.ntu.edu.pk.";
export const staffEmailMessage = "Staff/Admin email must end with @ntu.edu.pk.";
export const passwordMessage = "Password must be at least 8 characters and include letters, numbers, and symbols.";

export const isStudentEmail = (email) => studentEmailPattern.test(String(email || "").trim());
export const isStaffEmail = (email) => staffEmailPattern.test(String(email || "").trim());
export const isStrongPassword = (password) => strongPasswordPattern.test(String(password || ""));

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(3, "Full name must be at least 3 characters."),
    email: z.string().trim().refine(isStudentEmail, { message: studentEmailMessage }),
    password: z.string().refine(isStrongPassword, { message: passwordMessage }),
    confirmPassword: z.string().refine(isStrongPassword, { message: passwordMessage }),
    terms: z.boolean().refine((value) => value, {
      message: "You must accept the terms and conditions.",
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  rememberMe: z.boolean().default(false),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().refine(isStrongPassword, { message: passwordMessage }),
    confirmPassword: z.string().refine(isStrongPassword, { message: passwordMessage }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });
