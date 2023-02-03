import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// TODO: change hardcoded variable url
@Injectable()
export class PrismaService extends PrismaClient {
	constructor() {
		super({
			datasources: {
				db: {
					url: 'postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@database:5432/${DB_NAME}?schema=public'
				},
			},
		});
	}
}
