import { ChatInputCommandInteraction, CacheType, EmbedBuilder, SlashCommandSubcommandBuilder, SlashCommandStringOption } from "discord.js";
import Command from "../../../util/module/Command";
import Account from "../../../schema/Account";
import Company, { CompanyRole } from "../../../schema/Company";

export default class Create extends Command {
    name = "create";
    description: string = "Creates a company (you must not be in one first).";

    modifyBuilder(builder: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder {
        return builder.addStringOption(new SlashCommandStringOption().setName("name").setDescription("Company name").setRequired(true));
    }

    async onExecute(interaction: ChatInputCommandInteraction<CacheType>) {
        await interaction.deferReply({ ephemeral: true });
        
        const id = interaction.user.id;
        const account = await Account.findOne({ id: id }).exec();
        if(!account) {
            await interaction.editReply({ content: ":x: **You do not have an account.**" }); 
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