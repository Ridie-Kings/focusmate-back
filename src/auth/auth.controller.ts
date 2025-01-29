import { Controller, Post, Get, Body, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { LoginUserDto } from "src/users/dto/login-user.dto";
import { Throttle } from "@nestjs/throttler";
import { Response } from "express";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Máx. 5 intentos en 60 segundos
  @Post("login")
  async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    return this.authService.login(loginUserDto, res);
  }

  @Get("csrf-token")
  getCsrfToken(@Res() res: Response) {
    return this.authService.getCsrfToken(res);
  }
}
