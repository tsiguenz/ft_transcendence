import { IsNotEmpty, ValidateIf, IsString } from 'class-validator';

export class AuthDto {
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  // TODO: cast to integer, class-validator doesn't support this yet :(
  @ValidateIf((o) => o === '')
  @IsString()
  twoFactorCode: string;
}
