import { base_url } from "../main.js"

async function get_province_code() {
    try {
        const response = await fetch(base_url + "/api/code/province");
        if(!response.ok)
            throw new Error(response.status);

        const result = await response.json();

        console.log(result);
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}

get_province_code();
