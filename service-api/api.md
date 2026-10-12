# service-api 接口文档

基础地址：`http://<host>:<port>`

除特别说明外，请求和响应均为 JSON。所有需要登录的接口均使用：

```http
Authorization: Bearer <access_token>
```

登录成功会同时返回 `access_token` 和 `refresh_token`。`uid` 由服务端从 Access Token 中获取，提交答案时不要传入 `uid`。

## 认证

### 注册

`POST /api/auth/register`

请求体：

```json
{
  "user_phone": "13800138000",
  "user_id": "11010519491231002X",
  "user_password": "<password>"
}
```

- `user_phone`：11 至 20 位数字。
- `user_id`：18 位身份证号格式。
- `user_password`：8 至 128 个字符。

成功响应：`201 Created`

```json
{
  "uid": 1,
  "user_phone": "13800138000",
  "is_admin": false
}
```

手机号或身份证号已存在时返回 `409`。

### 登录

`POST /api/auth/login`

请求体：

```json
{
  "user_phone": "13800138000",
  "user_password": "<password>"
}
```

成功响应：`200 OK`

```json
{
  "access_token": "<JWT>",
  "refresh_token": "<64 位十六进制字符串>",
  "token_type": "bearer"
}
```

用户名或密码错误时返回 `401`。

### 刷新 Access Token

`POST /api/auth/refresh`

请求体：

```json
{
  "refresh_token": "<64 位十六进制字符串>"
}
```

成功响应：

```json
{
  "access_token": "<新的 JWT>",
  "token_type": "bearer"
}
```

Refresh Token 不存在、已注销或已过期时返回 `401`。

### 退出登录

`POST /api/auth/logout`

需要 Access Token。

请求体：

```json
{
  "refresh_token": "<当前设备的 64 位十六进制字符串>"
}
```

服务端仅允许注销属于当前 Access Token 用户的、仍有效且未过期的 Refresh Token；成功后该 Refresh Token 不能再用于刷新 Access Token。

成功响应：

```json
{
  "msg": "Success"
}
```

Access Token 或 Refresh Token 无效时返回 `401`。前端无论此请求是否成功，都应删除本地保存的 Access Token 与 Refresh Token。

## 配置读取

以下接口均不需要登录。

### 反洗钱问卷配置

`GET /api/launderingBack/config`

问卷配置题型为 `one-choice`（单选）或 `multiple-choice`（多选）。

响应：

```json
[
  {
    "question_code": 1,
    "type": "one-choice",
    "title": "题目内容",
    "options": [
      {
        "question_code": 1,
        "option": "A",
        "optiontext": "选项内容"
      }
    ]
  }
]
```

### 开户信息配置

`GET /api/addInfo/config`

响应：

```json
[
  {
    "field_id": 1,
    "field_name": "姓名",
    "type": "text"
  }
]
```

字段提交键名为 `p<field_id>`，例如 `field_id: 1` 对应提交字段 `p1`。

### 投资者适当性问卷配置

`GET /api/question/config`

响应结构与反洗钱问卷配置相同。

### 选择期货配置

`GET /api/chooseFutures/config`

响应结构与反洗钱问卷配置相同。

## 答案提交

本节全部接口均需要 Access Token，成功响应统一为：

```json
{
  "msg": "Success"
}
```

Access Token 无效或缺失时返回 `401`；请求字段缺失、类型错误或答案不在允许范围内时返回 `422`。

### 提交反洗钱问卷

`POST /api/launderingBack/answer`

```json
{
  "p1": "A",
  "p2": "A",
  "p3": "A",
  "p4": "A",
  "p5": "A",
  "p6": "A",
  "p7": "AB",
  "p8": "A",
  "p9": "AC"
}
```

允许值：`p1/p3/p4` 为 `A|B|C`；`p2` 为 `A|B|C|D|E`；`p5/p6` 为 `A|B`；`p7/p9` 为 `A|B|C|AB|AC|BC|ABC`；`p8` 为 `A` 至 `I` 中的一个单选项。

### 提交开户信息

`POST /api/addInfo/answer`

以下为资料示例，职业 `537`、学历 `3` 及省市代码均来自当前种子数据；提交时还需要有效 Access Token 和数据库中的对应代码记录。

```json
{
  "p1": "张三",
  "p2": "11010519491231002X",
  "p3": "北京市朝阳区示例路 1 号",
  "p4": null,
  "p5": null,
  "p6": true,
  "p7": "156110000",
  "p8": "156110101",
  "p9": "朝阳区示例路 1 号",
  "p10": "100000",
  "p11": "北京市",
  "p12": "北京市",
  "p13": "营业部类别",
  "p14": "开户营业部名称",
  "p15": "13800138000",
  "p16": "example@example.com",
  "p17": "537",
  "p18": "3",
  "p19": false,
  "p20": null,
  "p21": null,
  "p22": null,
  "p23": null
}
```

| 键名 | 含义 | 类型 / 规则 |
| --- | --- | --- |
| p1 | 姓名 | 非空字符串 |
| p2 | 身份证号 | 非空字符串；需通过格式、出生日期和校验位验证 |
| p3 | 身份证地址 | 非空字符串 |
| p4 | 身份证有效期开始日期 | `YYYY-MM-DD` 或 `null` |
| p5 | 身份证有效期结束日期 | `YYYY-MM-DD` 或 `null` |
| p6 | 身份证是否长期有效 | 布尔值 |
| p7 | 联系地址省份 | 非空字符串，需为有效省份代码 |
| p8 | 联系地址城市 | 非空字符串，需为有效城市代码，且须属于 p7 对应省份 |
| p9 | 联系详细地址 | 非空字符串 |
| p10 | 邮政编码 | 6 位数字字符串 |
| p11 | 开户营业部省份 | 非空字符串 |
| p12 | 开户营业部城市 | 非空字符串 |
| p13 | 营业部类别 | 非空字符串 |
| p14 | 开户营业部 | 非空字符串 |
| p15 | 联系电话 | 中国大陆手机号：`1[3-9]` 开头的 11 位数字 |
| p16 | 电子邮箱 | 邮箱格式或 `null` |
| p17 | 职业 | 非空字符串，需为有效职业代码 |
| p18 | 学历 | 非空字符串，需为有效学历代码 |
| p19 | 是否存在居间人 | 布尔值 |
| p20 | 居间人姓名 | 非空字符串或 `null` |
| p21 | 居间人登记编号 | 非空字符串或 `null` |
| p22 | 推荐人代码 | 非空字符串或 `null` |
| p23 | 推荐人姓名 | 非空字符串或 `null` |

关联规则：

- `p6=true` 时，`p4` 与 `p5` 必须均为 `null`；`p6=false` 时，二者必须均存在，且 `p5` 晚于 `p4`。
- `p19=true` 时，`p20` 与 `p21` 必填；`p19=false` 时，二者必须为 `null`。

### 提交投资者适当性问卷

`POST /api/question/answer`

```json
{
  "p1": "A",
  "p2": "A",
  "p3": "A",
  "p4": "A",
  "p5": "A",
  "p6": "A",
  "p7": "A",
  "p8": "A",
  "p9": "A",
  "p10": "A",
  "p11": "A",
  "p12": "A",
  "p13": "A",
  "p14": "A"
}
```

允许值：`p1=A|B`；`p2/p12/p13=A|B|C|D|E`；其余 `p3` 至 `p11` 及 `p14` 为 `A|B|C|D`。

### 提交选择期货

`POST /api/chooseFutures/answer`

```json
{
  "p1": "ACD"
}
```

`p1` 是由 `A`、`B`、`C`、`D` 按字母升序拼接的非空多选结果，例如 `A`、`AB`、`ACD`、`ABCD`。

## 代码表

以下接口均不需要登录。

### 省份

`GET /api/code/province`

```json
[
  { "province_code": "156110000", "name": "北京市" }
]
```

### 城市

`GET /api/code/city`

```json
[
  { "province_code": "156110000", "city_code": "156110101", "name": "东城区" }
]
```

### 职业

`GET /api/code/occupation`

```json
[
  { "occupation_code": "500", "name": "党政机关负责人及管理人员" }
]
```

### 学历

`GET /api/code/educationalqualification`

```json
[
  { "educationalqualification_code": "2", "name": "硕士及以上" }
]
```

## JS 注入数据

`GET /api/jsinject/data?uid=<uid>`

当前接口不需要登录。`uid` 为必填查询参数；用户不存在时返回 `404`。

响应：

```json
{
  "launderingBack": { "p1": "A" },
  "addInfo": { "p1": "张三", "p2": "11010519491231002X" },
  "question": { "p1": "A" },
  "chooseFutures": { "p1": "ACD" }
}
```

任一页面尚未提交时，对应字段为 `null`。`addInfo` 的字段键名为 `p1` 至 `p23`。
