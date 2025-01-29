import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User>{
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':term')
  async findOne(@Param('term') term: string): Promise<User> {
    return this.usersService.findOne(term);
  }

  @Patch(':id')
  async update(@Param('id', ParseMongoIdPipe) id: string, @Body() updateUserDto: UpdateUserDto): Promise<User>{
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseMongoIdPipe) id: string): Promise<User> {
    return this.usersService.remove(id);
  }
}
