export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface UserDto {
  id: string;
  username: string;
  email: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

// Auth request/response types
export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
  user: UserDto;
}

export interface RegisterRequestDto {
  username: string;
  password: string;
  email?: string;
}

export interface ChangePasswordRequestDto {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequestDto {
  email?: string;
  username?: string;
}

export interface CreateUserRequestDto {
  username: string;
  password: string;
  email?: string;
  role?: UserRole;
}

export interface UpdateUserRequestDto {
  email?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface SystemStatusDto {
  isSetupComplete: boolean;
  userCount: number;
}
