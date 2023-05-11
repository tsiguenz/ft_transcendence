import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class IsMeGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (request.params.nickname !== request.user.nickname) {
      throw new UnauthorizedException(
        'You are not authorized to perform this action'
      );
    }
    return request;
  }
}
