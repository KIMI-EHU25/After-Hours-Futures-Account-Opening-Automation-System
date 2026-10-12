import { getSession, logout } from "./api.js";

export function initAccountBar() {
    const bar = document.createElement("div");
    bar.className = "account-bar";
    const label = document.createElement("span");
    const home = document.createElement("a");
    home.href = "../index/index.html";
    home.textContent = "返回首页 / 登录";
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "退出登录";
    bar.append(label, home, button);
    document.querySelector("main").prepend(bar);
    const update = () => {
        const session = getSession();
        label.textContent = session ? `已登录：${session.user_phone}` : "尚未登录";
        button.hidden = !session;
    };
    window.addEventListener("authchange", update);
    update();
    button.addEventListener("click", async () => {
        button.disabled = true;
        try {
            await logout();
            window.location.href = home.href;
        } catch (error) {
            label.textContent = `本地已退出；服务端注销失败：${error.message}`;
        } finally {
            button.disabled = false;
        }
    });
}
