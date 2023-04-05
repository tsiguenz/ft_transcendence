import { IsNotEmpty, IsBoolean, IsString, ValidateIf } from 'class-validator';
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
}
