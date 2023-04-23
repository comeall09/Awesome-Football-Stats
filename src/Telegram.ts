require('dotenv').config();
import { Telegram } from 'telegraf';

export const telegram = new Telegram(process.env.BOT_TOKEN!, {});
