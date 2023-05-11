import { Scenes } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { IContextBot } from '../../context/context.interface';

import { StandingsService } from '../../services/tournaments/standings.service';
import { PlayersStatsService } from '../../services/tournaments/playersStats.service';

import { Tournaments } from '../../entities/tournaments.interface';
import { allLeaguesKeyboard, mainLeaguesKeyboard } from './keyboards';
import { errorMsg, timeoutMsg } from '../helpers';
import { checkers } from './helpers';

export const tournamentsScene = new Scenes.BaseScene<IContextBot>('tournamentsScene');

const standingsService = new StandingsService();
const playersStatsService = new PlayersStatsService();

tournamentsScene.enter(async (ctx) => {
    await ctx.reply('Выберите интересующий турнир:', {
        reply_markup: { inline_keyboard: mainLeaguesKeyboard },
    });
});

let tournamentBackup: Tournaments;

tournamentsScene.action(checkers.isTournamentsAction, async (ctx) => {
    const { tournament } = ctx.state as { tournament: Tournaments};
    // сохраняем тип турнира при первом выборе, дальше не меняем
    tournamentBackup = tournament;

    try {
        await ctx.answerCbQuery(timeoutMsg);
        await ctx.editMessageText('Подготавливаем данные...');
        await standingsService.fetch(tournament);
        const standingsButtons = standingsService.standingsButtons;
        if (standingsButtons) {
            await ctx.editMessageText(
                'Турнирная таблица:\nВыберите клуб для получения подробной статистики',
                { parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: standingsButtons.reduce((btns: InlineKeyboardButton[][], { Rank, Squad }) => {
                            const button = [{ text: `${Rank}. ${Squad}`, callback_data: `team-${Rank}` }];
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
    const teamRank = await ctx.state.teamRank;

    try {
        const { template, team: { Squad } } = standingsService.getStandingTeamTemplate(teamRank);
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
    const teamName: string = await ctx.state.teamName;
    let msgId;

    try {
        await ctx.answerCbQuery(timeoutMsg);
        const { message_id } = await ctx.reply('Подготовавливаем данные игроков...');
        msgId = message_id;
        await playersStatsService.fetch(tournamentBackup, teamName.trim());
        // await tournamentsService.fetchPlayersStats(this.tournament, teamRank);
    } catch (error) {
        await ctx.answerCbQuery();
        await ctx.deleteMessage(msgId);
        await ctx.editMessageText(errorMsg);
        return;
    }

    const playersButtons = playersStatsService.getPlayersButtons();
    // const playersButtons = tournamentsService.playersButtons;
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
    const player = await ctx.state.player;
    const squad = await ctx.state.squad;

    const template = playersStatsService.getPlayerTemplate(squad, player);
    await ctx.answerCbQuery();
    await ctx.reply(template, { parse_mode: 'Markdown' });
});
