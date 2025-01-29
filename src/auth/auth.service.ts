import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "src/users/users.service";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { LoginUserDto } from "src/users/dto/login-user.dto";
import * as argon2 from "argon2";
import { doubleCsrf } from "csrf-csrf";
import { Response } from "express";

@Injectable()
export class AuthService {
  private readonly generateToken;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {
    const { generateToken } = doubleCsrf({
      getSecret: () => process.env.CSRF_SECRET || "default_secret",
      cookieName: "XSRF-TOKEN",
    });
    this.generateToken = generateToken;
  }

  async register(createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  async login(loginUserDto: LoginUserDto, res: Response) {
    console.log("Login request received:", loginUserDto);

    const { email, password } = loginUserDto;
    const user = await this.usersService.findOne(email);

    if (!user) {
      console.log("User not found:", email);
      throw new UnauthorizedException("Invalid credentials");
    }

    const isValid = await argon2.verify(user.password, password);
    if (!isValid) {
      console.log("Invalid password for user:", email);
      throw new UnauthorizedException("Invalid credentials");
    }

    console.log("JWT_SECRET before signing token:", process.env.JWT_SECRET);

    const payload = { sub: user._id, email: user.email };

    // 🔹 Generar Access Token (expira en 12h)
    const accessToken = this.jwtService.sign(payload, { expiresIn: "12h" });

    // 🔹 Generar Refresh Token (expira en 7 días)
    const refreshToken = this.jwtService.sign(payload, { expiresIn: "7d" });

    // 🔹 Guardar Refresh Token en la base de datos
    await this.usersService.update(user._id.toString(), { refreshToken });

    // 🔹 Generar Token CSRF
    const csrfToken = this.generateToken(res);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      csrf_token: csrfToken,
    };
  }

  // 🔹 Nuevo método para generar el Token CSRF en un endpoint independiente
  getCsrfToken(res: Response) {
    const csrfToken = this.generateToken(res);
    res.json({ csrfToken });
  }
}
