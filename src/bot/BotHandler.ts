import TelegramBot from 'node-telegram-bot-api';
import { UserService } from '../services/UserService';
import { MissionService } from '../services/MissionService';
import { LoreService } from '../services/LoreService';
import { NotificationService } from '../services/NotificationService';
import { ChannelService } from '../services/ChannelService';

export class BotHandler {
  private bot: TelegramBot;
  private userService: UserService;
  private missionService: MissionService;
  private loreService: LoreService;
  private notificationService: NotificationService;
  private channelService: ChannelService;

  constructor(
    bot: TelegramBot,
    userService: UserService,
    missionService: MissionService,
    loreService: LoreService,
    notificationService: NotificationService,
    channelService: ChannelService
  ) {
    this.bot = bot;
    this.userService = userService;
    this.missionService = missionService;
    this.loreService = loreService;
    this.notificationService = notificationService;
    this.channelService = channelService;
  }

  public initialize() {
    // Comando de bienvenida
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from?.id;
      if (!userId) return;

      const existingUser = await this.userService.getUser(userId);
      if (!existingUser) {
        await this.userService.createUser(userId, msg.from?.first_name || 'Explorador', msg.from?.last_name, msg.from?.username);
        await this.bot.sendMessage(chatId, '✨ Bienvenido al Diván de Diana. Tu aventura comienza ahora.');
      } else {
        await this.bot.sendMessage(chatId, '🌙 Bienvenido de nuevo al Diván. Continúa explorando...');
      }
    });

    // Comando básico de misión (ejemplo de conexión)
    this.bot.onText(/\/missions/, async (msg) => {
      const chatId = msg.chat.id;
      await this.bot.sendMessage(chatId, '🎯 Aquí estarán tus misiones. (Implementar lógica completa aquí)');
    });

    // Escuchar todos los mensajes (para buscar pistas)
    this.bot.on('message', async (msg) => {
      if (!msg.text) return;
      // Aquí deberías conectar al LorePieceHandler con el método searchHiddenPieces
    });
  }
}
