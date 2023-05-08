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
                if (todayMatches.template) {
                    ctx.telegram.editMessageText(chatId, message_id, '', todayMatches.template, {
                        parse_mode: 'Markdown',
                    });
                    return;
                }
            } catch (error) {
                ctx.telegram.editMessageText(chatId, message_id, '', 'На сегодня матчей нет.');
            }
        });

        this.actions();
    }

    actions(): void {
        //
    }

    checkers: undefined;
}