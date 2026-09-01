# 项目交接说明

更新时间：2026-09-01

## 目标与边界

本项目用于向官方开户网页注入本地 JavaScript。注入脚本根据 `window.location.pathname` 识别当前页面，按模拟数据填写可自动填写的内容；需要用户亲自完成的操作应保持不自动处理。

主要约束：

- 所有开户、税务、反洗钱、风险测评及个人资料必须以真实情况为准。
- 不要在文档、日志、提交信息中复制真实身份信息、手机号、邮箱等敏感数据。
- `null`、`undefined`、空字符串表示“跳过注入”，不可把它们写成页面文本。
- 保留用户的现有手工改动；当前工作区不是干净状态。

## 当前目录与服务状态

```text
service-js/
  app/
    server.py
    script/
      main.js
  docs/
    pages-pathname.md
    page1.png ... page10.png
service-api/
  README.md
  requirements.txt
docs/
  行政区划代码对照.md
  职业和学历代码对照.md
```

当前 `service-js/app/server.py` 使用 FastAPI，并只返回单一入口脚本：

```text
GET /script/main.js  ->  app/script/main.js
```

响应为 `application/javascript; charset=utf-8`，并带 `Cache-Control: no-store`。

本地启动方式：

```powershell
cd D:\programming\夜盘开户\service-js\app
uvicorn server:app --host 0.0.0.0 --port 8001
```

入口检查地址：`http://127.0.0.1:8001/script/main.js`。


## 页面路径与自动化进度

官方页面基地址：`https://app5.cfmmc.com`。

| 页面 | pathname | 当前状态 |
| --- | --- | --- |
| 1 | `/index` | 未处理 |
| 2 | `/indexselection` | 未处理 |
| 3、4 | `/canahartaLogin` | 有测试性身份证输入逻辑；正式使用应由用户自行输入 |
| 5 | `/idcardUpload` | 空函数，图片上传由用户操作 |
| 6 | `/launderingBack` | 已实现单选、多选注入 |
| 7 | `/addInfo` | 已实现文本、日期、picker、长期有效、居间人注入逻辑；需继续真实网页验证 |
| 8 | `/settleBank` | 空函数，用户自己操作 |
| 9 | `/appropriate` | 空函数，用户自己操作 |
| 10 | `/question` | 全部为问卷单选题，js注入待实现 |

完整路径与页面截图见 `service-js/docs/pages-pathname.md`。

## `main.js` 现有结构

`service-js/app/script/main.js` 当前为单文件脚本，包含：

1. 页面跳转监听：`DOMContentLoaded`、`history.pushState`、`history.replaceState`、`popstate`、`hashchange`。
2. `data`：`p6-launderingBack` 与 `p7-addInfo` 的模拟数据。
3. Page 6 选择题工具：
   - `selectSingleCheckbox(questionText, selectedValue)`
   - `selectMultipleVantCheckboxes(questionText, selectedIndexes)`
4. Page 7 单字段工具：
   - `fillTextField({ label, value })`
   - `fillDateField({ modelKey, value })`
   - `fillPopupPickerField({ modelKey, value, onChange, changeFlagKey, waitOptionsKey, waitForValue })`
   - `fillVantCheckboxField({ value })`
   - `fillVantRadioField({ value })`
   - `waitForPickerOption({ viewModel, optionsKey, value, timeout })`

各 Page 7 工具均只接收一个字段配置对象，不接受字段列表；由 `addInfo()` 按顺序逐项调用。

## Page 6：`/launderingBack`

该页包含税收居民身份、政要人物关系、投资期限、期望收益、账户控制情况、实际受益人、不良诚信记录等单选题，以及投资品种、期货交易类型多选题。

已处理的关键实现点：

- 题目采用页面题干文本定位，避免依赖 Vux 随页面变化的随机 `name`。
- 单选题使用真实点击同步 Vue/Vux 状态。
- Vant 多选不能点击外层 `.van-checkbox`；组件实际绑定点击的是内部 `.van-checkbox__icon` 或 `.van-checkbox__label`。
- 多选必须顺序点击并等待一次事件循环；连续同步点击会使后一次旧状态更新覆盖前一次选择。

## Page 7：`/addInfo`

数据位于 `data["p7-addInfo"]`，分为：

- 普通文本：姓名、证件信息、联系地址、邮编、联系电话、邮箱、居间人信息、推荐人信息。
- 日期：证件有效期起始/结束。
- 联系地址 picker：省、城市/区。
- 开户营业部级联 picker：省、市、类别、营业部。
- 职业、学历 picker。
- 布尔字段：证件是否长期有效、是否存在居间人。

### Vue 页面模型

该页是 Vue/Vux 页面。`getAddInfoViewModel()` 从 `#addInfo.__vue__` 取得页面实例，以便写入 `ruleForm3`。已确认的模型字段包括：

```text
startTime, endTime
sheng, shi
buss1, buss2, buss3, buss4
phoneNumber, contact_mobile, email
profession, educational
```

`nextVueTick()` 用于等待 Vue 完成渲染更新。

### 近期修复与待验证项

已确认并修复的逻辑问题：

1. `longTermCheck()` 在“非长期有效”时会把 `endTime` 重置为当天。当前逻辑对 `false` 只设置 `isLongTerm = false`，再写实际结束日期。
2. 省市与营业部属于异步级联：

```text
联系地址省 -> chooseLinkCity -> 联系地址市
营业部省 -> chooseBranchProvince -> 营业部市
营业部市 -> chooseBranchCity -> 营业部类别
营业部类别 -> chooseBranchType -> 开户营业部
```

3. 页面初始快照可能已有旧的下级列表。当前逻辑会先清空下级列表，再等待本次接口返回的目标 `value`，避免把旧选项误判为新请求结果。
4. 营业部三级关联方法带有 `buss1Flag`、`buss2Flag`、`buss3Flag`；注入前已显式置为 `true`，避免首次调用仅初始化 Flag 而不请求数据。

仍需在真实页面上验证：联系地址市、营业部市/类别/名称在最近一次“清空旧列表后等待”的修复后是否均成功显示。若失败，查看浏览器控制台：

```text
关联 picker 未加载目标选项：
```

这表示页面接口返回的实际 `entryType` 与模拟数据不一致，或当前会话/网络未能返回关联选项。

## 快照提取的选项代码文档

以下文档来自网页快照：

- `docs/行政区划代码对照.md`
  - 当前 picker 的 31 个省级选项代码。
  - 上海市 16 个区的代码。
  - 快照只含上海已展开的下级区域；不要猜测其他省份的城市/区县代码。
- `docs/职业和学历代码对照.md`
  - 职业代码 `500`–`537`。
  - 学历代码 `2`–`5`。

快照还确认了营业部当前所显示的四级值，但这些值属于关联接口输出，应以运行时接口返回为准。

## 已完成的静态验证

- `node --check service-js/app/script/main.js` 已通过（最近一次代码修改后）。
- Page 6 的 HTML 快照与题干、选项结构、Vant checkbox 事件绑定已核对。
- `/addInfo` 快照与字段标签、picker 模型字段、日期行为、关联接口方法已核对。
- FastAPI 当前入口响应曾以 TestClient 验证；任何服务器手工修改后都应再次验证。

## 当前工作区注意事项

截至整理时，`git status --short` 显示：

```text
M  service-js/app/script/main.js
M  service-js/docs/pages-pathname.md
?? service-js/docs/page9.png
?? service-js/docs/page10.png
```

这些改动可能包含用户的手工工作。不要执行 `git reset --hard`、`git checkout --` 或覆盖它们；提交、暂存均需用户明确授权。
不允许主动进行 git add 或 git commit ，这些命令都由用户自己操作
