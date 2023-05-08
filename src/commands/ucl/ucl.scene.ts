import { playerDict } from './../../utils/dict';
import { timeoutMsg } from './../helpers';
import { Scene } from '../scene.class';
import { UclService } from '../../services/ucl/ucl.service';

export class UclScene extends Scene {

    constructor() {
        super('uclScene');
        this.open();
    }

    open(): void {
        this.scene.enter(async (ctx) => {
            await ctx.reply(
                'Выберите интересующий раздел:',
                { reply_markup: {
                    inline_keyboard: [
                        [
                            // { text: '🔥 Плей-офф', callback_data: 'playOff-stage' },
                            // { text: '📝 Групповой этап', callback_data: 'group-stage' },
                        ],
                        [
                            // { text: '📅 Предстоящие матчи', callback_data: 'matches' },
                            { text: '📊 Статистика', callback_data: 'all-stats' },
                        ],
                    ]
                }}
            );
        });

        this.actions();
    }

    actions() {
        const uclService = new UclService();

        this.scene.action('all-stats', async(ctx) => {
            await ctx.answerCbQuery(timeoutMsg);
            const { message_id } = await ctx.reply('Подготавливаем данные...');
            // await uclService.fetchUCLStats();
            await ctx.deleteMessage(message_id);
            await ctx.editMessageText('Выберите раздел:', {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: playerDict.Goals, callback_data: 'stats-goals' },
                            { text: playerDict.Assists, callback_data: 'stats-assists' },
                            { text: playerDict['Goals + Assists'], callback_data: 'stats-goals-assists' },
                        ],
                        [
                            { text: playerDict.xG, callback_data: 'stats-xg' },
                            { text: playerDict.xAG, callback_data: 'stats-xAG' },
                        ],
                        [
                            { text: 'Ключевые передачи', callback_data: 'stats-key-passes' },
                            { text: '% Успешных передач', callback_data: 'stats-pass-completion' },
                        ],
                        [
                            { text: 'Передачи в финальную треть', callback_data: 'stats-pass-final-third' },
                            { text: 'Сквозные передачи', callback_data: 'stats-through-ball' },
                        ],
                        [
                            { text: 'Проникающие передачи', callback_data: 'stats-progressive-passes' },
                            { text: 'Проникающие передачи', callback_data: 'stats-progressive-passes' },
                        ]
                    ]
                }
            });
        });
    }

    checkers: undefined;

}