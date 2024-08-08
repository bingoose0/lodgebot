import * as fs from 'fs';
import * as path from "path";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import Module from ".";
import Command from "./Command";
import Bot from "../Bot";

export default class CommandManager {
    module: Module;
    bot: Bot;
    commands: Array<Command> = [];

    constructor(module: Module) {
        this.module = module;
        this.bot = module.bot;
    }

    buildCommand(): SlashCommandBuilder {
        let builder = new SlashCommandBuilder();
        for (const key in this.commands) {
            if (Object.prototype.hasOwnProperty.call(this.commands, key)) {
                const element = this.commands[key];
                
                builder.addSubcommand(element.createBuilder());
            }
        }

        let commandName = this.module.name.toLowerCase();
        if(this.module.commandName) {
            commandName = this.module.commandName.toLowerCase();
        }

        builder.setName(commandName);
        builder.setDescription(`${this.module.name} module`);

        return builder;
    }

    async loadCommand(commandPath: string) {
        const file = await import(commandPath);
        let mod;
        try {
            mod = new file.default(this.bot, this.module);
            if(!(mod instanceof Command)) {
                throw new TypeError();
            }
        } catch (error) {
            this.module.logger.error(`File ${commandPath} is not a command, ignoring...`);
            return;
        }

        await mod.init();
        this.commands.push(mod);
    }

    async loadCommands() {
        const commandsPath = path.join(this.module.path, "commands")
        const dirs = fs.readdirSync(commandsPath);

        for (const key in dirs) {
            if (Object.prototype.hasOwnProperty.call(dirs, key)) {
                const element = dirs[key];
                await this.loadCommand(path.join(commandsPath, element));
            }
        }
    }

    async processCommand(interaction: ChatInputCommandInteraction): Promise<boolean> {
        const commandName = interaction.options.getSubcommand(true);

        for (const key in this.commands) {
            if (Object.prototype.hasOwnProperty.call(this.commands, key)) {
                const element = this.commands[key];
                if(element.name == commandName) {
                    await element.onExecute(interaction);
                    return true;
                }
            }
        }

        return false;
    }
}