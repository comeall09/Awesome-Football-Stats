import { TodayMatches } from '../services/todayMatches.service';
import { Scene } from './scene.class';

export class TodayMatchesScene extends Scene {
    constructor() {
        super('todayMatchesScene');
        this.open();
    }

    open(): void {
        this.scene.enter(async (ctx) => {
            const todayMatches = new TodayMatches();
            const {
                chat: { id: chatId },
                message_id,
            } = await ctx.reply('Загружаем матчи...');

            try {
                await todayMatches.fetchMatches();
                if (todayMatches.matches.length && todayMatches.template) {
                    await ctx.telegram.editMessageText(chatId, message_id, '', todayMatches.template, {
                        parse_mode: 'Markdown',
                    });
                    return;
                }
                throw new Error();
            } catch {
                ctx.telegram.editMessageText(chatId, message_id, '', 'На сегодня матчей нет.');
                ctx.scene.leave();
            }
        });

        this.actions();
    }

    actions(): void {
        //
    }

    checkers: undefined;
}