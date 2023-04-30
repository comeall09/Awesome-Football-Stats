import { Telegraf } from 'telegraf';
import { IContextBot } from '../context/context.interface';

export abstract class Command {
    bot: Telegraf<IContextBot>;

    constructor(bot: Telegraf<IContextBot>) {
        this.bot = bot;
    }
    abstract handle(): void;
}