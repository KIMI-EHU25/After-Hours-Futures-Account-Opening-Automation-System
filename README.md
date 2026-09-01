# 夜盘开户项目

`service-js/` : JS 服务器
前端 (即 app ) 访问 `http://......:8001/script/main.js` 获取 js 代码
由 app 实现 js 注入

启动方式
```bash
cd service-js
python -m venv .venv
.venv/scripts/activate
python -m pip install -r requirements.txt
fastapi dev app/server.py --host 0.0.0.0 --port 8001
```

目前注入的 js 代码中还未加入请求后端获取 data 的逻辑，仍使用本地模拟数据 data

---

`service-api/` : python 后端服务器 

未添加数据库逻辑
`main.js` 中后续添加请求该后端服务器的逻辑
请求地址 `http://......:8000/data`

启动方式
```bash
cd service-api
python -m venv .venv
.venv/scripts/activate
python -m pip install -r requirements.txt
fastapi dev app/main.py --host 0.0.0.0 --port 8000
```

返回 `data json`

---

`docs/` : 包括 `业务流.md` ，以及两份对照表
```
行政区划代码对照.md
职业和学历代码对照.md
```

这两分对照表对应业务逻辑中 `Page 7` 填写资料时**省，市，职业，学历**四个字段的选项与其代码的对照关系，目前本地模拟数据 `data` 中存这四个字段时存代码而非字符串

行政区划代码对照表中，市级行政区代码对照表只有上海市的市级行政区代码对照表，其他省的市级行政区代码对照后续添加

---

`test_for_JsInject` : 用于验证 JS 注入可行性

---

`app-release.apk` : 用于测试的 Android 安装包