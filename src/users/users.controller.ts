import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Request,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ParseMongoIdPipe } from "src/common/pipes/parse-mongo-id.pipe";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import mongoose from "mongoose";
import { User } from "./entities/user.entity";
import { GetUser } from "./decorators/get-user.decorator";

@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: "Create a new user" })
  @ApiResponse({ status: 201, description: "User successfully created" })
  @ApiResponse({ status: 400, description: "Invalid data provided" })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: "Retrieve all users" })
  @ApiResponse({
    status: 200,
    description: "List of users successfully retrieved",
  })
  async findAll(): Promise<UserDocument[]> {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get("@me")
  @ApiOperation({ summary: "Retrieve the authenticated user" })
  @ApiResponse({ status: 200, description: "User found successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  async findMe(@Request() res): Promise<User> {
    const token = res.headers["authorization"].split(" ")[1];
    const user = await this.usersService.findOneByRefreshToken(token);
    console.log("user: ", user);
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(":term")
  @ApiOperation({ summary: "Find a user by ID, email, or username" })
  @ApiResponse({ status: 200, description: "User found successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  async findOne(@Param("term") term: string): Promise<UserDocument> {
    return this.usersService.findOne(term);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a user by ID" })
  @ApiResponse({ status: 200, description: "User updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid data provided" })
  async update(
    @Param("id", ParseMongoIdPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a user by ID" })
  @ApiResponse({ status: 200, description: "User deleted successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  async remove(
    @Param("id", ParseMongoIdPipe) id: mongoose.Types.ObjectId,
  ): Promise<User> {
    return this.usersService.remove(id);
  }
}
