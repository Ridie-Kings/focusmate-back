import { Controller, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { LoginUserDto } from "src/users/dto/login-user.dto";
import { Public } from "./decorators/public.decorator";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User registered successfully" })
  @ApiResponse({
    status: 400,
    description: "Bad Request - Invalid data provided",
  })
  @Public()
  @Post("register")
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @ApiOperation({ summary: "Login with an existing user" })
  @ApiResponse({ status: 200, description: "User authenticated successfully" })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid credentials",
  })
  @Public()
  @Post("login")
  async login(@Body() loginUserDto: LoginUserDto) {
    console.log("📌 Login endpoint alcanzado");
    return this.authService.login(loginUserDto);
  }
}
