import { UserLog } from './../user-logs/entities/user-log.entity';
import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import mongoose, { isValidObjectId, Model } from "mongoose";
import { User, UserDocument } from "./entities/user.entity";
import { InjectModel } from "@nestjs/mongoose";
import * as argon2 from "argon2";
import * as sanitizeHtml from "sanitize-html";
import { CalendarService } from "src/calendar/calendar.service";
import { GamificationProfileService } from "src/gamification-profile/gamification-profile.service";
import { UserLogsService } from 'src/user-logs/user-logs.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventsList } from 'src/events/list.events';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @Inject(EventEmitter2) private eventEmitter: EventEmitter2,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    try {
      createUserDto.username = sanitizeHtml(createUserDto.username);
      createUserDto.fullname = sanitizeHtml(createUserDto.fullname);
      createUserDto.email = sanitizeHtml(createUserDto.email);

      createUserDto.password = await argon2.hash(createUserDto.password);

      const user = await this.userModel.create(createUserDto);
      this.eventEmitter.emit(EventsList.USER_REGISTERED, {userId: user.id});
      
      // Return user without password
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
    return this.userModel.find()
  }

  async findOne(term: string) {
    let user: User | null = null;

    if (isValidObjectId(term)) {
      user = await this.userModel.findById(term)
    }

    if (!user) {
      user = await this.userModel.findOne({ email: term.trim() })
    }

    if (!user) {
      user = await this.userModel.findOne({ username: term.trim() })
    }

    return user;
  }

  async findOneByRefreshToken(refreshToken: string): Promise<User | null> {
    const user = await this.userModel.findOne({ refreshToken })
    return user ? user : null;
  }

  async validateRefreshToken(userId: mongoose.Types.ObjectId, token: string): Promise<boolean> {
    const user = await this.userModel.findById(userId)
    if (!user || !user.refreshToken) return false;
    return await argon2.verify(user.refreshToken, token);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    if (updateUserDto.updatedPassword) {
      if (!updateUserDto.password) {
        throw new BadRequestException("Password is required");
      }
      const user = await this.userModel.findById(id)
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
    }
    const user_new = await this.userModel.findByIdAndUpdate(id, updateUserDto, {
      new: true,
    })
    return user_new;
  }

  async remove(id: mongoose.Types.ObjectId) {
    const user = await this.userModel.findById(id);
    if (!isValidObjectId(id) || !user) {
      throw new BadRequestException("Invalid id or user not found");
    }
    await this.userModel.findByIdAndDelete(id);
    return user;
  }

  async updatePassword(email: string, hashedPassword: string) {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.password = hashedPassword;
      await user.save();
      
      return { message: 'Password updated successfully' };
    } catch (error) {
      this.logger.error(`Failed to update password: ${error.message}`);
      throw error;
    }
  }
}