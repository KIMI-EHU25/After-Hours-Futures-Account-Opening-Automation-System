import { base_url } from "../main.js";

async function get_city_code() {
    try {
        const response = await fetch(base_url + "/api/code/city");
        if(!response.ok)
            throw new Error(response.status);

        const result = await response.json();

        console.log("数量：" + result.length);
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}

get_city_code();
