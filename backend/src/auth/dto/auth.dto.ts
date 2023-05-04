import { IsNotEmpty, ValidateIf, IsString, Matches } from 'class-validator';

export class AuthDto {
  @Matches(/^[a-zA-Z0-9-]{1,8}/, { message: 'Invalid nickname' })
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @ValidateIf((o) => o.twoFactorCode === '')
  @IsString()
  twoFactorCode: string;
}
