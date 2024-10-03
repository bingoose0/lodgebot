import { ChatInputCommandInteraction, CacheType, SlashCommandSubcommandBuilder, SlashCommandStringOption } from "discord.js";
import Command from "../../../util/module/Command";
import Account from "../../../schema/Account";
import Company from "../../../schema/Company";

export default class Purchase extends Command {
    name = "purchase";
    description: string = "Buys an item and puts it in your company's inventory";

    modifyBuilder(builder: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder {
        return builder.addStringOption(new SlashCommandStringOption().setName("item_name").setDescription("The item name").setRequired(true));
    }

    async onExecute(interaction: ChatInputCommandInteraction<CacheType>) {
        await interaction.deferReply({ ephemeral: true });

        const id = interaction.user.id;
        const account = await Account.findOne({ id: id }).exec();
        if(!account) {
            await interaction.editReply({ content: ":x: **You do not have an economy account.**" }); 
            return;
        }

        const company = await Company.findOne({ members: { $elemMatch: { accountId: account._id } } }).exec();
        if(!company) {
            await interaction.editReply({ content: ":x: **You're not in a company.**" }); 
            return;
        }

    }
}