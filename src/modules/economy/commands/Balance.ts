import { ChatInputCommandInteraction, CacheType, EmbedBuilder } from "discord.js";
import Command from "../../../util/module/Command";
import Account from "../../../schema/Account";

export default class Balance extends Command {
    name = "balance";
    description: string = "Checks your balance.";

    async onExecute(interaction: ChatInputCommandInteraction<CacheType>) {
        await interaction.deferReply({ ephemeral: true });
        const id = interaction.user.id;
        const account = await Account.findOne({ id: id }).exec();
        if(!account) {
            await interaction.editReply({ content: ":x: **You do not have an economy account.**" }); 
            return;
        }

        const balance = this.bot.currency(account?.balance);

        const embedBuilder = new EmbedBuilder()
            .setTitle("Balance")
            .setDescription(`You currently have **${balance}**`);
        
        await interaction.editReply({ embeds: [embedBuilder] })
    }   
}