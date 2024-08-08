import { ChatInputCommandInteraction, CacheType, EmbedBuilder, SlashCommandSubcommandBuilder, SlashCommandStringOption, SlashCommandIntegerOption } from "discord.js";
import Command from "../../../util/module/Command";
import Account from "../../../schema/Account";
import Company, { CompanyRole } from "../../../schema/Company";

export default class Fund extends Command {
    name = "fund";
    description: string = "Funds a company from your account.";

    modifyBuilder(builder: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder {
        return builder.addIntegerOption(new SlashCommandIntegerOption().setName("to_add").setDescription("The amount to add to your company").setRequired(true));
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

        const toAdd = interaction.options.getInteger("to_add", true);
        if(account.balance < toAdd) {
            account.balance -= toAdd;
            company.balance += toAdd;
        }

        await account.updateOne({ balance: account.balance }).exec();
        await company.updateOne({ balance: company.balance }).exec();

        await interaction.editReply({ content: `:white_check_mark: **You successfully funded your company with ${this.bot.currency(toAdd)}.**` });
    }   
}