import * as fs from "fs";
import * as path from "path";
import Logger from "../Logger";
import Bot from "../Bot";
import Module from ".";

export default class ModuleManager {
    logger: Logger;
    bot: Bot;
    modules: Array<Module> = [];

    constructor(bot: Bot) {
        this.logger = new Logger("ModuleManager");
        this.bot = bot;
    }

    async loadModule(modulePath: string) {
        this.logger.debug(`Found module ${modulePath}`)
        const modRaw = await import(`${modulePath}`);
        let mod;
        try {
            mod = new modRaw.default(this.bot);
            if(!(mod instanceof Module)) {
                throw new Error();
            }
        } catch(e) {
            this.logger.error(e);
            return;
        }

        mod.path = modulePath;
        await mod.init();

        this.modules.push(mod);
    }

    async loadModules() {
        const basePath = path.join(process.cwd(), "src", "modules")
        const dir = fs.readdirSync(basePath);

        for (const key in dir) {
            if (Object.prototype.hasOwnProperty.call(dir, key)) {
                const element = dir[key];
                await this.loadModule(path.join(basePath, element));
            }
        }
    }
}