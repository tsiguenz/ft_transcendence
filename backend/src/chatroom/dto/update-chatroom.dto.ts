import {
  IsNotEmpty,
  IsString,
  IsIn,
  IsOptional,
  ValidateIf
} from 'class-validator';

export class UpdateChatroomDto {
  @IsString()
  password: string;
}
