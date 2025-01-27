import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { isValidObjectId, Model } from "mongoose";
import { User } from "./entities/user.entity";
import { InjectModel } from "@nestjs/mongoose";
import * as argon2 from "argon2";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const password = await argon2.hash(createUserDto.password); //argon2.verify(storedPass, candidatePass)
      createUserDto.password = password;
      const user = await this.userModel.create(createUserDto);

      return user;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(
          `User already exists ${JSON.stringify(error.keyValue)}`,
        );
      }
      throw new InternalServerErrorException(
        `Error creating user - Check server logs`,
      );
    }
  }

  findAll() {
    return this.userModel.find();
  }

  async findOne(term: string) {
    let user: User;

    if (!user && isValidObjectId(term)) {
      user = await this.userModel.findById(term);
    }

    if (!user) {
      user = await this.userModel.findOne({ username: term.trim() });
    }

    if (!user)
      throw new NotFoundException(`User with id or username not found`);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.new_password) {
      if (!updateUserDto.password) {
        throw new BadRequestException('Password is required');
      }
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const isValid = await argon2.verify(user.password, updateUserDto.password);
      if (!isValid) {
        throw new BadRequestException('Invalid password');
      }
      updateUserDto.password = await argon2.hash(updateUserDto.new_password);
      // delete updateUserDto.new_password;
    }
    const user_new = await this.userModel.findByIdAndUpdate(id, updateUserDto, {new: true});
    return user_new;
  }

  async remove(id: string){
    const user = await this.userModel.findById(id);
    if (!isValidObjectId(id) || !user) {
      throw new BadRequestException('Invalid id or user not found');
    }
    await this.userModel.findByIdAndDelete(id);
    return user;
  }
}