import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserRole } from '@peerflow/shared';
import { UserEntity } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Admin endpoints
  @Get()
  @Roles(UserRole.ADMIN)
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map((u) => this.usersService.toDto(u));
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return this.usersService.toDto(user);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.update(id, dto);
    return this.usersService.toDto(user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async delete(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserEntity,
  ) {
    if (id === currentUser.id) {
      throw new ForbiddenException('Cannot delete your own account');
    }
    await this.usersService.delete(id);
    return { message: 'User deleted' };
  }

  // User self-service endpoints
  @Get('me')
  getProfile(@CurrentUser() user: UserEntity) {
    return this.usersService.toDto(user);
  }

  @Put('me')
  async updateProfile(
    @CurrentUser() user: UserEntity,
    @Body() dto: UpdateProfileDto,
  ) {
    const updated = await this.usersService.updateProfile(user.id, dto);
    return this.usersService.toDto(updated);
  }

  @Post('me/password')
  async changePassword(
    @CurrentUser() user: UserEntity,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(user.id, dto);
    return { message: 'Password changed successfully' };
  }
}
