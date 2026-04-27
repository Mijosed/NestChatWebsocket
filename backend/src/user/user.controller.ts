import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import type { RequestWithUser } from '../auth/auth.guard';
import { UserService } from './user.service';

@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('me')
  getMe(@Req() req: RequestWithUser) {
    return this.userService.findOne(req.user.sub);
  }

  @Patch('me')
  updateMe(
    @Req() req: RequestWithUser,
    @Body() dto: { username?: string; color?: string },
  ) {
    return this.userService.update(req.user.sub, dto);
  }
}
