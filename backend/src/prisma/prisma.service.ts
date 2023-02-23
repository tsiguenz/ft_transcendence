import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// TODO: change hardcoded variable url
@Injectable()
export class PrismaService extends PrismaClient {
	constructor() {
		super({
			datasources: {
				db: {
					url: process.env.DATABASE_URL,
				},
			},
		});
	}
}
