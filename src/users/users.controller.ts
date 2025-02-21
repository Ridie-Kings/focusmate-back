import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  NotFoundException,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ParseMongoIdPipe } from "src/common/pipes/parse-mongo-id.pipe";
import { RequestWithUser } from "src/auth/types/request-with-user";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { UpdateProfileDto } from "./dto/updateProfileDto";

@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: "Create a new user" })
  @ApiResponse({ status: 201, description: "User successfully created" })
  @ApiResponse({ status: 400, description: "Invalid data provided" })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: "Retrieve all users" })
  @ApiResponse({
    status: 200,
    description: "List of users successfully retrieved",
  })
  findAll() {
    return this.usersService.findAll();
  }
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(":term")
  @ApiOperation({ summary: "Find a user by ID, email, or username" })
  @ApiResponse({ status: 200, description: "User found successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  findOne(@Param("term") term: string) {
    return this.usersService.findOne(term);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth() // 📌 Requires JWT authentication
  @Get("profile")
  @ApiOperation({ summary: "Retrieve the authenticated user's profile" })
  @ApiResponse({
    status: 200,
    description: "User profile retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized access" })
  async getProfile(@Req() req: RequestWithUser) {
    console.log("📌 Executing getProfile()...");
    console.log("📌 req.user received in getProfile:", req.user);

    if (!req.user || !req.user._id) {
      console.log("❌ req.user._id is undefined or missing");
      throw new NotFoundException("User not authenticated");
    }

    console.log("📌 Searching for user with ID:", req.user._id);

    const user = await this.usersService.findOne(req.user._id);
    console.log("📌 User found in database:", user);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return {
      message: "User profile retrieved successfully",
      profile: user.profile || {}, // ✅ Prevents errors if `profile` is undefined
    };
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a user by ID" })
  @ApiResponse({ status: 200, description: "User updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid data provided" })
  update(
    @Param("id", ParseMongoIdPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch("profile")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Update the authenticated user's profile" })
  @ApiResponse({ status: 200, description: "Profile updated successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized access" })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(req.user._id, updateProfileDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a user by ID" })
  @ApiResponse({ status: 200, description: "User deleted successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  remove(@Param("id", ParseMongoIdPipe) id: string) {
    return this.usersService.remove(id);
  }
}