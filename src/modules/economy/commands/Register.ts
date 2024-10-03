import { ChatInputCommandInteraction, CacheType } from "discord.js";
import Command from "../../../util/module/Command";
import Account from "../../../schema/Account";

export default class Register extends Command {
    name = "register";
    description: string = "Registers your account with the Economy.";

    async onExecute(interaction: ChatInputCommandInteraction<CacheType>) {
        const id = interaction.user.id;
        if(await Account.exists({ id: id })) {
            await interaction.reply({ content: ":x: **You already have an economy account.**", ephemeral: true }); 
            return;
        }

        const account = new Account({
            id: id,
            balance: this.bot.config.defaultBalance
        })
        
        await account.save();

        await interaction.reply({ content: ":white_check_mark: **Success! You now have an account.**"});
    }
}