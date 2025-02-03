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
import {sanitizeHtml} from "sanitize-html";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // 🔹 Sanitizar los inputs antes de guardarlos
      createUserDto.username = sanitizeHtml(createUserDto.username);
      createUserDto.name = sanitizeHtml(createUserDto.name);
      createUserDto.email = sanitizeHtml(createUserDto.email);

      // 🔹 Hashear la contraseña antes de guardarla
      createUserDto.password = await argon2.hash(createUserDto.password);

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

  async findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findOne(term: string): Promise<User> {
    let user: User;

    if (!user && isValidObjectId(term)) {
      user = await this.userModel.findById(term);
    }
    if (!user) {
      user = await this.userModel.findOne({ email: term.trim() });
    }

    if (!user) {
      user = await this.userModel.findOne({ username: term.trim() });
    }

    if (!user)
      throw new NotFoundException(`User with id, email, or username not found`);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.updatedPassword) {
      if (!updateUserDto.password) {
        throw new BadRequestException("Password is required");
      }
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new NotFoundException("User not found");
      }
      const isValid = await argon2.verify(
        user.password,
        updateUserDto.password,
      );
      if (!isValid) {
        throw new BadRequestException("Invalid password");
      }
      updateUserDto.password = await argon2.hash(updateUserDto.updatedPassword);
      // delete updateUserDto.updatedPassword;
    }
    const user_new = await this.userModel.findByIdAndUpdate(id, updateUserDto, {
      new: true,
    });
    return user_new;
  }

  async remove(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!isValidObjectId(id) || !user) {
      throw new BadRequestException("Invalid id or user not found");
    }
    await this.userModel.findByIdAndDelete(id);
    return user;
  }
}
