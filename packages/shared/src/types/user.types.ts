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
