import { IsNotEmpty, ValidateIf, IsString, Matches } from 'class-validator';

export class AuthDto {
  @Matches(/^[a-zA-Z\d]+$/, { message: 'Nickname must be alphanumeric' })
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
