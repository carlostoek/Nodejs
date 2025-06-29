import { PrismaClient } from '@prisma/client';
import { Mission, MissionRequirement, Reward, User } from '../types';

export class MissionService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async generateDailyMissions(userId: string): Promise<Mission[]> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const missionTemplates = [
      {
        title: "Reacciona y Conecta",
        description: "Dale reacciones a 5 publicaciones en Los Kinkys",
        type: 'daily' as const,
        category: 'engagement',
        requirements: [{ type: 'reactions' as const, target: 5, current: 0 }],
        reward: { points: 50, lorePieces: [] }
      },
      {
        title: "Explorador Activo",
        description: "Mantente activo por 30 minutos en el canal",
        type: 'daily' as const,
        category: 'activity',
        requirements: [{ type: 'time_active' as const, target: 30, current: 0 }],
        reward: { points: 75, lorePieces: ['mystery_fragment'] }
      },
      {
        title: "Coleccionista Místico",
        description: "Encuentra 2 pistas ocultas en las publicaciones de hoy",
        type: 'daily' as const,
        category: 'collection',
        requirements: [{ type: 'lore_pieces' as const, target: 2, current: 0 }],
        reward: { points: 100, lorePieces: ['rare_insight'] }
      }
    ];

    const missions: Mission[] = [];
    const selectedTemplates = this.shuffleArray(missionTemplates).slice(0, 2);

    for (const template of selectedTemplates) {
      const mission: Mission = {
        id: this.generateId(),
        ...template,
        expiresAt: this.getEndOfDay(),
        progress: 0,
        maxProgress: template.requirements[0].target,
        isCompleted: false
      };
      missions.push(mission);
    }

    return missions;
  }

  async generateWeeklyMissions(userId: string): Promise<Mission[]> {
    const weeklyMissions = [
      {
        title: "Maestro de la Seducción",
        description: "Acumula 500 puntos durante esta semana",
        type: 'weekly' as const,
        category: 'progression',
        requirements: [{ type: 'points' as const, target: 500, current: 0 }],
        reward: { points: 200, vipDays: 1 }
      },
      {
        title: "Guardián de Secretos",
        description: "Recolecta 10 pistas diferentes esta semana",
        type: 'weekly' as const,
        category: 'collection',
        requirements: [{ type: 'lore_pieces' as const, target: 10, current: 0 }],
        reward: { points: 300, lorePieces: ['legendary_key'] }
      }
    ];

    return weeklyMissions.map(template => ({
      id: this.generateId(),
      ...template,
      expiresAt: this.getEndOfWeek(),
      progress: 0,
      maxProgress: template.requirements[0].target,
      isCompleted: false
    }));
  }

  async updateMissionProgress(userId: string, missionId: string, progress: number): Promise<Mission | null> {
    const mission = await this.prisma.mission.update({
      where: { id: missionId },
      data: { progress }
    });

    if (mission.progress >= mission.maxProgress && !mission.isCompleted) {
      await this.completeMission(userId, missionId);
    }

    return mission;
  }

  async completeMission(userId: string, missionId: string): Promise<void> {
    const mission = await this.prisma.mission.findUnique({ where: { id: missionId } });
    if (!mission) return;

    await this.prisma.mission.update({
      where: { id: missionId },
      data: { isCompleted: true }
    });

    // Grant rewards
    await this.grantReward(userId, mission.reward);
  }

  private async grantReward(userId: string, reward: Reward): Promise<void> {
    const userService = new (await import('./UserService')).UserService();
    
    if (reward.points > 0) {
      await userService.updateUserPoints(userId, reward.points);
    }

    if (reward.vipDays) {
      await userService.grantVIPAccess(userId, reward.vipDays);
    }

    if (reward.lorePieces && reward.lorePieces.length > 0) {
      for (const lorePieceId of reward.lorePieces) {
        await userService.addLorePiece(userId, lorePieceId);
      }
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private getEndOfDay(): Date {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return end;
  }

  private getEndOfWeek(): Date {
    const end = new Date();
    const daysUntilSunday = 7 - end.getDay();
    end.setDate(end.getDate() + daysUntilSunday);
    end.setHours(23, 59, 59, 999);
    return end;
  }
}