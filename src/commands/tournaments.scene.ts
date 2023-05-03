import { IContextBot } from './../context/context.interface';
import { LeaguesDict } from './../utils/dict';
import { Tournaments } from '../entities/tournaments.interface';
import { TournamentsService } from '../services/tournaments.service';
import { Scene } from './scene.class';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';

const errorMsg = 'Что-то пошло не так... попробуйте позже';
export class TournamentsScene extends Scene {
    private msgData = { messageId: 0, chatId: 0 };
    // при клики на Другие лиги, сохраняем айдишки, чтоб потом удалить
    private othersMsgData = { messageId: 0, chatId: 0 };
    private tournament: Tournaments;

    constructor() {
        super('tournamentsScene');
        this.open();
    }

    open(): void {
        const tournamentsService = new TournamentsService();

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

        // actions
        this.scene.action(this.isTournamentsStep, async (ctx) => {
            const tournament = (await ctx.state.tournament) as Tournaments;
            // сохраняем тип турнира при первом клике, больше не меняем
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
                await tournamentsService.fetchStats(this.tournament);
                const template = tournamentsService.template;
                if (template) {
                    await ctx.telegram.editMessageText(this.msgData.chatId, this.msgData.messageId, '', {
                        text: 'Турнирная таблица:\nВыберите клуб для получения подробной статистики',
                    });

                    await ctx.telegram.editMessageReplyMarkup(this.msgData.chatId, this.msgData.messageId, '', {
                        inline_keyboard: template.reduce((btns: InlineKeyboardButton[][], { Rank, Squad }, i) => {
                            const button = [{ text: `${Rank}. ${Squad}`, callback_data: `${Rank}` }];
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

        this.scene.action(this.isTeamsStep, async (ctx) => {
            const teamRank = ctx.state.teamRank;

            if (tournamentsService.template.find(({ Rank }) => Rank === teamRank)) {
                try {
                    const teamTemplate = tournamentsService.getTeamInfo(teamRank);
                    await ctx.reply(teamTemplate, {
                        parse_mode: 'Markdown',
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

        this.scene.action('OTHERS', async (ctx) => {
            const {
                message_id,
                chat: { id },
            } = await ctx.reply('Другие лиги:', {
                reply_markup: { inline_keyboard: otherLeaguesKeyboard },
            });
            ctx.answerCbQuery();
            this.othersMsgData = { messageId: message_id, chatId: id };
        });
    }

    isTournamentsStep(val: string, ctx: IContextBot): RegExpExecArray | null {
        // при первом клике сохраняем выбранный турнир
        if (Object.values(Tournaments).includes(val as Tournaments)) {
            ctx.state.tournament = val;
            return {} as RegExpExecArray;
        } else if (val === 'backToTeams') {
            return {} as RegExpExecArray;
        }
        return null;
    }

    isTeamsStep(val: string, ctx: IContextBot): RegExpExecArray | null {
        // TODO: проверяется делается на Не тип турнира
        // когда добавятся новые разделы, будут проблемы
        if (!Object.values(Tournaments).includes(val as Tournaments) && val !== 'OTHERS') {
            if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
                ctx.state.teamRank = ctx.callbackQuery.data;
            }
            return {} as RegExpExecArray;
        }
        return null;
    }
}

const mainLeaguesKeyboard = [
    // [{ text: LeaguesDict['UEFA Champions League'], callback_data: Tournaments.UCL }],
    [{ text: LeaguesDict['Premier League'], callback_data: Tournaments.EPL }],
    [
        { text: LeaguesDict['Primera Division'], callback_data: Tournaments.LALIGA },
        { text: LeaguesDict.Bundesliga, callback_data: Tournaments.BUNDESLIGA },
    ],
    [
        { text: LeaguesDict['Serie A'], callback_data: Tournaments.SERIEA },
        { text: LeaguesDict['Ligue 1'], callback_data: Tournaments.LIGUE1 },
    ],
    [
    ],
    [
        { text: 'Другие лиги', callback_data: 'OTHERS' },
    ]
];

const otherLeaguesKeyboard = [
    [
        { text: LeaguesDict['Primeira Liga'], callback_data: Tournaments.PRIMEIRALIGA },
        { text: LeaguesDict['Eredivisie'], callback_data: Tournaments.EREDIVISIE },

    ],

    [
        { text: LeaguesDict['Ukrainian Premier League'], callback_data: Tournaments.UKRAINELIGA },
        { text: LeaguesDict['Russian Premier League'], callback_data: Tournaments.RUSSIANLIGA },
    ],

    [
        { text: LeaguesDict['Scottish Premier League'], callback_data: Tournaments.SCOTTISHLIGA },
        { text: LeaguesDict['Belgian Pro League'], callback_data: Tournaments.BELGIANLIGA },
    ],

    [
        { text: LeaguesDict['Turkish Süper Lig'], callback_data: Tournaments.TURKISHLIGA },
        { text: LeaguesDict['Saudi Pro League'], callback_data: Tournaments.SAUDILIGA },

    ],
];