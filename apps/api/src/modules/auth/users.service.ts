import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from './entities/user.entity';
import { UserRole, UserDto } from '@peerflow/shared';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async create(dto: CreateUserDto, isFirstUser = false): Promise<UserEntity> {
    const existing = await this.userRepo.findOne({
      where: { username: dto.username },
    });
    if (existing) {
      throw new ConflictException('Username already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({
      username: dto.username,
      passwordHash,
      email: dto.email || null,
      role: isFirstUser ? UserRole.ADMIN : dto.role || UserRole.USER,
      isActive: true,
    });

    return this.userRepo.save(user);
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({
      where: { username },
      select: [
        'id',
        'username',
        'passwordHash',
        'email',
        'role',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async findAll(): Promise<UserEntity[]> {
    return this.userRepo.find({ order: { createdAt: 'DESC' } });
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<UserEntity> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.username && dto.username !== user.username) {
      const existing = await this.userRepo.findOne({
        where: { username: dto.username },
      });
      if (existing) {
        throw new ConflictException('Username already exists');
      }
    }

    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepo.findOne({
      where: { id },
      select: ['id', 'passwordHash'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new ConflictException('Current password is incorrect');
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.userRepo.save(user);
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepo.remove(user);
  }

  async getUserCount(): Promise<number> {
    return this.userRepo.count();
  }

  async validatePassword(user: UserEntity, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  toDto(user: UserEntity): UserDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
