import { IsString, Matches, MaxLength, IsNotEmpty } from 'class-validator';

export class Signin42Dto {
  // don't use @IsNotEmpty because @Matches catch empty string
  @Matches(/^$|^[a-zA-Z\d]+$/, {
    message: 'nickname must be alphanumeric and not empty'
  })
  @MaxLength(8, { message: "nickname can't be bigger than 8 characters" })
  @IsString()
  nickname: string;

  @IsNotEmpty()
  @IsString()
  authorization: string;

  @IsString()
  access_token42: string;
}
