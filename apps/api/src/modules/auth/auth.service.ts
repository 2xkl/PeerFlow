import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserDto } from '@peerflow/shared';

export interface LoginResponse {
  accessToken: string;
  user: UserDto;
}

export interface SystemStatus {
  isSetupComplete: boolean;
  userCount: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponse> {
    const user = await this.usersService.findByUsername(dto.username);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await this.usersService.validatePassword(user, dto.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, username: user.username };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: this.usersService.toDto(user),
    };
  }

  async register(dto: RegisterDto): Promise<LoginResponse> {
    const userCount = await this.usersService.getUserCount();
    const isFirstUser = userCount === 0;

    const user = await this.usersService.create(dto, isFirstUser);

    const payload = { sub: user.id, username: user.username };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: this.usersService.toDto(user),
    };
  }

  async getSystemStatus(): Promise<SystemStatus> {
    const userCount = await this.usersService.getUserCount();
    return {
      isSetupComplete: userCount > 0,
      userCount,
    };
  }
}
