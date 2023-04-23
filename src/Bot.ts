import { Context, Markup } from 'telegraf';
import { allSportsActions } from './model/leagues';

export class Bot {
    static async init(msg: string, ctx: Context) {
        try {
            await ctx.reply(
                msg,
                Markup.keyboard([
                    [allSportsActions.TOP5_LIVE], // Row1 with 2 buttons
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