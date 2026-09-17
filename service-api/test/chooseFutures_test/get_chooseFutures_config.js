import { base_url } from "../main.js";

async function get_chooseFutures_config() {
    try {
        const respone = await fetch(base_url + `/api/chooseFutures/config`);

        if(!respone.ok)
            throw new Error(respone.status);

        const result = await respone.json();

        console.log(result)
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}

get_chooseFutures_config();
