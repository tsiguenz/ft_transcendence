import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// TODO: change hardcoded variable url
@Injectable()
export class PrismaService extends PrismaClient {
	constructor() {
		super({
			datasources: {
				db: {
					url: 'postgresql://root:root@database:5432/pong?schema=public'
				},
			},
		});
	}
}
