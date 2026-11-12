import { base_url } from "../main.js"
import {
    writeAccessToken,
    writeRefreshToken,
} from "../utils/token_file.js";


const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;
if (!TEST_USER_PASSWORD) {
    console.error("Set the TEST_USER_PASSWORD environment variable first.");
    process.exit(1);
}

async function login() {
    try {
        const response = await fetch(base_url + "/api/auth/login" , {
            method : "POST",
            headers : {
                "content-type" : "application/json"
            },
            body : JSON.stringify({
                "user_phone" : "13900000000",
                "user_password" : TEST_USER_PASSWORD
            })
        });

        if(!response.ok)
            throw new Error(response.status);

        const result = await response.json();
        writeAccessToken(result.access_token);
        writeRefreshToken(result.refresh_token);
        console.log(result);
        console.log("Access Token 和 Refresh Token 已写入 test/test_token.json");

    } catch (error) {
        console.error(error);
        process.exitCode = 1;
    }
}

login();
