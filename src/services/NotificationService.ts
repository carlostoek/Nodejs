import { Context } from 'telegraf';
import { UserLevel } from '../types';

export class NotificationService {
  private lucienMessages = [
    "🌙 *Susurra Lucien*: Los secretos danzan en las sombras... ¿Sientes su llamada?",
    "✨ *Lucien te observa*: Tu alma brilla con una luz especial hoy, querido explorador...",
    "🔮 *Murmura Lucien*: Diana ha dejado pistas en el viento... ¿Las encontrarás?",
    "🌹 *Lucien sonríe misteriosamente*: El placer y el misterio se entrelazan en tu camino...",
    "🗝️ *Lucien susurra secretos*: Cada reacción tuya es una llave que abre nuevos mundos..."
  ];

  private dianaMessages = [
    "💫 *Diana aparece entre las sombras*: He notado tu presencia... Interesante.",
    "🌺 *Diana te mira intensamente*: Tus secretos resuenan con los míos, querido...",
    "🔥 *Diana sonríe enigmáticamente*: El Diván aguarda a quienes comprenden el arte de la seducción...",
    "🌙 *Diana susurra*: Los misterios más profundos solo se revelan a los dignos..."
  ];

  async sendRandomNotification(ctx: Context, userLevel: UserLevel): Promise<void> {
    const messages = userLevel === UserLevel.MASTER || userLevel === UserLevel.DEVOTEE 
      ? this.dianaMessages 
      : this.lucienMessages;
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    await ctx.reply(randomMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: "🔍 Explorar", callback_data: "explore" }],
          [{ text: "🎯 Misiones", callback_data: "missions" }],
          [{ text: "🎒 Mochila", callback_data: "backpack" }]
        ]
      }
    });
  }

  async sendLevelUpNotification(ctx: Context, newLevel: UserLevel): Promise<void> {
    const levelMessages = {
      [UserLevel.EXPLORER]: "🌟 *¡Felicidades!* Has ascendido a **Explorador**. Los misterios básicos se revelan ante ti...",
      [UserLevel.SEEKER]: "🔮 *¡Impresionante!* Ahora eres un **Buscador**. Lucien nota tu determinación...",
      [UserLevel.INITIATE]: "⚡ *¡Extraordinario!* Has alcanzado el nivel **Iniciado**. Diana comienza a susurrar tu nombre...",
      [UserLevel.DEVOTEE]: "🌹 *¡Magnífico!* Eres ahora un **Devoto**. Los secretos más profundos te aguardan...",
      [UserLevel.MASTER]: "👑 *¡LEGENDARIO!* Has ascendido a **Maestro**. Diana te recibe en su círculo íntimo..."
    };

    await ctx.reply(levelMessages[newLevel] || "🎉 ¡Has subido de nivel!", {
      parse_mode: 'Markdown'
    });
  }

  async sendMissionCompleteNotification(ctx: Context, missionTitle: string, reward: any): Promise<void> {
    let rewardText = `🎁 *Recompensas:*\n`;
    
    if (reward.points > 0) {
      rewardText += `• ${reward.points} puntos de experiencia\n`;
    }
    
    if (reward.lorePieces && reward.lorePieces.length > 0) {
      rewardText += `• ${reward.lorePieces.length} nueva(s) pista(s) para tu mochila\n`;
    }
    
    if (reward.vipDays) {
      rewardText += `• ${reward.vipDays} día(s) de acceso VIP\n`;
    }

    const message = `✅ *¡Misión Completada!*\n\n🎯 *${missionTitle}*\n\n${rewardText}\n🌙 *Lucien susurra*: "Bien hecho, explorador..."`;

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: "🎯 Ver más misiones", callback_data: "missions" }],
          [{ text: "🎒 Revisar mochila", callback_data: "backpack" }]
        ]
      }
    });
  }
}