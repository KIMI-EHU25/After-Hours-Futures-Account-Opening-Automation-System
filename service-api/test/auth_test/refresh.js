import { base_url } from "../main.js"
import {
    readRefreshToken,
    writeAccessToken,
} from "../utils/token_file.js";

async function refresh() {
    try {
        const refresh_token = readRefreshToken();

        const response = await fetch(base_url + "/api/auth/refresh" , {
            method : "POST",
            headers : {
                "content-type" : "application/json"
            },
            body : JSON.stringify({
                "refresh_token" : refresh_token
            })
        });

        if(!response.ok)
            throw new Error(response.status);

        const result = await response.json();
        writeAccessToken(result.access_token);
        console.log("新的 Access Token 已写入 test/test_token.json，Refresh Token 保持不变");
    } catch (error) {
        console.log(error);
    }
}

refresh();
