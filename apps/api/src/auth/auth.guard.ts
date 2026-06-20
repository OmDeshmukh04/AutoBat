import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { verifyToken, type JwtPayload } from "./jwt.util";

export const ROLES_KEY = "roles";
// Decorate a route with the roles allowed to call it. No decorator => any
// authenticated user. @Roles() with values => only those roles.
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export type AuthedRequest = Request & { user: JwtPayload };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const header = req.headers.authorization ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      throw new UnauthorizedException("Missing bearer token");
    }

    const payload = verifyToken(token);
    if (!payload) {
      throw new UnauthorizedException("Invalid or expired token");
    }
    req.user = payload;

    const required = this.reflector.getAllAndOverride<string[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (required && required.length > 0 && !required.includes(payload.role)) {
      throw new ForbiddenException(
        `Requires role: ${required.join(", ")}`
      );
    }

    return true;
  }
}
