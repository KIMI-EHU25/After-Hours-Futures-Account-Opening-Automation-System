import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";


const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

export const TOKEN_FILE_PATH = path.resolve(
    currentDir,
    "..",
    "test_token.json",
);


function requireToken(value, fieldName) {
    if (typeof value !== "string" || value.length === 0) {
        throw new Error(`${fieldName} 必须是非空字符串`);
    }

    return value;
}


function readTokenFile() {
    if (!fs.existsSync(TOKEN_FILE_PATH)) {
        return {};
    }

    try {
        return JSON.parse(fs.readFileSync(TOKEN_FILE_PATH, "utf8"));
    } catch (error) {
        throw new Error("test/test_token.json 不是有效的 JSON", {
            cause: error,
        });
    }
}


function writeTokenFile(tokens) {
    fs.writeFileSync(
        TOKEN_FILE_PATH,
        `${JSON.stringify(tokens, null, 2)}\n`,
        "utf8",
    );
}


export function readAccessToken() {
    const tokens = readTokenFile();
    return requireToken(tokens.access_token, "access_token");
}


export function readRefreshToken() {
    const tokens = readTokenFile();
    return requireToken(tokens.refresh_token, "refresh_token");
}


export function writeAccessToken(access_token) {
    const tokens = readTokenFile();
    tokens.access_token = requireToken(access_token, "access_token");
    writeTokenFile(tokens);
}


export function writeRefreshToken(refresh_token) {
    const tokens = readTokenFile();
    tokens.refresh_token = requireToken(refresh_token, "refresh_token");
    writeTokenFile(tokens);
}
