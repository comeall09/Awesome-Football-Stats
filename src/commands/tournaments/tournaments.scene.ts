import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { IContextBot } from '../../context/context.interface';

import { Scene } from '../scene.class';
import { Tournaments } from '../../entities/tournaments.interface';
import { TournamentsService } from '../../services/tournaments/tournaments.service';
import { mainLeaguesKeyboard, otherLeaguesKeyboard } from './keyboards';

const errorMsg = 'Что-то пошло не так... попробуйте позже';

export class TournamentsScene extends Scene {
    private msgData = { messageId: 0, chatId: 0 };
    // при клике на Другие лиги, сохраняем айдишки, чтоб потом удалить
    private othersMsgData = { messageId: 0, chatId: 0 };
    private tournament: Tournaments;

    constructor() {
        super('tournamentsScene');
        this.open();
    }

    open(): void {
        this.scene.enter(async (ctx) => {
            const {
                message_id,
                chat: { id },
            } = await ctx.reply('Выберите интересующий турнир:', {
                reply_markup: { inline_keyboard: mainLeaguesKeyboard },
            });
            this.msgData.messageId = message_id;
            this.msgData.chatId = id;

        });


        this.actions();
    }

    actions() {
        const tournamentsService = new TournamentsService();

        this.scene.action(this.checkers.isTournamentsAction, async (ctx) => {
            const tournament = (await ctx.state.data) as Tournaments;
            // сохраняем тип турнира при первом выборе, дальше не меняем
            this.tournament = tournament ?? this.tournament;

            if (this.othersMsgData.messageId) {
                await ctx.telegram.deleteMessage(this.othersMsgData.chatId, this.othersMsgData.messageId);
                this.othersMsgData.chatId = 0;
                this.othersMsgData.messageId = 0;
            }

            const edited = await ctx.telegram.editMessageText(
                this.msgData.chatId,
                this.msgData.messageId,
                '',
                'Подготавливаем данные...'
            );

            if (edited !== true && ('message_id' && 'chat') in edited) {
                this.msgData.messageId = edited.message_id;
                this.msgData.chatId = edited.chat.id;
            }

            try {
                await tournamentsService.fetchTeamsStats(this.tournament);
                const teamsBtns = tournamentsService.teamsButtons;
                if (teamsBtns) {
                    await ctx.telegram.editMessageText(this.msgData.chatId, this.msgData.messageId, '', {
                        text: 'Турнирная таблица:\nВыберите клуб для получения подробной статистики',
                    });

                    await ctx.telegram.editMessageReplyMarkup(this.msgData.chatId, this.msgData.messageId, '', {
                        inline_keyboard: teamsBtns.reduce((btns: InlineKeyboardButton[][], { Rank, Squad }) => {
                            const button = [{ text: `${Rank}. ${Squad}`, callback_data: `team-${Rank}` }];
                            return [...btns, button];
                        }, []),
                    });
                } else {
                    throw new Error('template not found');
                }
            } catch (error) {
                await ctx.telegram.editMessageText(this.msgData.chatId, this.msgData.messageId, '', {
                    text: errorMsg,
                });
            } finally {
                ctx.answerCbQuery();
            }
        });

        this.scene.action(this.checkers.isTeamAction, async (ctx) => {
            const teamRank = ctx.state.data;

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
                    ctx.reply(errorMsg);
                } finally {
                    ctx.answerCbQuery();
                }
            } else {
                ctx.reply(errorMsg);
                ctx.answerCbQuery();
            }
        });

        this.scene.action('other-tournaments', async (ctx) => {
            const {
                message_id,
                chat: { id },
            } = await ctx.reply('Другие лиги:', {
                reply_markup: { inline_keyboard: otherLeaguesKeyboard },
            });
            ctx.answerCbQuery();
            this.othersMsgData = { messageId: message_id, chatId: id };
        });

        this.scene.action(this.checkers.isPlayersStatsAction, async (ctx) => {
            const teamRank: string = ctx.state.data;
            const tournament = this.tournament;
            await ctx.answerCbQuery();
            const { message_id, chat: { id } } = await ctx.reply('Подготовавливаем данные игроков...');

            await tournamentsService.fetchPlayersStats(tournament, teamRank);
            const playersButtons = tournamentsService.playersButtons;

            if(playersButtons && playersButtons.length) {
                try {
                    await ctx.telegram.editMessageText(
                        id, message_id, '',
                        { text: 'Выберите интересующего игрока:' },
                        {
                            reply_markup: {
                                inline_keyboard: playersButtons.map(({ Nation, Player }) => ([{text: `${Nation} ${Player}`, callback_data: `player-info-${Player}`}]))
                            }
                        }
                    );

                } catch (error) {
                    await ctx.telegram.editMessageText(id, message_id, '', errorMsg);
                }
            } else {
                await ctx.telegram.editMessageText(id, message_id, '', errorMsg);
            }
            ctx.answerCbQuery();
        });

        this.scene.action(this.checkers.isPlayerAction, async ctx => {
            const player = await ctx.state.data;
            const { template } = tournamentsService.getPlayerTemplate(player);
            await ctx.reply(template, {parse_mode: 'Markdown'});
            ctx.answerCbQuery();
        });

    }

    checkers = {
        isTournamentsAction(val: string, ctx: IContextBot): RegExpExecArray | null {
            // при первом клике сохраняем выбранный турнир
            if (Object.values(Tournaments).includes(val as Tournaments)) {
                ctx.state.data = val;
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
                    ctx.state.data = ctx.callbackQuery.data.slice(13); // slice "playersStats-"
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