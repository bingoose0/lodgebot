import { ChatInputCommandInteraction, CacheType, SlashCommandSubcommandBuilder, SlashCommandStringOption, escapeMarkdown } from "discord.js";
import Command from "../../../util/module/Command";
import Account from "../../../schema/Account";
import Company, { CompanyRole } from "../../../schema/Company";
import { validateCompanyName } from "../../../util/Utils";

export default class Create extends Command {
    name = "create";
    description: string = "Creates a company (you must not be in one first).";

    modifyBuilder(builder: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder {
        return builder.addStringOption(new SlashCommandStringOption().setName("name").setDescription("Company name").setRequired(true));
    }

    async onExecute(interaction: ChatInputCommandInteraction<CacheType>) {
        await interaction.deferReply({ ephemeral: true });

        const name = interaction.options.getString("name", true);

        const id = interaction.user.id;
        const account = await Account.findOne({ id: id }).exec();
        if( !account) {
            await interaction.editReply({ content: ":x: **You do not have an economy account.**" }); 
            return;
        }

        const company = await Company.findOne({ members: { $elemMatch: { accountId: account._id } } }).exec();
        if (company) {
            await interaction.editReply({ content: ":x: **You're already in a company.**" }); 
            return;
        }

        if (!validateCompanyName(name)) {
            await interaction.editReply({ content: ":x: **Company name is invalid. (cannot have markdown)**"});
            return;
        }

        const companyNew = new Company({
            id: id,
            balance: 0,
            name: name,
            ownerID: account._id,
            members: [
                {
                    accountId: account._id,
                    role: "owner"
                }
            ]
        });

        await companyNew.save();
        
        await interaction.editReply({ content: `:white_check_mark: **Successfully created *${escapeMarkdown(name)}*!**` });
    }   
}