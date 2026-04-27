import { ForbiddenException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export const GENERAL_ROOM_NAME = 'Général';

@Injectable()
export class RoomService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const existing = await this.prisma.room.findFirst({
      where: { name: GENERAL_ROOM_NAME },
    });
    if (!existing) {
      await this.prisma.room.create({ data: { name: GENERAL_ROOM_NAME } });
    }
  }

  async addToGeneralRoom(userId: string) {
    const general = await this.prisma.room.findFirst({
      where: { name: GENERAL_ROOM_NAME },
    });
    if (!general) return;
    await this.prisma.roomMember.upsert({
      where: { userId_roomId: { userId, roomId: general.id } },
      create: { userId, roomId: general.id, hasHistory: true },
      update: {},
    });
  }

  async create(name: string, creatorId: string) {
    return this.prisma.room.create({
      data: {
        name,
        creatorId,
        members: { create: { userId: creatorId, hasHistory: true } },
      },
      include: { members: { include: { user: { select: { id: true, username: true, color: true } } } } },
    });
  }

  async findAllForUser(userId: string) {
    return this.prisma.room.findMany({
      where: {
        OR: [
          { name: GENERAL_ROOM_NAME },
          { members: { some: { userId } } },
        ],
      },
      include: {
        members: { include: { user: { select: { id: true, username: true, color: true } } } },
      },
    });
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: { members: { include: { user: { select: { id: true, username: true, color: true } } } } },
    });
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async addMember(roomId: string, requesterId: string, userId: string, hasHistory: boolean) {
    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');
    if (room.creatorId !== requesterId) throw new ForbiddenException('Only the creator can invite members');

    return this.prisma.roomMember.upsert({
      where: { userId_roomId: { userId, roomId } },
      create: { userId, roomId, hasHistory },
      update: { hasHistory },
    });
  }

  async getMessages(roomId: string, userId: string) {
    const member = await this.prisma.roomMember.findUnique({
      where: { userId_roomId: { userId, roomId } },
    });

    if (!member) throw new NotFoundException('Not a member of this room');

    return this.prisma.message.findMany({
      where: {
        roomId,
        ...(member.hasHistory ? {} : { created: { gte: member.joinedAt } }),
      },
      include: {
        user: { select: { id: true, username: true, color: true } },
        reactions: { include: { user: { select: { id: true, username: true } } } },
      },
      orderBy: { created: 'asc' },
    });
  }
}
