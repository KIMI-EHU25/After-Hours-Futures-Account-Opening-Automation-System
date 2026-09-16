import {base_url} from "../main.js"

async function get_occupation_code() {
    try {
        const response = await fetch(base_url + "/api/code/occupation");
        if(!response.ok)
            throw new Error(response.status);
        const result = await response.json();
        console.log(result);
    } catch (error) {
        console.log(error.message);
    }
}

get_occupation_code();