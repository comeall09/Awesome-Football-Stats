require('dotenv').config();
import { Telegraf, Context } from 'telegraf';
import { Bot } from './Bot';
import { AllSportsService } from './controllers/allSports/services';

const bot = new Telegraf<Context>(process.env.BOT_TOKEN!);
const hasAccess = (ctx: any) => ctx.update.message.from.id === 1333220153;

bot.use(async (ctx, next) => {
    if (hasAccess(ctx)) {
        next(); // runs next middleware
        return;
    }
    ctx.reply('The bot is under development!');
    return;
});

bot.start(async (ctx) => {
    Bot.init(ctx);
});

bot.hears('💥Матчи в лайве💥', async (ctx) => {
    const matches = await AllSportsService.getTop5Livescore();
    matches.forEach((block) => {
      ctx.sendMessage({text: block.join("")}, {parse_mode: 'HTML'});
    });
});

bot.launch();
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
