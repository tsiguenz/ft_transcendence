import { IsNotEmpty, IsBoolean, IsString } from 'class-validator';
import { ToBoolean } from 'src/helpers/to-boolean.decorator';

export class EditProfileDto {
  @IsNotEmpty()
  @IsString()
  nickname: string;

  @ToBoolean()
  @IsBoolean()
  twoFactorEnable: boolean;

  // TODO: handle avatar
  //  @IsBuffer
  //  @IsString()
  //  avatar: Buffer;
}
