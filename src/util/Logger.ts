import ANSIColor from "./ANSIColor";
export default class Logger {
    name: string = "";

    constructor(name: string) {
        this.name = name;
    }

    createPrefix(level: string, color: string) {
        const now = new Date();
        return `[${now.toTimeString()}] ${ANSIColor.BOLD}${this.name} ${color}${level}${ANSIColor.RESET}`;
    }

    info(...msg: any[]) {
        const prefix = this.createPrefix("INFO", ANSIColor.GREEN)
        return console.log(`${prefix}: ${msg.join(" ")}`);
    }

    warn(...msg: any[]) {
        const prefix = this.createPrefix("INFO", ANSIColor.YELLOW)
        return console.warn(`${prefix}: ${msg.join(" ")}`);
    }

    error(...msg: any[]) {
        const prefix = this.createPrefix("ERROR", ANSIColor.RED)
        return console.error(`${prefix}: ${msg.join(" ")}`);
    }
    
    debug(...msg: any[]) {
        if(process.env.DEBUG != "1") return;
        const prefix = this.createPrefix("DEBUG", ANSIColor.MAGENTA)
        return console.debug(`${prefix}: ${msg.join(" ")}`);
    }
}