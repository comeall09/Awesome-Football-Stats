import { Scenes, session, Telegraf } from 'telegraf';
import { IContextBot } from './context/context.interface';
import { IConfigService } from './config/config.interface';

// commands
import { Command } from './commands/command.class';

// scenes
import { scenesUtils } from './utils/scenes.helpers';
import { TodayMatchesScene, LiveMatchesScene, StartCommand, TournamentsScene } from './commands/index';

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
        // init scenes
        const liveMatchesScene = new LiveMatchesScene();
        const todayMatchesScene = new TodayMatchesScene();
        const tournamentsScene = new TournamentsScene();
        const stage = new Scenes.Stage<IContextBot>([
            liveMatchesScene.scene,
            todayMatchesScene.scene,
            tournamentsScene.scene,
        ]);
        this.bot.use(stage.middleware());

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