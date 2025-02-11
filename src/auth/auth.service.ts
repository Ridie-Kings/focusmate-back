import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "src/users/users.service";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { LoginUserDto } from "src/users/dto/login-user.dto";
import * as argon2 from "argon2";
import * as sanitizeHtml from "sanitize-html"

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
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

    const payload = { sub: user._id, email: user.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: "12h" });
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
  async validateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<boolean> {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.refreshToken) return false;

    return await argon2.verify(user.refreshToken, refreshToken);
  }
}
