import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma.service';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';

@Module({
  imports: [AuthModule],
  providers: [RoomService, PrismaService],
  controllers: [RoomController],
  exports: [RoomService],
})
export class RoomModule {}
