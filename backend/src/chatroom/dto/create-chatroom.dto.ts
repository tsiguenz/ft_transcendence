import { IsNotEmpty, IsString, IsIn, IsOptional } from 'class-validator';
import { RoomType } from '@prisma/client';

export class CreateChatroomDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsIn([RoomType.PUBLIC, RoomType.PROTECTED, RoomType.PRIVATE])
  type: RoomType;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  password: string;
}
