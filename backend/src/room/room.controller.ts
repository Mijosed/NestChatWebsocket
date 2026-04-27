import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import type { RequestWithUser } from '../auth/auth.guard';
import { RoomService } from './room.service';

@UseGuards(AuthGuard)
@Controller('room')
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Post()
  create(@Body() dto: { name: string }, @Req() req: RequestWithUser) {
    return this.roomService.create(dto.name, req.user.sub);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.roomService.findAllForUser(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(id);
  }

  @Post(':id/members')
  addMember(
    @Param('id') roomId: string,
    @Req() req: RequestWithUser,
    @Body() dto: { userId: string; hasHistory: boolean },
  ) {
    return this.roomService.addMember(roomId, req.user.sub, dto.userId, dto.hasHistory);
  }

  @Get(':id/messages')
  getMessages(@Param('id') roomId: string, @Req() req: RequestWithUser) {
    return this.roomService.getMessages(roomId, req.user.sub);
  }
}
