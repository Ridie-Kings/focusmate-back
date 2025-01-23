import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.usersService.findOne(term);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id')
  updateWithPassword(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Body('password') password: string) {
    return this.usersService.updateWithPassword(id, updateUserDto, password);
  }

  @Delete(':id') // PREGUNTAR AL CAPI - 
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.usersService.remove(id);
  }
}
