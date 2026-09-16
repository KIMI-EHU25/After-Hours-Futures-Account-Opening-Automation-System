import { base_url } from "../main.js";

async function post_launderingBack_answer() {
    try {
        const response = await fetch(base_url + "/api/launderingBack/answer" , {
            method : "POST",
            headers : {
                "content-type" : "application/json"
            },
            body : JSON.stringify({
                "uid" : 1,
                "p1" : "A",
                "p2" : "A",
                "p3" : "A",
                "p4" : "A",
                "p5" : "A",
                "p6" : "A",
                "p7" : "A",
                "p8" : "A",
                "p9" : "A"
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

post_launderingBack_answer();