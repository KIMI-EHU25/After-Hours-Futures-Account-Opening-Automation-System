import { requestJson, setStatus, getSession, saveSession, logout } from "../utils/api.js";

const startButton = document.querySelector("#start-button");
const loginButton = document.querySelector("#login-button");
const registerButton = document.querySelector("#register-button");
const logoutButton = document.querySelector("#logout-button");
const dialog = document.querySelector("#login-dialog");
const form = document.querySelector("#auth-form");
const phone = document.querySelector("#login-phone");
const password = document.querySelector("#login-password");
const idField = document.querySelector("#register-id-field");
const idInput = document.querySelector("#register-id");
const submit = document.querySelector("#login-submit-button");
const switchButton = document.querySelector("#switch-auth-button");
const status = document.querySelector("#auth-status");
const accountStatus = document.querySelector("#account-status");
let mode = "login";
let busy = false;
let continueAfterLogin = false;

function updateAccount() {
    const session = getSession();
    loginButton.hidden = registerButton.hidden = Boolean(session);
    logoutButton.hidden = !session;
    setStatus(accountStatus, session ? `已登录：${session.user_phone}` : "请先登录或注册，再开始填写。");
}

function setMode(nextMode) {
    mode = nextMode;
    const registering = mode === "register";
    document.querySelector("#login-title").textContent = registering ? "注册账号" : "登录";
    document.querySelector(".login-description").textContent = registering
        ? "填写手机号、身份证号和密码创建账号" : "请输入手机号与密码";
    idField.hidden = !registering;
    idInput.disabled = !registering;
    idInput.required = registering;
    password.autocomplete = registering ? "new-password" : "current-password";
    password.value = "";
    submit.textContent = registering ? "注册" : "登录";
    switchButton.textContent = registering ? "已有账号？登录" : "没有账号？注册";
    setStatus(status, "");
}

function openAuth(nextMode) {
    setMode(nextMode);
    dialog.showModal();
}
loginButton.addEventListener("click", () => openAuth("login"));
registerButton.addEventListener("click", () => openAuth("register"));
switchButton.addEventListener("click", () => setMode(mode === "login" ? "register" : "login"));
document.querySelector("#close-login-button").addEventListener("click", () => {
    if (!busy) dialog.close();
});
dialog.addEventListener("cancel", (event) => { if (busy) event.preventDefault(); });
dialog.addEventListener("click", (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (!busy && event.target === dialog && (
        event.clientX < bounds.left || event.clientX > bounds.right
        || event.clientY < bounds.top || event.clientY > bounds.bottom
    )) dialog.close();
});
dialog.addEventListener("close", () => {
    form.reset();
    continueAfterLogin = false;
    setStatus(status, "");
    (getSession() ? logoutButton : loginButton).focus();
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy || !form.reportValidity()) return;
    busy = true;
    submit.disabled = switchButton.disabled = true;
    const body = { user_phone: phone.value.trim(), user_password: password.value };
    if (mode === "register") body.user_id = idInput.value.trim().toUpperCase();
    setStatus(status, mode === "register" ? "正在注册……" : "正在登录……");
    try {
        const result = await requestJson(`/api/auth/${mode}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (mode === "register") {
            setMode("login");
            setStatus(status, "注册成功，请使用刚才的手机号和密码登录。", "success");
            password.focus();
        } else {
            saveSession({ access_token: result.access_token, refresh_token: result.refresh_token,
                user_phone: body.user_phone });
            const proceed = continueAfterLogin;
            dialog.close();
            if (proceed) window.location.href = "../launderingBack/index.html";
        }
    } catch (error) {
        setStatus(status, error.message, "error");
    } finally {
        busy = false;
        submit.disabled = switchButton.disabled = false;
    }
});
startButton.addEventListener("click", () => {
    if (getSession()) window.location.href = "../launderingBack/index.html";
    else { continueAfterLogin = true; openAuth("login"); }
});
logoutButton.addEventListener("click", async () => {
    logoutButton.disabled = true;
    try { await logout(); setStatus(accountStatus, "已退出登录。"); }
    catch (error) { setStatus(accountStatus, `本地已退出；服务端注销失败：${error.message}`, "error"); }
    finally { logoutButton.disabled = false; }
});
window.addEventListener("authchange", updateAccount);
updateAccount();
