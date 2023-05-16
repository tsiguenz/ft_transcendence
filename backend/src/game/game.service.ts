import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Socket } from 'socket.io';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}
}
