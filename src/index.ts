import 'dotenv/config';
import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

import { BotHandler } from './bot/BotHandler';
import { UserService } from './services/UserService';
import { MissionService } from './services/MissionService';
import { LoreService } from './services/LoreService';
import { NotificationService } from './services/NotificationService';
import { ChannelService } from './services/ChannelService';

const app = express();
const port = process.env.PORT || 3000;

// Inicializar servicios
const prisma = new PrismaClient();
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

// Inicializar bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, {
  webHook: {
    port: port as number,
    host: '0.0.0.0'
  }
});

// Servicios
const userService = new UserService();
const missionService = new MissionService();
const loreService = new LoreService();
const notificationService = new NotificationService();
const channelService = new ChannelService();

const botHandler = new BotHandler(bot, userService, missionService, loreService, notificationService, channelService);

// Middleware
app.use(express.json());

// Health check
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Webhook endpoint
app.post('/webhook', (req: express.Request, res: express.Response) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Configurar webhook
const webhookUrl = process.env.WEBHOOK_URL + '/webhook';
bot.setWebHook(webhookUrl);

// Inicializar handlers del bot
botHandler.initialize();

// Tareas programadas
if (redis) {
  setInterval(async () => {
    await missionService.generateDailyMissions(''); // Aquí debes pasar el userId real
    console.log('✅ Misiones diarias procesadas');
  }, 24 * 60 * 60 * 1000); // Cada 24 horas
}

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Bot servidor iniciado en puerto ${port}`);
  console.log(`📡 Webhook configurado en: ${webhookUrl}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Cerrando servidor...');
  await prisma.$disconnect();
  if (redis) await redis.disconnect();
  process.exit(0);
});
