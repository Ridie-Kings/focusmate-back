import {
  Controller,
  Post,
  Req,
  Res,
  Body,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Public } from "./decorators/public.decorator";
import { Request, Response } from "express";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CreateUserDto, LoginUserDto } from "src/users/dto";

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

  @Public()
  @Post("login")
  async login(@Body() loginUserDto: LoginUserDto) {
    const { access_token, refresh_token } =
      await this.authService.login(loginUserDto);
    return {
      message: "User authenticated successfully",
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresIn: "12h",
    };
  }

  @ApiOperation({ summary: "Login with an existing user" })
  @ApiResponse({ status: 200, description: "User authenticated successfully" })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid credentials",
  })
  @Public()
  @Post("refresh")
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) throw new UnauthorizedException("Refresh token missing");

    const { access_token } = await this.authService.refreshToken(refreshToken);

    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 min
    });

    return res.json({ message: "Token refreshed" });
  }

  @Public()
  @Post("logout")
  async logout(@Req() req: Request & { cookies: any }, @Res() res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken)
      throw new UnauthorizedException("No refresh token found");

    await this.authService.logout(refreshToken, res);

    return res.json({ message: "Logged out successfully" });
  }
}
