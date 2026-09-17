import { base_url } from "../main.js";
import { readAccessToken } from "../utils/token_file.js";

async function post_chooseFutures_answer() {
    try {
        const response = await fetch(base_url + "/api/chooseFutures/answer" , {
            method : "POST",
            headers : {
                "content-type" : "application/json",
                "Authorization" : "Bearer " + readAccessToken()
            },
            body : JSON.stringify({
                "p1" : "A"
            })
        });

        if(!response.ok)
            throw new Error(response.status);

        const result = await response.json();

        console.log(result);
    } catch (error) {
        console.log(error.message);
    }
}

post_chooseFutures_answer();