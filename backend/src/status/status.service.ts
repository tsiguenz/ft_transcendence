import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class StatusService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async addNewUser(socket: Socket, connectedUsers: string[]) {
    const userId = await this.getUserIdFromSocket(socket);
    if (!userId) return undefined;
    if (!connectedUsers.includes(userId)) connectedUsers.push(userId);
    return userId;
  }

  async removeUser(socket: Socket, connectedUsers: string[]) {
    const userId = await this.getUserIdFromSocket(socket);
    if (!userId) return undefined;
    const index = connectedUsers.indexOf(userId);
    if (index > -1) {
      connectedUsers.splice(index, 1);
    }
    return userId;
  }

  async getUserIdFromSocket(socket: Socket) {
    if (!socket.handshake.auth || !socket.handshake.auth.token) return;
    const token = socket.handshake.auth.token;
    const userId = await this.getUserIdFromJwt(token);
    return userId;
  }

  async getUserIdFromJwt(token: string) {
    const payload = await this.jwt.verifyAsync(token, {
      secret: process.env.JWT_SECRET
    });
    return payload.sub;
  }
}
