import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "./users.schema";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  // Crear un nuevo usuario
  async createUser(
    email: string,
    username: string,
    password: string,
  ): Promise<User> {
    const newUser = new this.userModel({ email, username, password });
    return await newUser.save();
  }

  // Obtener todos los usuarios
  async getAllUsers(): Promise<User[]> {
    return await this.userModel.find().exec();
  }

  // Buscar usuario por email
  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email }).exec();
  }
}
