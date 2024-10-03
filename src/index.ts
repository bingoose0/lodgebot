import { GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";
import * as fs from 'fs';
import Bot from "./util/Bot";

if(fs.existsSync(".env")) {
    dotenv.config();
}

const bot = new Bot(GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent);

let token = process.env.DISCORD_TOKEN
if(!token) {
    bot.logger.error(".env.DISCORD_TOKEN does not exist!");
    process.exit(1);
}

bot.run(token);