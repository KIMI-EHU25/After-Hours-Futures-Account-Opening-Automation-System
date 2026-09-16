import { base_url } from "../main.js";

async function get_launderingBack_config() {
    try {
        const respone = await fetch(base_url + `/api/launderingBack/config`);

        if(!respone.ok)
            throw new Error(respone.status);

        const result = await respone.json();

        console.log(result)
    } catch (error) {
        console.log(error.message);
    }
}

get_launderingBack_config();