import { Injectable, UnauthorizedException, InternalServerErrorException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "src/users/users.service";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { LoginUserDto } from "src/users/dto/login-user.dto";
import { Response } from "express";
import * as argon2 from "argon2";
import * as sanitizeHtml from "sanitize-html";
import { TokenBlacklistService } from "../token-black-list/token-black-list.service";
import { Logger } from "@nestjs/common";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  async login(loginUserDto: LoginUserDto) {
    try {
      this.logger.debug('Login attempt');
      
      loginUserDto.email = sanitizeHtml(loginUserDto.email);
      const { email, password } = loginUserDto;
      const user = await this.usersService.findOne(email);

      if (!user) {
        this.logger.warn(`Login failed: User not found - ${email}`);
        throw new UnauthorizedException("Invalid credentials");
      }

      const isValid = await argon2.verify(user.password, password);
      if (!isValid) {
        this.logger.warn(`Login failed: Invalid password for user - ${email}`);
        throw new UnauthorizedException("Invalid credentials");
      }

      const payload = { id: user._id, email: user.email };
      const accessToken = this.jwtService.sign(payload, { expiresIn: "15m" });
      const refreshToken = this.jwtService.sign(payload, { expiresIn: "7d" });

      // Store the unhashed refresh token in the database
      await this.usersService.update(user._id.toString(), {
        refreshToken: refreshToken,
      });

      this.logger.debug(`Login successful for user: ${email}`);

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (error) {
      this.logger.error(`Login error: ${error.message}`);
      throw error;
    }
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
    try {
      this.logger.debug(`Logout attempt with refresh token: ${refreshToken.substring(0, 10)}...`);

      if (!refreshToken) {
        this.logger.warn('Logout attempted without refresh token');
        throw new UnauthorizedException('Refresh token is required');
      }

      const user = await this.usersService.findOneByRefreshToken(refreshToken);

      if (!user) {
        this.logger.warn('Invalid refresh token used for logout');
        throw new UnauthorizedException('Invalid refresh token');
      }

      this.logger.debug(`User ${user.email} logging out`);

      // Add the refreshToken to the blacklist
      await this.tokenBlacklistService.addToBlacklist(refreshToken);
      this.logger.debug('Refresh token added to blacklist');

      // Remove the refreshToken from the database
      await this.usersService.update(user._id.toString(), { refreshToken: null });
      this.logger.debug('Refresh token removed from user record');

      // Clear cookies
      res.clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });
      
      res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });

      this.logger.debug('Cookies cleared successfully');
    } catch (error) {
      this.logger.error(`Logout failed: ${error.message}`);
      throw error instanceof UnauthorizedException 
        ? error 
        : new InternalServerErrorException('Error during logout');
    }
  }
}