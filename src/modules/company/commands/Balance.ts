import { ChatInputCommandInteraction, CacheType, EmbedBuilder } from "discord.js";
import Command from "../../../util/module/Command";
import Account from "../../../schema/Account";
import Company from "../../../schema/Company";

export default class Balance extends Command {
    name = "balance";
    description: string = "Checks the balance of your company.";

    async onExecute(interaction: ChatInputCommandInteraction<CacheType>) {
        await interaction.deferReply({ ephemeral: true });

        const id = interaction.user.id;
        const account = await Account.findOne({ id: id }).exec();
        if(!account) {
            await interaction.reply({ content: ":x: **You do not have an account.**" }); 
            return;
        }

        const company = await Company.findOne({ members: { $elemMatch: { accountId: account._id } } }).exec();
        if(!company) {
            await interaction.editReply({ content: ":x: **You're not in a company.**" }); 
            return;
        }

        const balance = this.bot.currency(company.balance);

        const embedBuilder = new EmbedBuilder()
            .setTitle(company.name)
            .setDescription(`${company.name} currently has **${balance}**`);

        await interaction.editReply({ embeds: [embedBuilder] });
    }   
}