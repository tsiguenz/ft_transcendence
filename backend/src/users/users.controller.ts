import { Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('api/users')
export class UsersController {

	constructor(private usersService: UsersService) {}

	@Get()
	listUsers(): string {
		return this.usersService.listUsers();
	}

	@Post()
	newUsers(): string {
		return 'Do POST for /users';
	}

}
