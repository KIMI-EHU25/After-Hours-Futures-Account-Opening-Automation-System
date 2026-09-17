import { base_url } from "../main.js"

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
    } catch (error) {
        console.log(error);
    }
}

login();