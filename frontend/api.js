const fallbackHost = window.location.hostname || "127.0.0.1";

export const API_BASE_URL = window.API_BASE_URL || `http://${fallbackHost}:8000`;

export async function requestJson(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, options);
    const contentType = response.headers.get("content-type") || "";
    const responseData = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        const detail = typeof responseData === "object"
            ? JSON.stringify(responseData)
            : responseData;
        throw new Error(`请求失败（${response.status}）：${detail || "服务器没有返回错误信息"}`);
    }

    return responseData;
}

export function setStatus(element, message, type = "") {
    element.textContent = message;
    element.className = `status${type ? ` ${type}` : ""}`;
}
