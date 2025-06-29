# Nofejs Bot

Bot para Telegram con misiones, pistas y gamificación.

## Scripts
- `npm install` para instalar dependencias.
- `npm run build` para compilar TypeScript.
- `npm run start` para iniciar el bot en Railway.
- `npm run dev` para desarrollo local.

## Despliegue en Railway
1. Subir este proyecto a un repositorio en GitHub.
2. Crear variables de entorno en Railway:
   - `TELEGRAM_BOT_TOKEN`
   - `WEBHOOK_URL`
   - `FREE_CHANNEL_ID`
   - `VIP_CHANNEL_ID`
   - `REDIS_URL`
3. Railway detectará automáticamente el Procfile.
4. Deploy automático.
