import { base_url } from "../main.js";


const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;
if (!TEST_USER_PASSWORD) {
    console.error("Set the TEST_USER_PASSWORD environment variable first.");
    process.exit(1);
}

async function register() {
    try {
        const response = await fetch(base_url + "/api/auth/register" , {
            method : "POST",
            headers : {
                "content-type" : "application/json"
            },
            body : JSON.stringify({
                "user_phone" : "13900000000",
                "user_id" : "110101199003071233",
                "user_password" : TEST_USER_PASSWORD
            })
        });

        if(!response.ok)
            throw new Error(response.status);

        const result = await response.json();
        console.log(result);
    } catch (error) {
        console.error(error);
        process.exitCode = 1;
    }
}

register();
