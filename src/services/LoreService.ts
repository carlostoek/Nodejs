import { PrismaClient } from '@prisma/client';
import { LorePiece, Reward } from '../types';

export class LoreService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createLorePiece(data: Omit<LorePiece, 'id'>): Promise<LorePiece> {
    return await this.prisma.lorePiece.create({ data });
  }

  async getLorePiece(id: string): Promise<LorePiece | null> {
    return await this.prisma.lorePiece.findUnique({ where: { id } });
  }

  async getUserLorePieces(userId: string): Promise<LorePiece[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { lorePieces: true }
    });
    return user?.lorePieces || [];
  }

  async combineLorePieces(userId: string, pieceIds: string[]): Promise<{ success: boolean; reward?: Reward; newPiece?: LorePiece }> {
    const userPieces = await this.getUserLorePieces(userId);
    const userPieceIds = userPieces.map(p => p.id);

    // Check if user has all required pieces
    if (!pieceIds.every(id => userPieceIds.includes(id))) {
      return { success: false };
    }

    // Find combination recipe
    const combination = await this.findCombination(pieceIds);
    if (!combination) {
      return { success: false };
    }

    // Create new piece or grant reward
    if (combination.resultPiece) {
      const newPiece = await this.createLorePiece(combination.resultPiece);
      await this.addLorePieceToUser(userId, newPiece.id);
      return { success: true, newPiece };
    }

    if (combination.reward) {
      return { success: true, reward: combination.reward };
    }

    return { success: false };
  }

  private async findCombination(pieceIds: string[]): Promise<{ resultPiece?: Omit<LorePiece, 'id'>; reward?: Reward } | null> {
    // Define combination recipes
    const recipes = [
      {
        ingredients: ['mystery_fragment', 'ancient_whisper'],
        resultPiece: {
          name: "Secreto de Diana",
          description: "Un fragmento de la verdad sobre la creadora del Diván",
          category: "story",
          rarity: 'epic' as const,
          unlockCondition: "Combinar Fragmento Misterioso + Susurro Ancestral"
        }
      },
      {
        ingredients: ['rare_insight', 'passion_essence', 'hidden_truth'],
        reward: {
          points: 500,
          vipDays: 7,
          specialAccess: ['secret_channel']
        }
      }
    ];

    for (const recipe of recipes) {
      if (this.arraysEqual(pieceIds.sort(), recipe.ingredients.sort())) {
        return recipe;
      }
    }

    return null;
  }

  private async addLorePieceToUser(userId: string, lorePieceId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        lorePieces: {
          connect: { id: lorePieceId }
        }
      }
    });
  }

  private arraysEqual(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((val, i) => val === b[i]);
  }
}