import { IsNotEmpty, IsBoolean, IsString, ValidateIf } from 'class-validator';
import { ToBoolean } from 'src/helpers/to-boolean.decorator';

export class EditProfileDto {
  // TODO: add validation
  @IsNotEmpty()
  @IsString()
  nickname: string;

  @ToBoolean()
  @IsBoolean()
  twoFactorEnable: boolean;

  @ValidateIf((o) => o === '')
  @IsString()
  twoFactorCode: string;

  // TODO: handle avatar
  //  @IsBuffer
  //  @IsString()
  //  avatar: Buffer;
}
