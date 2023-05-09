import { Scenes, session, Telegraf } from 'telegraf';
import { IContextBot } from './context/context.interface';
import { IConfigService } from './config/config.interface';
import { FirebaseService } from './firebase.config';

// commands
import { Command } from './commands/command.class';

// scenes
import { scenesUtils, permissions } from './utils/scenes.helpers';
import { TodayMatchesScene, StartCommand, TournamentsScene, UclScene } from './commands/index';

export class Bot {
    bot: Telegraf<IContextBot>;
    private readonly configService: IConfigService;
    commands: Command[] = [];

    constructor(configService: IConfigService) {
        this.configService = configService;
        this.bot = new Telegraf<IContextBot>(this.configService.get('BOT_TOKEN'));
        this.bot.use(session());
    }

    init() {
        // init firebase
        new FirebaseService();
        // init scenes
        const todayMatchesScene = new TodayMatchesScene();
        const tournamentsScene = new TournamentsScene();
        const uclScene = new UclScene();
        const stage = new Scenes.Stage<IContextBot>([
            todayMatchesScene.scene,
            tournamentsScene.scene,
            uclScene.scene,
        ]);
        this.bot.catch((err, ctx) => {
            ctx.reply("Что-то пошло не так... попробуйте позже");
        });
        this.bot.use(stage.middleware());

        this.bot.use(async (ctx, next)=> {
            if("message" in ctx.update) {
                const userId = ctx.update.message.from.id;
                const hasPermission = permissions.find(({id}) => id === userId);
                if(!hasPermission) {
                    await ctx.reply('Для получения доступа, напиши автору бота: @chupapee');
                    return;
                }
                return next();
            }
        });

        this.commands = [new StartCommand(this.bot)];
        for (const command of this.commands) {
            command.handle();
        }

        // scenes listeners
        scenesUtils.map(({ name, action }) => {
            this.bot.hears(action, (ctx) => ctx.scene.enter(name));
        });

        this.bot.launch();

        // Enable graceful stop
        process.once('SIGINT', () => this.bot.stop('SIGINT'));
        process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    }
}