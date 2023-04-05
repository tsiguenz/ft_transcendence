import {
  IsNotEmpty,
  IsBoolean,
  IsString,
  ValidateIf,
  IsInt,
  Max
} from 'class-validator';
import { ToBoolean } from 'src/helpers/to-boolean.decorator';

export class EditProfileDto {
  @IsNotEmpty()
  @IsString()
  nickname: string;

  @ToBoolean()
  @IsBoolean()
  twoFactorEnable: boolean;

  @ValidateIf((o) => o.twoFactorCode === '')
  @IsString()
  twoFactorCode: string;

  @ValidateIf((o) => {
    const mime = ['image/jpg', 'image/png', 'image/jpeg'];
    return mime.includes(o.avatarFileType);
  })
  @IsString()
  avatarFileType: string;

  @IsInt()
  @Max(1000000)
  avatarFileSize: number;

  @IsString()
  avatarFileBase64: string;
}
