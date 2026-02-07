import { IsString, MinLength, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '@peerflow/shared';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
