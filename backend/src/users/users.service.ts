import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UploadedFile
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { EditProfileDto } from './dto/profile-user.dto';
import { TwoFaService } from '../2fa/2fa.service';
import * as fs from 'fs';
import { extname } from 'path';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private twoFa: TwoFaService
  ) {}

  async getUser(nickname: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        nickname: nickname
      },
      select: {
        id: true,
        nickname: true,
        ladderPoints: true,
        avatarPath: true,
        createdAt: true,
				lastConnection: true
      }
    });
    return user;
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        nickname: true,
        ladderPoints: true,
        avatarPath: true,
        createdAt: true,
				lastConnection: true
      }
    });
    return user;
  }

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        nickname: true,
        ladderPoints: true,
        avatarPath: true,
        createdAt: true,
				lastConnection: true
      }
    });
    return users;
  }

	async getProfile(userId: string) {
		const user = await this.prisma.user.findUnique({
			where: {
				id: userId
			},
      select: {
        id: true,
        nickname: true,
        ladderPoints: true,
        avatarPath: true,
        createdAt: true,
				lastConnection: true,
				twoFactorEnable: true
    	}
		});
		return user;
	}

  async deleteUser(user: object) {
    this.deleteAvatar(user['avatarPath']);
    const deleteUser = await this.prisma.user.delete({
      where: {
        nickname: user['nickname']
      }
    });
    return deleteUser;
  }

  async addFriend(user: object, friendNickname: string) {
    if (user['nickname'] === friendNickname) {
      throw new UnauthorizedException(
        'You are not authorized to add this friend'
      );
    }
    const friend = await this.getUser(friendNickname);
    if (!friend || !user) throw new NotFoundException('User not found');
    await this.prisma.friend.upsert({
      where: {
        friend_pkey: {
          userId: user['id'],
          friendId: friend.id
        }
      },
      update: {},
      create: {
        userId: user['id'],
        friendId: friend.id
      }
    });
    return { message: 'Friend added' };
  }

  async deleteFriend(user: object, friendNickname: string) {
    const friend = await this.getUser(friendNickname);
    if (!friend) throw new NotFoundException('Friend not found');
    if (user['nickname'] === friendNickname) {
      throw new UnauthorizedException(
        'You are not authorized to delete this friend'
      );
    }
    await this.prisma.friend
      .delete({
        where: {
          friend_pkey: {
            userId: user['id'],
            friendId: friend.id
          }
        }
      })
      .catch(() => {
        throw new NotFoundException('Friend not found');
      });
    return { message: 'Friend deleted' };
  }

  async getFriends(user: object) {
    const friendsId = await this.prisma.friend.findMany({
      where: {
        userId: user['id']
      },
      select: {
        friendId: true
      }
    });
    const friends = await this.prisma.user.findMany({
      where: {
        id: {
          in: friendsId.map((friend) => friend.friendId)
        }
      },
      select: {
        id: true,
        nickname: true,
        ladderPoints: true,
        avatarPath: true,
        createdAt: true
      }
    });
    return friends;
  }

  async editProfile(userId: string, dto: EditProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        twoFactorEnable: true,
        twoFactorSecret: true
      }
    });
    if (dto.twoFactorEnable && !user.twoFactorEnable) {
      if (!dto.twoFactorCode) {
        throw new ForbiddenException('Two factor code required');
      }
      const valid = await this.twoFa.verifyTwoFa(
        user.twoFactorSecret,
        Number(dto.twoFactorCode)
      );
      if (!valid) throw new ForbiddenException('Invalid two factor code');
    }
    await this.prisma.user
      .update({
        where: {
          id: userId
        },
        data: {
          nickname: dto.nickname,
          twoFactorEnable: dto.twoFactorEnable
        }
      })
      .catch(() => {
        throw new ForbiddenException('Nickname already exists');
      });
    return { message: 'Profile updated' };
  }

  deleteAvatar(avatarPath: string) {
    if (avatarPath === '/default.jpeg') return;
    try {
      fs.unlinkSync(`./public/avatars${avatarPath}`);
    } catch (err) {
      console.log(
        "Can't delete avatar because it doesn't exist (no problem for the user)"
      );
    }
  }

  async uploadAvatar(
    userId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) throw new ForbiddenException('File required');
    const allowedTypes = ['.png', '.jpg', '.jpeg'];
    const fileSizeMb = file.size / 1024 ** 2;
    const extension = extname(file.originalname);
    const oldAvatar = await this.prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        avatarPath: true
      }
    });
    if (!allowedTypes.includes(extension))
      throw new ForbiddenException('Invalid file type');
    if (fileSizeMb > 2)
      throw new ForbiddenException('File size limit exceeded (2MB)');
    file.path = file.path.replace('public/avatars', '');
    await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        avatarPath: file.path
      }
    });
    this.deleteAvatar(oldAvatar.avatarPath);
    return { message: 'Avatar updated' };
  }

  async blockUser(blockerId: string, blockedId: string) {
    const alreadyBlocked = await this.prisma.blockedUser.findUnique({
      where: {
        blocked_users_pkey: {
          userId: blockerId,
          blockedId: blockedId
        }
      }
    });
    if (alreadyBlocked) throw new ForbiddenException('User already blocked');
    return await this.prisma.blockedUser.create({
      data: {
        userId: blockerId,
        blockedId: blockedId
      },
      select: {
        blockedId: true
      }
    });
  }

  async unblockUser(blockerId: string, blockedId: string) {
    const alreadyBlocked = await this.prisma.blockedUser.findUnique({
      where: {
        blocked_users_pkey: {
          userId: blockerId,
          blockedId: blockedId
        }
      }
    });
    if (!alreadyBlocked) throw new ForbiddenException('User is not blocked');
    return await this.prisma.blockedUser.delete({
      where: {
        blocked_users_pkey: {
          userId: blockerId,
          blockedId: blockedId
        }
      },
      select: {
        blockedId: true
      }
    });
  }

  async getBlockedUsers(userId: string) {
    const blockedUsers = await this.prisma.blockedUser.findMany({
      where: {
        userId: userId
      },
      select: {
        blockedId: true
      }
    });

    return { blockedUsers: blockedUsers.map((x) => x.blockedId) };
  }

  async chatrooms(userId: string) {
    return await this.prisma.chatRoom.findMany({
      where: {
        users: {
          some: {
            user: { id: userId }
          }
        }
      },
      select: {
        id: true,
        name: true,
        slug: true
      }
    });
  }
}
