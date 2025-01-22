import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { isValidObjectId, Model } from "mongoose";
import { User } from "./entities/user.entity";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = await this.userModel.create(createUserDto);

      return user;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(
          `User already exists ${JSON.stringify(error.keyValue)}`,
        );
      }
      console.log(error);
      throw new InternalServerErrorException(
        `Error creating user - Check server logs`,
      );
    }
  }

  findAll() {
    return `This action returns all users`;
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

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
