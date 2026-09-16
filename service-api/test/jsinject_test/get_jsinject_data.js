import { base_url } from "../main.js"

async function get_jsinject_data() {
    try {
        const response = await fetch(base_url + "/api/jsinject/data?uid=1" , {
            method : "GET"
        });

        if(!response.ok)
            throw new Error(response.status);

        const result = await response.json();

        console.log(result);
    } catch (error) {
        console.log(error.message);
    }
}

get_jsinject_data();