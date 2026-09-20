import { base_url } from "../main.js"
import { readAccessToken } from "../utils/token_file.js";

async function post_addInfo_answer() {
    try {
        const response = await fetch(base_url + "/api/addInfo/answer" , {
            method : "POST",
            headers : {
                "content-type" : "application/json",
                "Authorization" : "Bearer " + readAccessToken()
            },
            body : JSON.stringify({
                "p1" : "张三",
                "p2" : "110101199003071233",
                "p3" : "北京市东城区示例路1号101室",
                "p4" : "2026-03-03",
                "p5" : "2036-03-03",
                "p6" : false,
                "p7" : "156310000",
                "p8" : "156310105",
                "p9" : "北京市东城区示例路1号101室",
                "p10" : "200000",
                "p11" : "湖北省",
                "p12" : "武汉市",
                "p13" : "0",
                "p14" : "2015",
                "p15" : "13900000000",
                "p16" : null,
                "p17" : "537",
                "p18" : "3",
                "p19" : false,
                "p20" : null,
                "p21" : null,
                "p22" : null,
                "p23" : null,
            })
        });

        if(!response.ok)
            throw new Error(response.status);

        const result = await response.json();

        console.log(result);
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}

post_addInfo_answer();
