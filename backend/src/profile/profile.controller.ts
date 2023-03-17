import { Controller, Body, Get, Put, Req, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guard';
import { Request } from 'express';
import { EditProfileDto } from './dto';

@ApiTags('profile')
@Controller('api/profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Get()
  getProfile(@Req() req: Request) {
    return this.profileService.getProfile(req);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Put()
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nickname: { type: 'string', description: 'The new unique nickname' },
        twoFactorEnable: {
          type: 'boolean',
          description: 'Enable or disable two factor authentication'
        }
        // TODO: handle avatar
        //        avatar: {
        //          type: 'string',
        //          description: 'The new avatar'
        //        }
      }
    }
  })
  editProfile(@Body() dto: EditProfileDto, @Req() req: Request) {
    return this.profileService.editProfile(dto, req);
  }
}
