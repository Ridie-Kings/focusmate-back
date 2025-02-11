import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

 async canActivate(context: ExecutionContext): Promise<boolean> {
  const request = context.switchToHttp().getRequest();

  const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler());
  if (isPublic) {
    console.log("🚀 Permitiendo acceso sin autenticación:", request.url);
    return true;
  }

  console.log("📌 JwtAuthGuard ejecutándose...");

  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ No se encontró el token en los headers");
    throw new UnauthorizedException("Authorization token missing or malformed.");
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = this.jwtService.verify(token);
    console.log("📌 Payload del JWT:", payload);
    request.user = payload;
    return true;
  } catch (error) {
    console.log(`❌ Error al verificar el token (${error.message})`);
    throw new UnauthorizedException("Invalid or expired token.");
  }
}
}