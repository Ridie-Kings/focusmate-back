import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { RequestWithUser } from "../interfaces/request-with-user.interface";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithUser = context.switchToHttp().getRequest();

    // 🚀 Permitir acceso a rutas públicas
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    );
    if (isPublic) {
      console.log("🚀 Permitiendo acceso sin autenticación:", request.url);
      return true;
    }

    console.log("📌 JwtAuthGuard ejecutándose...");

    // 🔍 Buscar el token en cookies primero
    const tokenFromCookies = request.cookies?.access_token;

    // 🔍 Si no está en las cookies, buscar en los headers
    const authHeader = request.headers.authorization;
    const tokenFromHeader = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    const token = tokenFromCookies || tokenFromHeader;

    if (!token) {
      console.log(
        "❌ No se encontró el token en los headers ni en las cookies",
      );
      throw new UnauthorizedException("Authorization token missing.");
    }

    try {
      const payload = this.jwtService.verify(token);
      console.log("📌 Payload del JWT:", payload);
      request.user = payload; // Ahora TypeScript reconoce 'user' en request
      return true;
    } catch (error) {
      console.log(`❌ Error al verificar el token (${error.message})`);
      throw new UnauthorizedException("Invalid or expired token.");
    }
  }
}