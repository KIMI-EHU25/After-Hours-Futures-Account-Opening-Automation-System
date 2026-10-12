# 官方开户网站 页面路径说明

本文记录此前采集的官方页面路径，并与当前注入脚本的路径分支对应；未在本次文档更新中重新访问官方网站，后续页面变化需实际核对。注入实现与接入进度见 [service-js README](../service-js/README.md)。

`/canahartaLogin` 当前会填入示例身份证号用于调试，正式流程仍由用户完成登录。该行为不代表已接入真实用户资料。

## 官方网页开户路径

```
url = https://app5.cfmmc.com
```

## Page 1

pathname = /index

## Page 2

pathname = /indexselection

## Page 3

pathname = /canahartaLogin

正式流程由用户自己输入；当前脚本保留示例身份证填写的调试行为。

## Page 4

pathname = /canahartaLogin

正式流程由用户自己输入；当前脚本保留示例身份证填写的调试行为。

## Page 5

pathname = /idcardUpload

证件图片上传由用户自己操作。

## Page 6

pathname = /launderingBack

**需要预采集信息**

## Page 7

pathname = /addInfo

**需要预采集信息**

## Page 8

pathname = /settleBank

## Page 9

pathname = /appropriate

## Page 10

交易者风险测评问卷

pathname = /question

**需要预采集信息**

## Page 11

pathname = /echarts

## Page 12

pathname = /chooseFutures

**需要预采集信息**

## Page 13

pathname = /agreement

## Page 14

pathname = /video
