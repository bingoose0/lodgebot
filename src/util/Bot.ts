import { Channel, Client, GatewayIntentBits, Interaction, REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes, SlashCommandBuilder } from "discord.js";
import Logger from "./Logger";
import ModuleManager from "./module/ModuleManager";
import Config from "./Config";
import * as fs from "fs";
import mongoose from "mongoose";
import { interactionOptionArrayToString } from "./Utils";

export default class Bot {
    client: Client;
    rest: REST;
    logger: Logger;
    moduleManager: ModuleManager;
    config: Config;
    
    constructor(...intents: GatewayIntentBits[]) {
        this.client = new Client({ intents: intents });
        this.logger = new Logger("Bot");
        this.moduleManager = new ModuleManager(this);
        this.rest = new REST({ version: '10' });

        this.config = this.loadConfig();
        process.env.DEBUG = this.config.debug ? "1" : "0";
    
        this.createBaseEvents();
    }

    private loadConfig(): Config {
        let path = process.env.CONFIG_FILE || "config.json"

        if(!fs.existsSync(path)) {
            throw new Error(`${path} does not exist`)
        }

        const dataRaw = fs.readFileSync(path).toString();
        const dataJSON = JSON.parse(dataRaw);

        return dataJSON;
    }

    private createBaseEvents() {
        this.client.on("ready", async () => { await this.onReady() });
        this.client.on("interactionCreate", async (i) => { await this.onInteraction(i); });
    }

    private getCommands() {
        let commands: Array<SlashCommandBuilder> = [];
        this.moduleManager.modules.forEach(element => {
            if(element.commandManager.commands.length < 1) return;
    
            commands.push(element.commandManager.buildCommand());
        });

        return commands;
    }

    private async sendLog(content: string) {
        const logChannel = await this.findChannel(this.config.logChannel);
        if(!logChannel || !logChannel.isTextBased()) return;

        await logChannel.send(content);
    }

    private async refreshCommands() {
        if(!this.client.application) {
            throw new TypeError("Client application not loaded");
        }
    
        let commands = this.getCommands();
        let commandData: Array<RESTPostAPIChatInputApplicationCommandsJSONBody> = [] // Why

        commands.forEach(element => {
            commandData.push(element.toJSON());
        });
        
        await this.rest.put(
            Routes.applicationCommands(this.client.application.id),
            { body: commandData }
        )
    }

    private async onReady() {
        this.logger.info("Initializing modules...")

        await this.moduleManager.loadModules();
        this.logger.info("Modules initialized, registering commands...")

        await this.refreshCommands();
        this.logger.info("Commands registered, ready to use!");
    }

    private async onInteraction(interaction: Interaction) {
        if (interaction.isChatInputCommand()) {
            this.moduleManager.modules.forEach(element => {
                if (interaction.commandName != element.commandName) return;

                element.commandManager.processCommand(interaction).catch(error => {
                    if (interaction.deferred) {
                        interaction.editReply(":x: **An error has occured executing this command! This error has been logged.**").then();
                    } else {
                        interaction.reply(":x: **An error has occured executing this command! This error has been logged.**").then();
                    }

                    const content = `Error executing command in module ${element.name}\nArguments:${interactionOptionArrayToString(interaction.options.data)}\nError:\`\`\`${error}\`\`\``;
                    this.sendLog(content).then();
                    this.logger.error(`${error}`);
                });
            });
        }
    }

    private async initMongoose() {
        this.logger.info("Attempting to initialize DB connection...")
        let uri = process.env.MONGODB_URI;
        if(!uri) {
            this.logger.error("Could not initialize DB connection (missing MONGODB_URI). Stopping.")
            process.exitCode = 1;
            return;
        }

        mongoose.connect(uri);
    }

    async findChannel(id: string): Promise<Channel | undefined> {
        const channel = this.client.channels.cache.get(id);
        if (!channel) {
            const fetched = await this.client.channels.fetch(id);
            if(!fetched) return;

            return fetched;
        }

        return channel;
    }
    async run(token: string) {
        this.rest.setToken(token);
        this.logger.info("Calling log-in function...")

        await this.initMongoose();
        return await this.client.login(token);
    }

    currency(value: number) {
        return this.config.currencyFormat.replace("VALUE", value.toString());
    }
}