import { TRole, TUser } from "./user";

interface IAuthResponse {
  user: TUser;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface ILoginRequest {
  email: string;
  password: string;
  two_fa_token?: string;
}

interface IRegisterRequest {
  email: string;
  password: string;
  role?: TRole;
}

interface IRefreshTokenRequest {
  refresh_token: string;
}

interface IChangePasswordRequest {
  current_password: string;
  new_password: string;
}

interface IAuthState {
  user: TUser | undefined;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface ITwoFARequiredResponse {
  error: string;
  requires_2fa: boolean;
}

export type {
  IAuthResponse,
  ILoginRequest,
  IRegisterRequest,
  IRefreshTokenRequest,
  IChangePasswordRequest,
  IAuthState,
  ITwoFARequiredResponse,
};
