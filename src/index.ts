import { Bot } from './Bot';
import { ConfigService } from './config/config.service';

const bot = new Bot(new ConfigService());
bot.init();
