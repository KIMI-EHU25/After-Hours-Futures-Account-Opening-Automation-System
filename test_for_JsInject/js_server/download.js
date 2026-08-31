let lastUrl = "";

function runYourLogic() {
    if (location.href === lastUrl) return;
    lastUrl = location.href;

    console.log("执行页面逻辑：", location.href);

    main_func();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runYourLogic);
}
else {
    runYourLogic();
}

const rawPushState = history.pushState;
history.pushState = function (...args) {
    const result = rawPushState.apply(this, args);
    runYourLogic();
    return result;
};

const rawReplaceState = history.replaceState;
history.replaceState = function (...args) {
    const result = rawReplaceState.apply(this, args);
    runYourLogic();
    return result;
};

window.addEventListener("popstate", runYourLogic);
window.addEventListener("hashchange", runYourLogic);

// 上面勿动
// =============================
// =============================
// 每次跳转 刷新页面都会触发下面的 main_func 函数

function main_func() {
    window.alert("triggered");

    distinguish_by_pathname();

    return;
}

function distinguish_by_pathname() {
    let pathname = window.location.pathname;

    if (pathname == "/pages/index/index.html") {
        document.getElementById("input-index").value = "now at index.html / js injection succeeded";
    }
    else if (pathname == "/pages/second/second.html") {
        document.getElementById("input-second").value = "now at second.htmt / js injection succeeded"
    }
    
    return;
}