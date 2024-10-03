export function validateCompanyName(name: string): boolean {
    return !name.match(/^\|.*\|\n\|\s*[:-]+[\s\S]*\|.*\|$/gm);
}