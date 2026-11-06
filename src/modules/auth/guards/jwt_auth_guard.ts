import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface AccessTokenPayload {
  sub: string;
  email: string;
  name: string;
  mfa_required: boolean;
  type: 'access';
  iss: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    if (typeof authorization !== 'string') {
      throw new UnauthorizedException('Token de acesso não fornecido');
    }
    const match = /^Bearer\s+(\S+)$/i.exec(authorization);
    if (!match) throw new UnauthorizedException('Formato de token inválido');
    try {
      const payload = this.jwtService.verify<AccessTokenPayload>(match[1], {
        algorithms: ['RS256'],
        issuer: 'saas-auth',
      });
      if (!payload.sub || payload.type !== 'access') {
        throw new UnauthorizedException('Token de acesso inválido');
      }
      request.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        mfa_required: payload.mfa_required,
        type: payload.type,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Token de acesso inválido ou expirado');
    }
  }
}
