import {
  IsNotEmpty,
  ValidateIf,
  IsString,
  Matches,
  MaxLength
} from 'class-validator';

export class AuthDto {
  // don't use @IsNotEmpty because @Matches catch empty string
  @Matches(/^[a-zA-Z\d]+$/, {
    message: 'nickname must be alphanumeric and not empty'
  })
  @MaxLength(8, { message: "nickname can't be bigger than 8 characters" })
  @IsString()
  nickname: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @ValidateIf((o) => o.twoFactorCode === '')
  @IsString()
  twoFactorCode: string;
}
