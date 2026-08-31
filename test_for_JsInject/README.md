# Js Inject Test

启动 `http` 服务器
```bash
cd http_server
python server.py
```
端口 `8000`
手机访问 `http://......:8000`

---

另开一个终端
启动 `js` 服务器
```bash
cd js_server
python -m venv .venv
.venv/scripts/activate
python -m pip install -r requirements.txt
python -m uvicorn server:app --port 8001 --host 0.0.0.0
```
端口 `8001`
手机访问 `http://......:8001/script.js`

---

当前 `js_server/download.js` 文件即为需要注入的js文件

这个文件中 `main_func()` 函数为需要执行的业务逻辑

`js` 文件成功注入后，会在每次刷新页面，或跳转至新页面时执行一次 `mian_func()` 

由于真实开户网站在开户过程中会跳转多个页面，每个页面上都有多个填写字段，因此**需要区分当前处于哪个页面**以填入正确的字段

在 `main_func()` 函数中目前只有一个函数 `distinguish_by_pathname()` ，代表这个函数使用的区分当前页面的逻辑是通过当前页面的路径来判断，后续也可以使用其他区分方式，例如通过检测每个页面上特有的元素来区分

当前前端有两个页面 `pages/index/index.html` 和 `pages/second/second.html` ，在仅两个页面互相跳转的测试中，**js注入测试成功**，每次跳转后都会在 `<input>` 中注入正确的内容