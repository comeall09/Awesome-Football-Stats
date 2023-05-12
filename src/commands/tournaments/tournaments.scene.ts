import { IUserSessionData } from './../../context/context.interface';
import { Scenes } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { IContextBot } from '../../context/context.interface';

import { fetchStandings } from '../../services/tournaments/standings.service';
import { fetchPlayersStats } from '../../services/tournaments/playersStats.service';

import { allLeaguesKeyboard, mainLeaguesKeyboard } from './keyboards';
import { errorMsg, timeoutMsg } from '../helpers';
import { checkers } from './helpers';

export const tournamentsScene = new Scenes.BaseScene<IContextBot>('tournamentsScene');

tournamentsScene.enter(async (ctx) => {
    await ctx.reply('Выберите интересующий турнир:', {
        reply_markup: { inline_keyboard: mainLeaguesKeyboard },
    });
});

tournamentsScene.action(checkers.isTournamentsAction, async (ctx) => {
    const { tournament: { league } } = ctx.session.data.find(({userId}) => userId === ctx.callbackQuery.from.id) ?? {} as IUserSessionData;

    try {
        await ctx.answerCbQuery(timeoutMsg);
        await ctx.editMessageText('Подготавливаем данные...');

        const standingsButtons = await fetchStandings(league);
        if (standingsButtons) {
            await ctx.editMessageText(
                'Турнирная таблица:\nВыберите клуб для получения подробной статистики',
                { parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: standingsButtons.reduce((btns: InlineKeyboardButton[][], { Rank, Squad }) => {
                            const button = [{ text: `${Rank}. ${Squad}`, callback_data: `team-${Squad}` }];
                            return [...btns, button];
                        }, []),
                     }
                });
        } else {
            throw new Error('template not found');
        }
    } catch (error) {
        await ctx.editMessageText(errorMsg);
    } finally {
        await ctx.answerCbQuery();
    }
});

tournamentsScene.action(checkers.isTeamAction, async (ctx) => {
    const { tournament: { league, team } } = ctx.session.data.find(({userId}) => userId === ctx.callbackQuery.from.id) ?? {} as IUserSessionData;

    try {
        const { template, team: { Squad } } = await fetchStandings(league, team);
        await ctx.reply(template, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Статистика игроков', callback_data: `playersStats-${Squad}`}]
                ]
            }
        });
    } catch (error) {
        await ctx.reply(errorMsg);
    } finally {
        await ctx.answerCbQuery();
    }
});

tournamentsScene.action('other-tournaments', async (ctx) => {
    await ctx.editMessageText('Выберите интересующий турнир:', {
        reply_markup: { inline_keyboard: allLeaguesKeyboard },
    });
    await ctx.answerCbQuery();
});

tournamentsScene.action(checkers.isPlayersStatsAction, async (ctx) => {
    const { tournament: { league, team } } = ctx.session.data.find(({userId}) => userId === ctx.callbackQuery.from.id) ?? {} as IUserSessionData;
    let msgId;
    let playersButtons;

    try {
        await ctx.answerCbQuery(timeoutMsg);
        const { message_id } = await ctx.reply('Подготовавливаем данные игроков...');
        msgId = message_id;
        playersButtons = await fetchPlayersStats(league, team.trim());
    } catch (error) {
        await ctx.answerCbQuery();
        await ctx.deleteMessage(msgId);
        await ctx.editMessageText(errorMsg);
        return;
    }

    await ctx.deleteMessage(msgId);
    if(playersButtons && playersButtons.length) {
        try {
            await ctx.reply(
                'Выберите интересующего игрока:',
                {
                    reply_markup: {
                        inline_keyboard: playersButtons.map(({ Nation, Player, Squad }) => ([{text: `${Nation} ${Player}`, callback_data: `playerInfo-${Player}-${Squad}`}]))
                    }
                }
            );
        } catch (error) {
            await ctx.editMessageText(errorMsg);
        }
    } else {
        await ctx.editMessageText(errorMsg);
    }
    await ctx.answerCbQuery();
});

tournamentsScene.action(checkers.isPlayerAction, async ctx => {
    const { tournament: { league, team, player } } = ctx.session.data.find(({userId}) => userId === ctx.callbackQuery.from.id) ?? {} as IUserSessionData;

    const template = await fetchPlayersStats(league, team, player);
    await ctx.answerCbQuery();
    await ctx.reply(template, { parse_mode: 'Markdown' });
});
