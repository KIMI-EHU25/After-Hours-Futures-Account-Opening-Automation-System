const fallbackHost = window.location.hostname || "127.0.0.1";

export const API_BASE_URL = window.API_BASE_URL || `http://${fallbackHost}:8000`;

const SESSION_KEY = "openaccount.session";
let refreshPromise = null;

export function getSession() {
    try {
        const session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
        return session?.access_token && session?.refresh_token ? session : null;
    } catch {
        return null;
    }
}

export function saveSession(session) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event("authchange"));
}

export function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event("authchange"));
}

async function sendJson(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, options);
    const contentType = response.headers.get("content-type") || "";
    const responseData = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        const detail = responseData?.detail ?? responseData;
        const message = Array.isArray(detail)
            ? detail.map((item) => `${item.loc?.slice(1).join(".") || "字段"}：${item.msg}`).join("；")
            : typeof detail === "string" ? detail : JSON.stringify(detail);
        const error = new Error(message || `请求失败（${response.status}）`);
        error.status = response.status;
        throw error;
    }

    return responseData;
}

async function refreshAccessToken() {
    if (!refreshPromise) {
        const session = getSession();
        if (!session) throw new Error("请先登录");
        refreshPromise = (async () => {
            try {
                const result = await sendJson("/api/auth/refresh", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refresh_token: session.refresh_token }),
                });
                if (getSession()?.refresh_token !== session.refresh_token) {
                    throw new Error("登录状态已改变，请重试");
                }
                saveSession({ ...session, access_token: result.access_token });
                return result.access_token;
            } catch (error) {
                if ([401, 422].includes(error.status)
                    && getSession()?.refresh_token === session.refresh_token) clearSession();
                throw error;
            } finally {
                refreshPromise = null;
            }
        })();
    }
    return refreshPromise;
}

export async function requestJson(path, options = {}) {
    const { authenticated = false, ...fetchOptions } = options;
    if (!authenticated) return sendJson(path, fetchOptions);
    const session = getSession();
    if (!session) throw new Error("请先返回首页登录，再继续提交");
    const send = (token) => {
        const headers = new Headers(fetchOptions.headers);
        headers.set("Authorization", `Bearer ${token}`);
        return sendJson(path, { ...fetchOptions, headers });
    };
    try {
        return await send(session.access_token);
    } catch (error) {
        if (error.status !== 401) throw error;
        const current = getSession();
        if (!current || current.refresh_token !== session.refresh_token) throw error;
        const token = current.access_token !== session.access_token
            ? current.access_token : await refreshAccessToken();
        try {
            return await send(token);
        } catch (retryError) {
            if (retryError.status === 401
                && getSession()?.refresh_token === session.refresh_token) clearSession();
            throw retryError;
        }
    }
}

export async function logout() {
    const session = getSession();
    try {
        if (session) await requestJson("/api/auth/logout", {
            authenticated: true,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: session.refresh_token }),
        });
    } finally {
        clearSession();
    }
}

export function getCurrentUid() {
    const token = getSession()?.access_token;
    if (!token) throw new Error("请先登录");
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const uid = JSON.parse(atob(payload)).sub;
    if (!/^\d+$/.test(String(uid))) throw new Error("登录信息无效，请重新登录");
    return uid;
}

export function setStatus(element, message, type = "") {
    element.textContent = message;
    element.className = `status${type ? ` ${type}` : ""}`;
}
