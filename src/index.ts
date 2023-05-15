import { Markup, Scenes, session, Telegraf } from 'telegraf';
import { IContextBot } from './context/context.interface';
// init firebase
import './firebase.config';

// scenes
import { scenesUtils, permissions, scenesKeyboard } from './utils/scenes.helpers';
import { leagueScene, todayMatchesScene, tournamentsScene, UclScene } from './commands/index';
import { ConfigService } from './config/config.service';

const uclScene = new UclScene();
const stage = new Scenes.Stage<IContextBot>([
    todayMatchesScene,
    leagueScene,
    tournamentsScene,
    uclScene.scene,
]);

const bot = new Telegraf<IContextBot>(new ConfigService().get('BOT_TOKEN'));

bot.use(session());
bot.use(stage.middleware());
// permissions
// bot.use(async (ctx, next)=> {
//     if("message" in ctx.update) {
//         const userId = ctx.update.message.from.id;
//         const hasPermission = permissions.find(({id}) => id === userId);
//         if(!hasPermission) {
//             await ctx.reply('Для получения доступа, напиши автору бота: @chupapee');
//             return;
//         }
//         return next();
//     }
// });

// bot.use(async (ctx, next) => {
//     console.log(ctx);
//     await next();
// });

bot.catch((err, ctx) => {
    console.log(err, 'INDEX.TS');
    // ctx.reply("Что-то пошло не так... попробуйте позже");
});

bot.start(async (ctx) => {
    ctx.reply(
        'Главное меню, выберите интересующий раздел:',
        Markup.keyboard(scenesKeyboard()).resize()
    );
});

scenesUtils.map(({ name, action }) => {
    bot.hears(action, (ctx) => ctx.scene.enter(name));
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));