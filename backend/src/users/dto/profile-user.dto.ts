import {
  IsNotEmpty,
  IsBoolean,
  IsString,
  ValidateIf,
  Matches
} from 'class-validator';
import { ToBoolean } from 'src/helpers/to-boolean.decorator';

export class EditProfileDto {
  @Matches(/^[a-zA-Z0-9-]{1,8}/, { message: 'Invalid nickname' })
  @IsNotEmpty()
  @IsString()
  nickname: string;

  @ToBoolean()
  @IsBoolean()
  twoFactorEnable: boolean;

  @ValidateIf((o) => o.twoFactorCode === '')
  @IsString()
  twoFactorCode: string;
}
