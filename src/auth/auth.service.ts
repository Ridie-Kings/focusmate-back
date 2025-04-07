import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "src/users/users.service";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { LoginUserDto } from "src/users/dto/login-user.dto";
import { Response } from "express";
import * as argon2 from "argon2";
import * as sanitizeHtml from "sanitize-html";
import { TokenBlacklistService } from "../token-black-list/token-black-list.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  async login(loginUserDto: LoginUserDto) {
    loginUserDto.email = sanitizeHtml(loginUserDto.email);
    const { email, password } = loginUserDto;
    const user = await this.usersService.findOne(email);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isValid = await argon2.verify(user.password, password);
    if (!isValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = { id: user._id, email: user.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: "15m" });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: "7d" });

    // ✅ Hashear el Refresh Token antes de guardarlo
    const hashedRefreshToken = await argon2.hash(refreshToken);

    await this.usersService.update(user._id.toString(), {
      refreshToken: hashedRefreshToken,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    // 🔍 Verificar si el token está en la blacklist antes de usarlo
    const isBlacklisted =
      await this.tokenBlacklistService.isBlacklisted(refreshToken);
    if (isBlacklisted) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const user = await this.usersService.findOneByRefreshToken(refreshToken);
    if (!user) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    // 🔹 Generar un nuevo access token
    const newAccessToken = this.jwtService.sign(
      { sub: user._id, email: user.email },
      { expiresIn: "15m" },
    );

    return { access_token: newAccessToken };
  }

  async logout(refreshToken: string, res: Response): Promise<void> {
    console.log("📌 Recibido refreshToken en logout:", refreshToken);

    const user = await this.usersService.findOneByRefreshToken(refreshToken);

    if (!user) {
      console.log("❌ Refresh token not found or invalid");
      throw new UnauthorizedException("Invalid refresh token");
    }

    console.log("✅ Usuario encontrado:", user.email);

    // 🔹 Agregar el refreshToken a la blacklist
    await this.tokenBlacklistService.addToBlacklist(refreshToken);
    console.log("✅ Refresh token agregado a la blacklist.");

    // 🔹 Eliminar el refreshToken de la base de datos
    await this.usersService.update(user._id.toString(), { refreshToken: null });

    console.log("✅ Refresh token eliminado correctamente.");

    // 🔹 **Eliminar las cookies en el cliente**
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    console.log("✅ Cookies eliminadas correctamente.");
  }
}