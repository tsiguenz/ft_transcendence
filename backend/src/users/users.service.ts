import { Injectable, NotFoundException, Delete } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}
  async getUser(nickname: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          nickname: nickname
        }
      });
      return user;
    } catch (e) {
      throw new NotFoundException('User not found');
    }
  }

  async getUserById(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId
        }
      });
      return user;
    } catch (e) {
      throw new NotFoundException('User not found');
    }
  }

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        nickname: true,
        ladderPoints: true,
        avatarPath: true,
        createdAt: true
      }
    });
    return users;
  }

  //TODO: Use guard to verify authorization
  async deleteUser(paramName: string, nickname: string, avatarPath: string) {
    if (paramName !== nickname) {
      throw new UnauthorizedException(
        'You are not authorized to delete this profile'
      );
    }
    //    this.profile.deleteAvatar(avatarPath);
    const deleteUser = await this.prisma.user.delete({
      where: {
        nickname: nickname
      }
    });
    return deleteUser;
  }

  async addFriend(
    userNickname: string,
    friendNickname: string,
    userId: number
  ) {
    const user = await this.getUser(userNickname);
    const friend = await this.getUser(friendNickname);
    if (!user || !friend) throw new NotFoundException('User not found');
    if (userNickname === friendNickname || userId !== user.id) {
      throw new UnauthorizedException(
        'You are not authorized to add this friend'
      );
    }
    const userFriends = await this.prisma.friend.findUnique({
      where: {
        friend_pkey: {
          userId: user.id,
          friendNickname: friendNickname
        }
      },
      select: {
        friendNickname: true
      }
    });
    if (userFriends) throw new ForbiddenException('Friend already added');
    await this.prisma.friend.create({
      data: {
        userId: user.id,
        friendNickname: friendNickname
      }
    });
    return { message: 'Friend added' };
  }

  async deleteFriend(
    userNickname: string,
    friendNickname: string,
    userId: number
  ) {
    const user = await this.getUser(userNickname);
    if (!user) throw new NotFoundException('User not found');
    if (userNickname === friendNickname || userId !== user.id) {
      throw new UnauthorizedException(
        'You are not authorized to delete this friend'
      );
    }
    await this.prisma.friend
      .delete({
        where: {
          friend_pkey: {
            userId: user.id,
            friendNickname: friendNickname
          }
        }
      })
      .catch(() => {
        throw new NotFoundException('Friend not found');
      })
      .then(() => {
        return { message: 'Friend deleted' };
      });
  }

  async getFriends(userNickname: string, userId: number) {
    const user = await this.getUser(userNickname);
    if (!user) throw new NotFoundException('User not found');
    if (userId !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to get this user friends'
      );
    }
    const friends = await this.prisma.friend.findMany({
      where: {
        userId: user.id
      },
      select: {
        friendNickname: true
      }
    });
    return friends.map((friend) => friend.friendNickname);
  }
}
