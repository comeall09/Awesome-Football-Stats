import { IContextBot } from './../context/context.interface';
import { LeaguesDict } from './../utils/dict';
import { Tournaments } from '../entities/tournaments.interface';
import { TournamentsService } from '../services/tournaments.service';
import { Scene } from './scene.class';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';

export class TournamentsScene extends Scene {
    private msgData = { messageId: 0, chatId: 0 };
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
                reply_markup: { inline_keyboard: keyboards },
            });
            this.msgData.messageId = message_id;
            this.msgData.chatId = id;
        });

        // actions
        this.scene.action(this.isTournamentsStep, async (ctx) => {
            const tournament = (await ctx.state.tournament) as Tournaments;
            // сохраняем тип турнира при первом клике, больше не меняем
            this.tournament = tournament ?? this.tournament;

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
                            const button = [{ text: `${Rank}: ${Squad}`, callback_data: `${Rank}` }];
                            return [...btns, button];
                        }, []),
                    });
                } else {
                    throw new Error('template not found');
                }
            } catch (error) {
                await ctx.telegram.editMessageText(this.msgData.chatId, this.msgData.messageId, '', {
                    text: 'Что-то пошло не так... попробуйте позже',
                });
            } finally {
                ctx.answerCbQuery();
            }
        });

        this.scene.action(this.isTeamsStep, async (ctx) => {
            const teamRank = ctx.state.teamRank;

            if (tournamentsService.template.find(({ Rank }) => Rank === teamRank)) {
                try {
                    const teamTemplate = await tournamentsService.getTeamInfo(teamRank);
                    await ctx.reply(teamTemplate, {
                        parse_mode: 'Markdown',
                    });
                } catch (error) {
                    ctx.reply('Что-то пошло не так.. попробуйте позже');
                } finally {
                    ctx.answerCbQuery();
                }
            } else {
                ctx.reply('Что-то пошло не так.. попробуйте позже');
                ctx.answerCbQuery();
            }
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
        if (!Object.values(Tournaments).includes(val as Tournaments)) {
            if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
                ctx.state.teamRank = ctx.callbackQuery.data;
            }
            return {} as RegExpExecArray;
        }
        return null;
    }
}

const keyboards = [
    // [{ text: LeaguesDict['UEFA Champions League'], callback_data: 'UCL' }],
    [
        { text: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 АПЛ', callback_data: Tournaments.EPL },
        { text: LeaguesDict['Primera Division'], callback_data: Tournaments.LALIGA },
    ],
    [
        { text: LeaguesDict['Serie A'], callback_data: Tournaments.SERIEA },
        { text: LeaguesDict.Bundesliga, callback_data: Tournaments.BUNDESLIGA },
        { text: LeaguesDict['Ligue 1'], callback_data: Tournaments.LIGUE1 },
    ],
];
