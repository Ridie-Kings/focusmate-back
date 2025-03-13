import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import mongoose, { isValidObjectId, Model } from "mongoose";
import { User } from "./entities/user.entity";
import { InjectModel } from "@nestjs/mongoose";
import * as argon2 from "argon2";
import * as sanitizeHtml from "sanitize-html";
import { UpdateProfileDto } from "./dto/updateProfileDto";

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
      createUserDto.fullname = sanitizeHtml(createUserDto.fullname);
      createUserDto.email = sanitizeHtml(createUserDto.email);

      // 🔹 Hashear la contraseña antes de guardarla
      createUserDto.password = await argon2.hash(createUserDto.password);

      const user = await this.userModel.create(createUserDto);
      return user;
    } catch (error) {
      console.error("❌ ERROR en create():", error);
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
    let user: User | null = null;

    if (isValidObjectId(term)) {
      user = await this.userModel.findById(term);
    }

    if (!user) {
      user = await this.userModel.findOne({ email: term.trim() });
    }

    if (!user) {
      user = await this.userModel.findOne({ username: term.trim() });
    }

    return user;
  }
  async findOneByRefreshToken(refreshToken: string): Promise<User | null> {
    const user = await this.userModel.findOne({ refreshToken });

    return user ? user : null;
  }

  // 🔹 Verificar refresh token
  async validateRefreshToken(userId: mongoose.Types.ObjectId, token: string): Promise<boolean> {
    const user = await this.userModel.findById(userId);
    if (!user || !user.refreshToken) return false;

    return await argon2.verify(user.refreshToken, token);
  }
  async update(id: mongoose.Types.ObjectId, updateUserDto: UpdateUserDto): Promise<User> {
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

  async getProfile(id: mongoose.Types.ObjectId) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    console.log("get profile");
    return user.profile;
  }

  async updateProfile(userId: mongoose.Types.ObjectId, updateData: UpdateProfileDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // 🔹 Actualiza solo los campos permitidos en `UpdateProfileDto`
    if (updateData.bio !== undefined) user.profile.bio = updateData.bio;
    if (updateData.avatar !== undefined)
      user.profile.avatar = updateData.avatar;
    // if (updateData.settings !== undefined)
    //   user.profile.settings = updateData.settings;

    await user.save();
    return { message: "Profile updated successfully", profile: user.profile };
  }

  async remove(id: mongoose.Types.ObjectId) {
    const user = await this.userModel.findById(id);
    if (!isValidObjectId(id) || !user) {
      throw new BadRequestException("Invalid id or user not found");
    }
    await this.userModel.findByIdAndDelete(id);
    return user;
  }
}