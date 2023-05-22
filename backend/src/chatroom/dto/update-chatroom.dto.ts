import { IsString } from 'class-validator';

export class UpdateChatroomDto {
  @IsString()
  password: string;
}
