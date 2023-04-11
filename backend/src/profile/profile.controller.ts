import {
  Controller,
  Body,
  Get,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Post
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guard';
import { Request } from 'express';
import { EditProfileDto } from './dto';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('profile')
@Controller('api/profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Get()
  getProfile(@Req() req: Request) {
    return this.profileService.getProfile(req.user['id']);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
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
      }
    }
  })
  @Put()
  editProfile(@Body() dto: EditProfileDto, @Req() req: Request) {
    return this.profileService.editProfile(dto, req.user['id']);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/avatars',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `/${randomName}${extname(file.originalname)}`);
        }
      })
    })
  )
  @Post('avatar')
  // TODO: pass the user in the url (/api/users/:nickname/avatar)
  async uploadAvatar(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.profileService.uploadAvatar(req.user['id'], file);
  }
}
