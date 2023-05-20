import { Scenes } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { IContextBot, IUserSessionData } from '../../../context/context.interface';

import { Tournaments } from '../../../entities/tournaments.interface';
import { errorMsg, timeoutMsg } from '../../helpers';
import { actions, checkers } from '../helpers';
import { statisticsDict, tournamentsDict } from '../../../utils/dict';

import { fetchStandings } from '../../../services/tournaments/standings.service';
import { fetchStatistics } from '../../../services/tournaments/statistics.service';
import { fetchPlayersStats } from '../../../services/tournaments/playersStats.service';
import { startInteraction } from '../../../dbStat';

const leagueFlag = (league: Tournaments) => tournamentsDict[league].split(' ')[0];

export const leagueScene = new Scenes.BaseScene<IContextBot>('leagueScene');

leagueScene.enter(async (ctx) => {
    const { tournament: { league } } = ctx.session.data.find(({ userId }) => userId === ctx.callbackQuery?.from.id) ?? {} as IUserSessionData;

    await ctx.editMessageText(`${tournamentsDict[league]}:`, {
        reply_markup: {
            inline_keyboard: [
                [{ text: '📈 Турнирная таблица', callback_data: actions.STANDINGS_ACTION }],
                [{ text: '📊 Статистика', callback_data: actions.STATS_ACTION }],
                [{ text: '🔙 Вернуться к чемпионатам', callback_data: actions.BACK_TO_TOURNAMENTS_SCENE }],
            ]
        },
    });
});

leagueScene.action(actions.REENTER_ACTION, async (ctx) => {
    return ctx.scene.reenter();
});

leagueScene.action(actions.STATS_ACTION, async (ctx) => {
    const { tournament: { league } } = ctx.session.data.find(({ userId }) => userId === ctx.callbackQuery.from.id) ?? {} as IUserSessionData;

    try {
        const statsButtons = await fetchStatistics(league, false);
        await ctx.answerCbQuery();

        if(statsButtons.length) {
            await ctx.editMessageText(`${leagueFlag(league)} Выберите интересующий раздел:`, {
                reply_markup: {
                    inline_keyboard: [
                        ...statsButtons.reduce((acc: InlineKeyboardButton[][], statKey, i) => {
                            const button = { text: statisticsDict[statKey] ?? statKey, callback_data: `${actions.STAT_KEY_ACTION}${statKey}` };
                            if (i && i % 2) {
                                const lastItem = acc[acc.length - 1];
                                lastItem.push(button);
                                return [...acc];
                            }
                            return [...acc, [button]];
                        }, []),
                        [
                            { text: '🔙 Вернуться назад', callback_data: actions.REENTER_ACTION },
                            { text: '📊 Больше статистики', callback_data: actions.ADDITIONAL_STATS },
                        ]
                    ]
                }
            });
        } else throw new Error();
    } catch (error) {
        console.log(error);
        // TODO: при fetch с ferbf первая попытка кидает ошибку, хотя по факту все ок
        await ctx.reply('Что-то пошло не так, попробуйте заново');
    }

    const { id, first_name, last_name, username } = ctx.callbackQuery.from ?? {};
    startInteraction({id, first_name, last_name, username, scene: 'league stats' });
});

leagueScene.action(actions.ADDITIONAL_STATS, async (ctx) => {
    const { tournament: { league } } = ctx.session.data.find(({ userId }) => userId === ctx.callbackQuery.from.id) ?? {} as IUserSessionData;

    try {
        const statsButtons = await fetchStatistics(league, true);

        await ctx.answerCbQuery(timeoutMsg);

        if(statsButtons.length) {
            await ctx.editMessageText(`${leagueFlag(league)} Выберите интересующий раздел:`, {
                reply_markup: {
                    inline_keyboard: [
                        ...statsButtons.reduce((acc: InlineKeyboardButton[][], statKey, i) => {
                            const button = { text: statisticsDict[statKey] ?? statKey, callback_data: `${actions.STAT_KEY_ACTION}${statKey}` };
                            if (i && i % 2) {
                                const lastItem = acc[acc.length - 1];
                                lastItem.push(button);
                                return [...acc];
                            }
                            return [...acc, [button]];
                        }, []),
                        [
                            { text: '🔙 Вернуться назад', callback_data: actions.REENTER_ACTION },
                            // { text: '📊 Больше статистики', callback_data: actions.ADDITIONAL_STATS },
                        ]
                    ]
                }
            });
        } else throw new Error();
    } catch (error) {
        console.log(error);
        // TODO: при fetch с ferbf первая попытка кидает ошибку, хотя по факту все ок
        await ctx.reply('Что-то пошло не так, попробуйте заново');
    }
});

leagueScene.action(checkers.isStatKeyAction, async (ctx) => {
    const { tournament: { league } } = ctx.session.data.find(({ userId }) => userId === ctx.callbackQuery.from.id) ?? {} as IUserSessionData;
    const statKey: string = ctx.state.statKey;

    // TODO: addt надо положить и брать из ctx.state
    const stat = await fetchStatistics(league, true, statKey);
    await ctx.answerCbQuery();

    await ctx.reply(
        stat,
        {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        {text: '🔙 Вернуться в начало', callback_data: actions.REENTER_ACTION},
                    ],
                ]
            }
        }
    );
});

leagueScene.action(actions.STANDINGS_ACTION, async (ctx) => {
    const { tournament: { league } } = ctx.session.data.find(({ userId }) => userId === ctx.callbackQuery.from.id) ?? {} as IUserSessionData;

    try {
        await ctx.answerCbQuery(timeoutMsg);
        await ctx.editMessageText('Подготавливаем данные...');

        const standingsButtons = await fetchStandings(league);
        if (standingsButtons) {
            await ctx.editMessageText(
                `${leagueFlag(league)} Турнирная таблица:\nВыберите клуб для получения подробной статистики`,
                {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [...standingsButtons.reduce((btns: InlineKeyboardButton[][], { Rank, Squad, Points }) => {
                            const button = [{ text: `${Rank}. ${Squad}  —  ${Points}`, callback_data: `team-${Squad}` }];
                            return [...btns, button];
                        }, []), [{ text: '🔙 Вернуться назад', callback_data: actions.REENTER_ACTION }]],
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

    const { id, first_name, last_name, username } = ctx.callbackQuery.from;
    startInteraction({id, first_name, last_name, username, scene: 'standings' });
});

leagueScene.action(actions.BACK_TO_TOURNAMENTS_SCENE, async (ctx) => {
    ctx.deleteMessage();
    return ctx.scene.enter('tournamentsScene');
});

leagueScene.action(checkers.isTeamAction, async (ctx) => {
    const { tournament: { league, team } } = ctx.session.data.find(({ userId }) => userId === ctx.callbackQuery.from.id) ?? {} as IUserSessionData;

    try {
        const { template, team: { Squad } } = await fetchStandings(league, team);
        await ctx.reply(template, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '📊 Статистика игроков', callback_data: `playersStats-${Squad}` }]
                ]
            }
        });
    } catch (error) {
        await ctx.reply(errorMsg);
    } finally {
        await ctx.answerCbQuery();
    }
});

leagueScene.action(checkers.isPlayersStatsAction, async (ctx) => {
    const { tournament: { league, team } } = ctx.session.data.find(({ userId }) => userId === ctx.callbackQuery.from.id) ?? {} as IUserSessionData;
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
    if (playersButtons && playersButtons.length) {
        try {
            await ctx.reply(
                'Выберите интересующего игрока:',
                {
                    reply_markup: {
                        inline_keyboard: [
                            ...playersButtons.map(({ Nation, Player, Squad }) => ([{ text: `${Nation} ${Player}`, callback_data: `playerInfo@${Player}@${Squad}` }])),
                            [{ text: '🔙 В начало', callback_data: actions.REENTER_ACTION }]
                        ]
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

leagueScene.action(checkers.isPlayerAction, async ctx => {
    const { tournament: { league, team, player } } = ctx.session.data.find(({ userId }) => userId === ctx.callbackQuery.from.id) ?? {} as IUserSessionData;

    const template = await fetchPlayersStats(league, team, player);
    await ctx.answerCbQuery();
    await ctx.reply(template, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [[{ text: '🔙 В Начало', callback_data: actions.REENTER_ACTION }]]
        }
    });
});
