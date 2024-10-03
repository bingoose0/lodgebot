import { CacheType, CommandInteractionOption } from "discord.js";

export function validateCompanyName(name: string): boolean {
    return !name.match(/^\|.*\|\n\|\s*[:-]+[\s\S]*\|.*\|$/gm);
}

export function interactionOptionArrayToString(arr: readonly CommandInteractionOption<CacheType>[]): string {
    let data = "";
    
    arr.forEach(element => {
        data += `\n${element.name}: ${element.value || "?"}`
    });

    return data;
}