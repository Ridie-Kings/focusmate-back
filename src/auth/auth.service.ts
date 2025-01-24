import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  


  /*
  TODO: Implement the following methods:
  login
  logout
  */
}
