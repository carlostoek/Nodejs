// src/types/index.ts
export interface User {
  id: string;
  telegramId: number;
  username?: string;
  firstName: string;
  lastName?: string;
  points: number;
  level: UserLevel;
  isVIP: boolean;
  vipExpiresAt?: Date;
  joinedAt: Date;
  lastActive: Date;
  lorePieces: LorePiece[];
  completedMissions: string[];
  currentMissions: Mission[];
}

export interface LorePiece {
  id: string;
  name: string;
  description: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockCondition: string;
  combinableWith?: string[];
  reward?: Reward;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special' | 'personalized';
  category: string;
  requirements: MissionRequirement[];
  reward: Reward;
  expiresAt?: Date;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
}

export interface MissionRequirement {
  type: 'reactions' | 'messages' | 'time_active' | 'lore_pieces' | 'referrals';
  target: number;
  current: number;
}

export interface Reward {
  points: number;
  lorePieces?: string[];
  vipDays?: number;
  specialAccess?: string[];
}

export enum UserLevel {
  NEWCOMER = 'newcomer',
  EXPLORER = 'explorer',
  SEEKER = 'seeker',
  INITIATE = 'initiate',
  DEVOTEE = 'devotee',
  MASTER = 'master'
}

export interface Channel {
  id: string;
  telegramId: number;
  name: string;
  type: 'free' | 'vip';
  description: string;
  memberCount: number;
}