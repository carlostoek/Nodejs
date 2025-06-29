import { PrismaClient } from '@prisma/client';
import { Context } from 'telegraf';

export class ChannelService {
  private prisma: PrismaClient;
  private readonly FREE_CHANNEL_ID = process.env.FREE_CHANNEL_ID!;
  private readonly VIP_CHANNEL_ID = process.env.VIP_CHANNEL_ID!;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async checkChannelMembership(ctx: Context, userId: number, channelId: string): Promise<boolean> {
    try {
      const member = await ctx.telegram.getChatMember(channelId, userId);
      return ['creator', 'administrator', 'member'].includes(member.status);
    } catch (error) {
      return false;
    }
  }

  async checkVIPAccess(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return false;

    if (!user.isVIP) return false;
    
    if (user.vipExpiresAt && user.vipExpiresAt < new Date()) {
      // VIP expired, revoke access
      await this.revokeVIPAccess(userId);
      return false;
    }

    return true;
  }

  async grantChannelAccess(ctx: Context, userId: number, channelType: 'free' | 'vip'): Promise<void> {
    const channelId = channelType === 'vip' ? this.VIP_CHANNEL_ID : this.FREE_CHANNEL_ID;
    
    try {
      // Create invite link
      const inviteLink = await ctx.telegram.createChatInviteLink(channelId, {
        member_limit: 1,
        expire_date: Math.floor(Date.now() / 1000) + 3600 // 1 hour
      });

      const channelName = channelType === 'vip' ? 'El Diván 🌹' : 'Los Kinkys 🌙';
      
      await ctx.reply(
        `🗝️ *Acceso Concedido*\n\nPuedes unirte a **${channelName}**:\n${inviteLink.invite_link}\n\n⏰ *Enlace válido por 1 hora*`,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      console.error('Error creating invite link:', error);
      await ctx.reply('❌ Error al generar el enlace de acceso. Contacta al administrador.');
    }
  }

  private async revokeVIPAccess(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isVIP: false,
        vipExpiresAt: null
      }
    });
  }

  async getChannelStats(): Promise<{ freeMembers: number; vipMembers: number }> {
    try {
      const freeCount = await this.prisma.user.count();
      const vipCount = await this.prisma.user.count({
        where: { isVIP: true }
      });

      return {
        freeMembers: freeCount,
        vipMembers: vipCount
      };
    } catch (error) {
      return { freeMembers: 0, vipMembers: 0 };
    }
  }
}