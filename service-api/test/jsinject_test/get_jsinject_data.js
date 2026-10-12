import { base_url } from "../main.js"
import { writeFile } from "node:fs/promises";

const outputFile = new URL("../jsinject_data.json", import.meta.url);

async function get_jsinject_data() {
    try {
        const response = await fetch(base_url + "/api/jsinject/data?uid=2" , {
            method : "GET",
            headers : {
                "Authorization" : "Bearer " + "<JS_INJECT_KEY>"
            }
        });

        if(!response.ok)
            throw new Error(response.status);

        const result = await response.json();

        await writeFile(outputFile, `${JSON.stringify(result, null, 2)}\n`, "utf8");
        console.log("JS 注入数据已写入 test/jsinject_data.json");
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}

get_jsinject_data();
