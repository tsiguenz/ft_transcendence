import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChatroomDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
