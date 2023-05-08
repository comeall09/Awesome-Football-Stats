import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { IContextBot } from '../../context/context.interface';

import { Scene } from '../scene.class';
import { Tournaments } from '../../entities/tournaments.interface';
import { TournamentsService } from '../../services/tournaments/tournaments.service';
import { allLeaguesKeyboard, mainLeaguesKeyboard } from './keyboards';
import { errorMsg, timeoutMsg } from '../helpers';

export class TournamentsScene extends Scene {
    // при клике на Другие лиги, сохраняем айдишки, чтоб потом удалить
    private tournament: Tournaments;

    constructor() {
        super('tournamentsScene');
        this.open();
    }

    open(): void {
        this.scene.enter(async (ctx) => {
            await ctx.reply('Выберите интересующий турнир:', {
                reply_markup: { inline_keyboard: mainLeaguesKeyboard },
            });
        });

        this.actions();
    }

    actions() {
        const tournamentsService = new TournamentsService();

        this.scene.action(this.checkers.isTournamentsAction, async (ctx) => {
            const { tournament } = ctx.state as { tournament: Tournaments};
            // сохраняем тип турнира при первом выборе, дальше не меняем
            this.tournament = tournament;

            try {
                await ctx.answerCbQuery(timeoutMsg);
                await ctx.editMessageText('Подготавливаем данные...');
                await tournamentsService.fetchTeamsStats(this.tournament);
                const teamsBtns = tournamentsService.teamsButtons;
                if (teamsBtns) {
                    await ctx.editMessageText(
                        'Турнирная таблица:\nВыберите клуб для получения подробной статистики',
                        { parse_mode: 'Markdown',
                            reply_markup: {
                                inline_keyboard: teamsBtns.reduce((btns: InlineKeyboardButton[][], { Rank, Squad }) => {
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

        this.scene.action(this.checkers.isTeamAction, async (ctx) => {
            const teamRank = await ctx.state.data;

            if (tournamentsService.teamsButtons.find(({ Rank }) => Rank === teamRank)) {
                try {
                    const { template, team: { Rank } } = tournamentsService.getTeamTemplate(teamRank);
                    await ctx.reply(template, {
                        parse_mode: 'Markdown',
                        reply_markup: {
                            inline_keyboard: [
                                [{text: 'Статистика игроков', callback_data: `playersStats-${Rank}`}]
                            ]
                        }
                    });
                } catch (error) {
                    await ctx.reply(errorMsg);
                } finally {
                    await ctx.answerCbQuery();
                }
            } else {
                await ctx.reply(errorMsg);
                await ctx.answerCbQuery();
            }
        });

        this.scene.action('other-tournaments', async (ctx) => {
            await ctx.editMessageText('Выберите интересующий турнир:', {
                reply_markup: { inline_keyboard: allLeaguesKeyboard },
            });
            await ctx.answerCbQuery();
        });

        this.scene.action(this.checkers.isPlayersStatsAction, async (ctx) => {
            const teamRank: string = await ctx.state.teamRank;
            let msgId;

            try {
                await ctx.answerCbQuery(timeoutMsg);
                const { message_id } = await ctx.reply('Подготовавливаем данные игроков...');
                msgId = message_id;
                await tournamentsService.fetchPlayersStats(this.tournament, teamRank);
            } catch (error) {
                await ctx.answerCbQuery();
                await ctx.deleteMessage(msgId);
                await ctx.editMessageText(errorMsg);
                return;
            }

            const playersButtons = tournamentsService.playersButtons;
            await ctx.deleteMessage(msgId);
            if(playersButtons && playersButtons.length) {
                try {
                    await ctx.reply(
                        'Выберите интересующего игрока:',
                        {
                            reply_markup: {
                                inline_keyboard: playersButtons.map(({ Nation, Player }) => ([{text: `${Nation} ${Player}`, callback_data: `player-info-${Player}`}]))
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

        this.scene.action(this.checkers.isPlayerAction, async ctx => {
            const player = await ctx.state.data;
            const { template } = tournamentsService.getPlayerTemplate(player);
            await ctx.answerCbQuery();
            await ctx.reply(template, {parse_mode: 'Markdown'});
        });

    }

    checkers = {
        isTournamentsAction(val: string, ctx: IContextBot): RegExpExecArray | null {
            // при первом клике сохраняем выбранный турнир
            if (Object.values(Tournaments).includes(val as Tournaments)) {
                ctx.state.tournament = val;
                return {} as RegExpExecArray;
            } else if (val === 'backToTeams') {
                return {} as RegExpExecArray;
            }
            return null;
        },

        isTeamAction(val: string, ctx: IContextBot): RegExpExecArray | null {
            if (val.startsWith('team')) {
                if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
                    ctx.state.data = ctx.callbackQuery.data.slice(5); // slice "team-"
                }
                return {} as RegExpExecArray;
            }
            return null;
        },

        isPlayersStatsAction(val: string, ctx: IContextBot): RegExpExecArray | null {
            if(val.startsWith('playersStats')) {
                if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
                    ctx.state.teamRank = ctx.callbackQuery.data.slice(13); // slice "playersStats-"
                }
                return {} as RegExpExecArray;
            }
            return null;
        },

        isPlayerAction(val: string, ctx: IContextBot): RegExpExecArray | null {
            if(val.startsWith('player-info-')) {
                if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
                    ctx.state.data = ctx.callbackQuery.data.slice(12); // slice "player-info-"
                }
                return {} as RegExpExecArray;
            }
            return null;
        }
    };
}