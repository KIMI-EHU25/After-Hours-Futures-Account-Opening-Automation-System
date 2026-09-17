import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { base_url } from "../main.js"

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const tokenPath = path.join(currentDir, 'refresh_token.txt');

async function register() {
    try {
        const refresh_token = fs.readFileSync(tokenPath, 'utf8').trim();

        const response = await fetch(base_url + "/api/auth/refresh" , {
            method : "POST",
            headers : {
                "content-type" : "application/json"
            },
            body : JSON.stringify({
                "refresh_token" : refresh_token  // 此处需要根据 login.js 的返回结果填入
            })
        });

        if(!response.ok)
            throw new Error(response.status);

        const result = await response.json();

        console.log(result);
    } catch (error) {
        console.log(error);
    }
}

register();
