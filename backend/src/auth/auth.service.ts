import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';

@Injectable()
export class AuthService {
	constructor(private prisma: PrismaService) { }

    async	signup(dto: AuthDto) {
		const	hash = await argon.hash(dto.password);
		const	user = await this.prisma.user.create({
			data: {
				email:	dto.email,
				pseudo: dto.pseudo,
						hash,
			},
		});
        return user;
    }

    signin() {
        return { msg: 'I am signin !' };
    }
}
