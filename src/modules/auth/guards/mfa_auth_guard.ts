import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface IJwtPayload {
  sub: string;
  email: string;
  name: string;
  mfa_required: boolean;
  type: string;
}

@Injectable()
export class MFAAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader)
      throw new UnauthorizedException('Token de autenticação não fornecido');
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token)
      throw new UnauthorizedException('Formato de token inválido');
    try {
      // Valida e decodifica o token gerado no login
      const payload = this.jwtService.verify<IJwtPayload>(token);
      if (payload.type !== 'mfa')
        throw new UnauthorizedException('Token inválido');
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
