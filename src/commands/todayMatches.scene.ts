import { IContextBot } from './../context/context.interface';
import { Scenes } from 'telegraf';
import { TodayMatches } from '../services/todayMatches/todayMatches.service';
import { startInteraction } from '../dbStat';

export const todayMatchesScene = new Scenes.BaseScene<IContextBot>('todayMatchesScene');

todayMatchesScene.enter(async (ctx) => {
    const todayMatches = new TodayMatches();

    const { id, first_name, last_name, username } = ctx.message?.from ?? {};
    startInteraction({id, first_name, last_name, username, scene: 'todayMatches' });

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
        todayMatchesScene.leave();
    }

});
