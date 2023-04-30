import { Markup, Telegraf } from 'telegraf';
import { IContextBot } from '../context/context.interface';
import { Command } from './command.class';
import { scenesKeyboard } from '../utils/scenes.helpers';

export class StartCommand extends Command {
    constructor(bot: Telegraf<IContextBot>) {
        super(bot);
    }

    async handle() {
        this.bot.start(async (ctx) => {
            ctx.reply(
                'Главное меню, выберите интересующий раздел:',
                Markup.keyboard(scenesKeyboard()).oneTime().resize()
            );
        });
    }
}