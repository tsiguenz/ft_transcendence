import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('signup')
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }
  @Post('signin')
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }
  @Get('get-user')
  getUser(@Query() query: any) {
    return this.authService.getUser(query);
  }
  @Get('get-all-users')
  getAllUsers() {
    return this.authService.getAllUsers();
  }
}
