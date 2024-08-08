import { ChatInputCommandInteraction, CacheType, Embed, EmbedBuilder, Colors } from "discord.js";
import Command from "../../../util/module/Command";

export default class Info extends Command {
    name = "info";
    description: string = "Returns info for the bot";
    
    async onExecute(interaction: ChatInputCommandInteraction<CacheType>) {
        const embed = new EmbedBuilder()
            .setTitle("Bot Info")
            .addFields(
                {
                    name: "Version",
                    value: this.bot.config.version
                }
            )
            .setColor(Colors.Red);
        
        interaction.reply({ embeds: [embed], ephemeral: true });
    }
}