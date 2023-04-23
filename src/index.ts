require('dotenv').config();
import { Telegraf, Context } from 'telegraf';
import { Bot } from './Bot';
import { AllSportsService } from './controllers/allSports/services';
import { allSportsActions } from './model/leagues';
import { NormalizedLivescore } from './types/allSports';
import { statsDict } from './utils/dict';

const bot = new Telegraf<Context>(process.env.BOT_TOKEN!);
const hasAccess = (ctx: Context) => {
    // return (
    //     ctx.callbackQuery?.from.id === 1333220153 ||
    //     ctx.chatMember?.from.id === 1333220153 ||
    //     ctx.from?.id === 1333220153
    // );
    return true;
};

bot.use(async (ctx, next) => {
    if (hasAccess(ctx)) {
        next(); // runs next middleware
        return;
    }
    ctx.reply('The bot is under development!');
    return;
});

bot.start(async (ctx) => {
    Bot.init('Главное меню:',ctx);
});

let store: NormalizedLivescore[] = [];

bot.hears(allSportsActions.TOP5_LIVE, async (ctx) => {
    const matches = await AllSportsService.getTop5Livescore();

    if (!matches) {
        ctx.reply('Прямых трансляций сейчас нет!');
        setTimeout(() => {
            Bot.init('Выберите что вас интересует:', ctx);
        }, 500);
        store = [];
    } else {
        store = [...matches].flat(1);
        ctx.reply('Выберите интересующий матч:', {
            reply_markup: {
                inline_keyboard: matches.map((arr) => {
                    return arr.map(({ key, home_team, away_team, final_result }) =>
                        ({ text: `${home_team} ${final_result} ${away_team}`, callback_data: `choose_${key}` ?? '' }));
                }),
                selective: true
            },
        });
    }
});

bot.action(/choose/, (ctx: any) => {
    const input = ctx.update.callback_query.data;
    // отрезаем первые 7 символов - choose_
    const id = input.slice(7);
    const curr = store.find(({ key }) => key == id);

    ctx.sendMessage(`

<b>${curr?.home_team} ${curr?.final_result} ${curr?.away_team}</b>\n
${curr?.home_formation} vs ${curr?.away_formation}
Стадион: ${curr?.stadium}
Судья: ${curr?.referee}\n
${curr?.statistics
            ?.map(
                ({ type, home, away }) => `${statsDict[type] ?? type}: ${home} - ${away}\n`
            )
            .join("")}
`, {parse_mode: 'HTML'});

});

bot.launch();
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
