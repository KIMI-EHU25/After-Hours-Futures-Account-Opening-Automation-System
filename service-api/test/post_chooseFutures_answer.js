import { base_url } from "./main.js"

async function post_chooseFutures_answer() {
    try {
        const response = await fetch(base_url + "/api/chooseFutures/answer" , {
            method : "POST",
            headers : {
                "content-type" : "application/json"
            },
            body : JSON.stringify({
                "uid" : 1,
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