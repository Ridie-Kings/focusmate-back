import {
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Public } from "./decorators/public.decorator";
import { Request, Response } from "express";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
