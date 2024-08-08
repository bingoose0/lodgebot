import Bot from "../Bot";
import { Client } from "discord.js";
import Logger from "../Logger";
import CommandManager from "./CommandManager";

export default class Module {
    bot: Bot;
    client: Client;
    logger: Logger;
    commandManager: CommandManager;

    name: string = "";
    path: string = "";
    commandName: string|undefined = undefined;

    constructor(bot: Bot) {
        this.bot = bot;
        this.client = bot.client;
        this.logger = new Logger(this.name);

        this.commandManager = new CommandManager(this);
    }

    async init() {
        await this.commandManager.loadCommands();
    }
}