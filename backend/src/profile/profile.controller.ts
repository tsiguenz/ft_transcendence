import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiParam, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guard';
import { Request } from 'express';

@ApiTags('profile')
@Controller('api/profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get()
  getProfile(@Req() req: Request) {
    // TODO: return 401 if user is not authorized
    return this.profileService.getProfile(req);
  }
}
