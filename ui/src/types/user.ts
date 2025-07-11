import z from "zod";

// For create: password required
const userCreateFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["user", "admin"]),
});

// For edit: password optional
const userEditFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  role: z.enum(["user", "admin"]),
});

type TRole = "admin" | "user";
type TUser = {
  id: number;
  email: string;
  role: TRole;
  is_verified: boolean;
  created_at: string;
  last_login: string | null;
  is_2fa_enabled?: boolean;
};

type IUserResponse = TUser;

type IUserCreateRequest = z.infer<typeof userCreateFormSchema>;
type IUserEditRequest = z.infer<typeof userEditFormSchema>;

export type {
  TUser,
  IUserResponse,
  IUserCreateRequest,
  IUserEditRequest,
  TRole,
};
export { userCreateFormSchema, userEditFormSchema };
