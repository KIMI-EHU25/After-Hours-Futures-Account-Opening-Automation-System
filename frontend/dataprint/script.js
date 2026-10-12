import { requestJson, setStatus, getCurrentUid } from "../utils/api.js";
import { initAccountBar } from "../utils/auth.js";

initAccountBar();

const output = document.querySelector("#json-output");
const statusElement = document.querySelector("#status");

async function loadData() {
    try {
        const data = await requestJson(`/api/jsinject/data?uid=${encodeURIComponent(getCurrentUid())}` , {
            method : "GET",
            headers : {
                "Authorization" : "Bearer <JS_INJECT_KEY>"
            }
        });
        output.textContent = JSON.stringify(data, null, 2);
        setStatus(statusElement, "数据读取成功。", "success");
    } catch (error) {
        output.textContent = "暂无可显示的数据。";
        setStatus(statusElement, error.message, "error");
    }
}

loadData();
