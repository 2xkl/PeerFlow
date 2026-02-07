import { IsEmail, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { UserRole } from '@peerflow/shared';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
