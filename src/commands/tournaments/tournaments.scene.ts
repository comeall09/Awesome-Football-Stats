import { Scenes } from 'telegraf';
import { IContextBot } from '../../context/context.interface';

import { allLeaguesKeyboard, mainLeaguesKeyboard } from './keyboards';
import { checkers } from './helpers';

export const tournamentsScene = new Scenes.BaseScene<IContextBot>('tournamentsScene');

const chooseLeague = '🏆 Выберите интересующий турнир:';

tournamentsScene.enter(async (ctx) => {
    await ctx.reply(chooseLeague, {
        reply_markup: { inline_keyboard: mainLeaguesKeyboard },
    });
});

tournamentsScene.action(checkers.isTournamentsAction, async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.scene.leave();
    return ctx.scene.enter('leagueScene');
});

tournamentsScene.action('other-tournaments', async (ctx) => {
    await ctx.editMessageText(chooseLeague, {
        reply_markup: { inline_keyboard: allLeaguesKeyboard },
    });
    await ctx.answerCbQuery();
});
