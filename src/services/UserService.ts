import { PrismaClient } from '@prisma/client';
import { User, UserLevel, LorePiece } from '../types';

export class UserService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createUser(telegramId: number, firstName: string, lastName?: string, username?: string): Promise<User> {
    return await this.prisma.user.create({
      data: {
        telegramId,
        firstName,
        lastName,
        username,
        points: 0,
        level: UserLevel.NEWCOMER,
        isVIP: false,
        joinedAt: new Date(),
        lastActive: new Date(),
        lorePieces: [],
        completedMissions: [],
        currentMissions: []
      }
    });
  }

  async getUser(telegramId: number): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { telegramId },
      include: {
        lorePieces: true,
        missions: true
      }
    });
  }

  async updateUserPoints(userId: string, points: number): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        points: {
          increment: points
        },
        lastActive: new Date()
      }
    });

    // Check for level up
    await this.checkLevelUp(user);
    return user;
  }

  async addLorePiece(userId: string, lorePieceId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        lorePieces: {
          connect: { id: lorePieceId }
        }
      }
    });
  }

  async grantVIPAccess(userId: string, days: number): Promise<User> {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);

    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        isVIP: true,
        vipExpiresAt: expirationDate
      }
    });
  }

  private async checkLevelUp(user: User): Promise<void> {
    const levelThresholds = {
      [UserLevel.NEWCOMER]: 0,
      [UserLevel.EXPLORER]: 100,
      [UserLevel.SEEKER]: 500,
      [UserLevel.INITIATE]: 1500,
      [UserLevel.DEVOTEE]: 5000,
      [UserLevel.MASTER]: 15000
    };

    let newLevel = user.level;
    for (const [level, threshold] of Object.entries(levelThresholds)) {
      if (user.points >= threshold) {
        newLevel = level as UserLevel;
      }
    }

    if (newLevel !== user.level) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { level: newLevel }
      });
      
      // Trigger level up notification
      await this.triggerLevelUpNotification(user.telegramId, newLevel);
    }
  }

  private async triggerLevelUpNotification(telegramId: number, newLevel: UserLevel): Promise<void> {
    // This will be handled by NotificationService
  }
}