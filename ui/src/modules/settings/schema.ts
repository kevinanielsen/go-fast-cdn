import z from "zod";

const twoFaFormSchema = z.object({
  twoFaEnable: z.boolean(),
});
const emailFormSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z.string().min(6, "New password is required"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
  });
const twoFaSetupSchema = z.object({
  twoFACode: z.string().length(6, "2FA code must be 6 digits"),
});

export {
  twoFaFormSchema,
  emailFormSchema,
  passwordFormSchema,
  twoFaSetupSchema,
};
