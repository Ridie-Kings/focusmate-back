import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "src/users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "default_secret",
    });
  }

async validate(payload: any) {
  console.log("📌 Payload recibido en validate:", payload);

  const user = await this.usersService.findOne(payload.sub);
  console.log("📌 Usuario encontrado en DB:", user);

  if (!user) {
    throw new UnauthorizedException("User not found in database");
  }

  return { _id: user._id.toString(), email: user.email }; // ✅ Asegura que `_id` es string
}}
