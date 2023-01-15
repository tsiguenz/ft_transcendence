import { Injectable } from '@nestjs/common';
// TODO: define interface
// import { User } from './interfaces/user.interface';

@Injectable()
export class UsersService {

	listUsers(): string {
		return 'Do GET for /users';
	}

}
