import { Context, Markup } from 'telegraf';

export class Bot {
    static async init(ctx: Context) {
        try {
            await ctx.reply(
                'Главное меню',
                Markup.keyboard([
                    ['💥Матчи в лайве💥'], // Row1 with 2 buttons
                    // ['button 3', 'button 4'], // Row2 with 2 buttons
                ])
                    .oneTime()
                    .resize()
            );
        } catch (error) {
            console.log(error, 'error');
        }
    }
}