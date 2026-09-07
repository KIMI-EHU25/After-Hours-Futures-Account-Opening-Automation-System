# 夜盘开户 数据库结构设计

## 配置表

### 主表

| uid | phone_number | id | created_at | modified_at |
| --- | --- | --- | --- | --- |
| 1000000 | 13811111111 | 310107111111111111 | TIMESTAMP | TIMESTAMP

### Page 6 业务表

| 业务单号 | uid | 6-1 | 6-2 | 6-3 | 6-4 | 6-5 | 6-6 | 6-7 | 6-8 | 6-9 | created_at | 
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 00001 | 1000000 | A | A | A | A | A | A | BC | A | AC | TIMESTAMP |

### Page 7 业务表

| 业务单号 | uid | name | idCardNumber | idCardAddress | nationality | idCardValidPeriodStart | idCardValidPeriodEnd | ifIdCardPermanentlyValid | contactAddressProvince | contactAddressCity | contactAddress | postalCode | departmentProvince | departmentCity | departmentCategory | departmentName | contactnumber | phonenumber | emailAddress | occupation | educationalQualification | ifIntermediary | intermediaryName | intermediaryCode | referencePersonCode | referencePersonName | created_at | 
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 00000001 | 1000000 | str | str | str | Readonly | Date() | Date() | Bool | int（存 code） | int（存 code） | str | str | str（只有“湖北省”） | str（只有“武汉市”） | int（存 code，只有一个 0） | int（存 code，只有一个 2015） | str | Readonly | str | int（存 code） | int（存 code） | Bool | str | str | str | str | TIMESTAMP |

### Page 10 业务表

| 业务单号 | uid | 10-1 | 10-2 | 10-3 | 10-4 | 10-5 | 10-6 | 10-7 | 10-8 | 10-9 | 10-10 | 10-11 | 10-12 | 10-13 | 10-14 | created_at | 
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 00001 | 1000000 | A | A | A | A | A | A | A | A | A | A | A | A | A | A | TIMESTAMP |


### Page 12 业务表

| 业务单号 | uid | 12-1 | created_at | 
| --- | --- | --- | --- |
| 00001 | 1000000 | ABC | TIMESTAMP |