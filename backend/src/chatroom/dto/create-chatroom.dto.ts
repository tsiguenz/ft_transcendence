import {
  IsNotEmpty,
  IsString,
  IsIn,
  IsOptional,
  ValidateIf
} from 'class-validator';
import { RoomType } from '@prisma/client';

export class CreateChatroomDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsIn([RoomType.PUBLIC, RoomType.PROTECTED, RoomType.PRIVATE])
  type: RoomType;

  @ValidateIf((o) => o.type === RoomType.PROTECTED)
  @IsString()
  @IsNotEmpty()
  password: string;
}
