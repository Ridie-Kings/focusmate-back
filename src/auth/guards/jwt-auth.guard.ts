import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { RequestWithUser } from "../interfaces/request-with-user.interface";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {
    super();
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const tokenFromCookies = request.cookies?.access_token;
    const authHeader = request.headers.authorization;
    const tokenFromHeader = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    return tokenFromCookies || tokenFromHeader;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.debug("🚀 Public route detected, allowing access");
      return true;
    }

    this.logger.debug("📌 JwtAuthGuard executing...");

    try {
      const request: RequestWithUser = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);
      
      if (!token) {
        this.logger.warn("❌ No token found in request");
        return false;
      }

      const payload = this.jwtService.verify<JwtPayload>(token);
      this.logger.debug("🔑 JWT Payload:", payload);
      request.user = payload;
      return true;
    } catch (error) {
      this.logger.error(`❌ Token verification error (${error.message})`);
      return false;
    }
  }
}