import { base_url } from "../main.js";
import {
    readRefreshToken ,
    readAccessToken , 
    writeRefreshToken ,
    writeAccessToken
} from "../utils/token_file.js";

async function logout() {
    try {
        const refresh_token = readRefreshToken();

        const response = await fetch(base_url + "/api/auth/logout" , {
            method : "POST",
            headers : {
                "Authorization" : "Bearer " + readAccessToken(),
                "content-type" : "application/json"
            },
            body : JSON.stringify({
                "refresh_token" : refresh_token
            })
        });

        if (!response.ok)
            throw new Error(response.status);

        const result = await response.json();
        console.log(result);

        writeAccessToken("None");
        writeRefreshToken("None");

    } catch (error) {
        console.error(error);

        writeAccessToken("None");
        writeRefreshToken("None");
        
        process.exitCode = 1;
    }
}

logout();