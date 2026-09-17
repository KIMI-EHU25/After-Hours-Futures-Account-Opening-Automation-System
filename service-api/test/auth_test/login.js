import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { base_url } from "../main.js"

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const tokenPath = path.join(currentDir, 'refresh_token.txt');

async function login() {
    try {
        const response = await fetch(base_url + "/api/auth/login" , {
            method : "POST",
            headers : {
                "content-type" : "application/json"
            },
            body : JSON.stringify({
                "user_phone" : "13900000000",
                "user_password" : "<password>"
            })
        });

        if(!response.ok)
            throw new Error(response.status);

        const result = await response.json();
        console.log(result);

            // 将 refresh_token 写入文件
            fs.writeFileSync(tokenPath, result.refresh_token, 'utf8');

    } catch (error) {
        console.log(error);
    }
}

login();
