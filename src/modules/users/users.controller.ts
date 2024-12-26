import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.schema';
import { CreateUserDto } from './dtos/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usuariosService: UsersService) {}

  @Post('register')
  async registerUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.usuariosService.createUser(createUserDto.email, createUserDto.username, createUserDto.password);
  }

  @Get()
  async getAllUsers(): Promise<User[]> {
    return await this.usuariosService.getAllUsers();
  }

  @Get(':email')
  async getUserByEmail(@Param('email') email: string): Promise<User | null> {
    return await this.usuariosService.findUserByEmail(email);
  }
}
