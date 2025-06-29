declare module 'node-telegram-bot-api' {
  import * as events from 'events';

  export default class TelegramBot extends events.EventEmitter {
    constructor(token: string, options?: any);
    public startPolling(options?: any): void;
    public stopPolling(): void;
    public sendMessage(chatId: number | string, text: string, options?: any): Promise<any>;
    public sendPhoto(chatId: number | string, photo: any, options?: any): Promise<any>;
    public sendDocument(chatId: number | string, document: any, options?: any): Promise<any>;
    public sendAudio(chatId: number | string, audio: any, options?: any): Promise<any>;
    public sendVideo(chatId: number | string, video: any, options?: any): Promise<any>;
    public setWebHook(url: string, options?: any): Promise<any>;
    public processUpdate(update: any): void;
    public onText(regex: RegExp, callback: (msg: any, match: RegExpMatchArray | null) => void): void;
    public on(event: string, callback: (msg: any) => void): void;
    public getChatMember(chatId: number | string, userId: number): Promise<any>;
    public createChatInviteLink(chatId: number | string, options?: any): Promise<any>;
  }
}
