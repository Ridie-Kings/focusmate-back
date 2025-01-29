import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Token desde el header Authorization
      ignoreExpiration: false, // No permitir tokens expirados
      secretOrKey: process.env.JWT_SECRET || "default_secret", // Clave secreta
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email }; // Retorna datos básicos del usuario
  }
}
