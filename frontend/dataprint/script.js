import { requestJson, setStatus } from "../utils/api.js";

const output = document.querySelector("#json-output");
const statusElement = document.querySelector("#status");

async function loadData() {
    try {
        const data = await requestJson("/api/jsinject/data?uid=1");
        output.textContent = JSON.stringify(data, null, 2);
        setStatus(statusElement, "数据读取成功。", "success");
    } catch (error) {
        output.textContent = "暂无可显示的数据。";
        setStatus(statusElement, error.message, "error");
    }
}

loadData();
