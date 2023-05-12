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
    // use decode instead of verify because verify
    // return undefined if the token is expired
    // and we are sure the token was valid when the user connected
    const payload = await this.jwt.decode(socket.handshake.auth.token);
    if (!payload) return undefined;
    const userId = payload.sub;
    if (!userId) return undefined;
    const index = connectedUsers.indexOf(userId);
    if (index > -1) connectedUsers.splice(index, 1);
    return userId;
  }

  async getUserIdFromSocket(socket: Socket) {
    if (!socket.handshake.auth || !socket.handshake.auth.token) return;
    const token = socket.handshake.auth.token;
    const userId = await this.getUserIdFromJwt(token);
    return userId;
  }

  async getUserIdFromJwt(token: string) {
    const payload = await this.jwt
      .verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET
      })
      .catch(() => {
        return undefined;
      });
    if (!payload) return undefined;
    return payload.sub;
  }

  async setLastConnection(socket: Socket) {
    const userId = await this.getUserIdFromSocket(socket);
    if (!userId) return;
    await this.prisma.user
      .update({
        where: {
          id: userId
        },
        data: {
          lastConnection: new Date()
        }
      })
      .catch(() => {
        // occur when the user have a good token but is not in the database
        // in case of restart the containers but jwt is still valid
        return socket.disconnect();
      });
  }
}
