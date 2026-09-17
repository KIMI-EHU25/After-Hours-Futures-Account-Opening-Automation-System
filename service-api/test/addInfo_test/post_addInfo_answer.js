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
                "name" : "张三",
                "idCardNumber" : "110101199003071233",
                "idCardAddress" : "北京市东城区示例路1号101室",
                "idCardValidPeriodStart" : "2026-03-03",
                "idCardValidPeriodEnd" : "2036-03-03",
                "ifIdCardPermanentlyValid" : false,
                "contactAddressProvince" : "156310000",
                "contactAddressCity" : "156310105",
                "contactAddress" : "北京市东城区示例路1号101室",
                "postalCode" : "200000",
                "departmentProvince" : "湖北省",
                "departmentCity" : "武汉市",
                "departmentCategory" : "0",
                "departmentName" : "2015",
                "contactnumber" : "13900000000",
                "emailAddress" : null,
                "occupation" : "537",
                "educationalQualification" : "3",
                "ifIntermediary" : false,
                "intermediaryName" : null,
                "intermediaryCode" : null,
                "referencePersonCode" : null,
                "referencePersonName" : null,
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
