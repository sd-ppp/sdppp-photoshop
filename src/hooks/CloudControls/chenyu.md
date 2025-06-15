# center-ai

Base URLs:
- cpn-ai: https://www.chenyu.cn

# Authentication

- HTTP Authentication, scheme: bearer

## API KEY认证

```
Authorization: Bearer LLM_NET_API_KEY
```

K值获取地址为晨羽智云官网chenyu.cn/console/apiServer

![](./img/center/1.png)

# 财务接口(finances)

## POST 余额查询

POST /api/v1/finances/balance

响应数据包括余额信息及算力卡信息，只显示最近一百条算力卡信息

### 请求参数

```json
{}
```

| 名称 | 位置 | 类型   | 必选 | 说明 |
|------|------|--------|------|------|
| body | body | object | 否   | none |

### 返回示例

#### 200 Response

```json
{
  "code": "string",
  "msg": "string",
  "result": {
    "cards": [
      {
        "uuid": "string",
        "title": "string",
        "card_no": "string",
        "valid_days": 0,
        "bind_time": "2019-08-24T14:15:22Z",
        "expire_date": "2019-08-24T14:15:22Z",
        "bind_txt": "string",
        "sale_price": 0,
        "face_price": 0,
        "leave_amount": 0,
        "pods": [
          {
            "property1": null,
            "property2": null
          }
        ],
        "remark": "string",
        "status": 0,
        "status_txt": "string"
      }
    ],
    "balance": "string"
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
|--------|--------------------------------------------------|------|----------|
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none | Inline   |

### 返回数据结构

**状态码 200**

| 名称 | 类型 | 必选 | 约束 | 中文名 | 说明 |
|------|------|------|------|--------|------|
| code | string | true | none | 响应编码 | 0:成功<br>2:未登录<br>-2:系统异常 |
| msg | string | true | none |  | 返回消息，非0显示错误原因 |
| result | object | true | none |  | 响应数据 |
| » cards | [算力卡] | true | none |  | 算力卡信息，最近一百条 |
| » balance | string | true | none |  | 可用余额，不包括算力卡余额 |

## POST 充值记录

POST /api/v1/finances/recharge

查询客户充值记录

### 请求参数

```json
{
  "page": 0,
  "page_size": 0,
  "kw": "string"
}
```

| 名称 | 位置 | 类型 | 必选 | 说明 |
|------|------|------|------|------|
| body | body | any | 否 | none |

### 返回示例

#### 200 Response

```json
{
  "code": "string",
  "msg": "string",
  "result": {
    "total": "string",
    "items": [
      {
        "created_at": "2019-08-24T14:15:22Z",
        "pay_time": "2019-08-24T14:15:22Z",
        "out_trade_no": "string",
        "pay_channel": "string",
        "amount": 0
      }
    ]
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
|--------|--------------------------------------------------|------|----------|
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none | Inline   |

### 返回数据结构

**状态码 200**

| 名称 | 类型 | 必选 | 约束 | 中文名 | 说明 |
|------|------|------|------|--------|------|
| code | string | true | none | 响应编码 | 0:成功<br>2:未登录<br>-2:系统异常 |
| msg | string | true | none |  | 返回消息，非0显示错误原因 |
| result | object | true | none |  | 响应数据 |
| » total | string | true | none |  | 总数 |
| » items | [充值记录] | true | none |  | none |

## POST 账单记录

POST /api/v1/finances/bill

查询客户充值记录

### 请求参数

```json
{
  "page": 0,
  "page_size": 0,
  "kw": "string"
}
```

| 名称 | 位置 | 类型 | 必选 | 说明 |
|------|------|------|------|------|
| body | body | any | 否 | none |

### 返回示例

#### 200 Response

```json
{
  "code": "string",
  "msg": "string",
  "result": {
    "total": "string",
    "items": [
      {
        "created_at": "2019-08-24T14:15:22Z",
        "order_no": "string",
        "occurred_amount": 0,
        "card_txt": "string",
        "show": "string"
      }
    ]
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
|--------|--------------------------------------------------|------|----------|
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none | Inline   |

### 返回数据结构

**状态码 200**

| 名称 | 类型 | 必选 | 约束 | 中文名 | 说明 |
|------|------|------|------|--------|------|
| code | string | true | none | 响应编码 | 0:成功<br>2:未登录<br>-2:系统异常 |
| msg | string | true | none |  | 返回消息，非0显示错误原因 |
| result | object | true | none |  | 响应数据 |
| » total | string | true | none |  | 总数 |
| » items | [消费记录] | true | none |  | none |

# 应用接口(app)

## POST pod列表

POST /api/v1/app/list

查看可用pod列表

### 请求参数

**Body**

```json
{
  "page": 0,
  "page_size": 0,
  "kw": "string"
}
```

| 名称 | 位置 | 类型 | 必选 | 说明 |
|------|------|------|------|------|
| body | body | any | 否 | none |

### 返回结果

| 状态码 | 状态码含义 | 说明 | 数据模型 |
|--------|------------|------|----------|
| 200 | OK | none | Inline |

**返回示例**

```json
{
  "code": "string",
  "msg": "string",
  "result": {
    "total": "string",
    "items": [
      {
        "uuid": "string",
        "title": "string",
        "image_tags": "string",
        "image_tag": "string",
        "pod_name": "string",
        "status": 0,
        "status_txt": "string",
        "created_at": "2019-08-24T14:15:22Z"
      }
    ]
  }
}
```

### 返回数据结构

| 名称 | 类型 | 必选 | 说明 |
|------|------|------|------|
| code | string | true | 响应编码 (0:成功, 2:未登录, -2:系统异常) |
| msg | string | true | 返回消息，非0显示错误原因 |
| result | object | true | 响应数据 |
| » total | string | true | 总数 |
| » items | [Pod] | true | Pod列表 |
| »» uuid | string | true | 唯一标识符 |
| »» title | string | true | 标题 |
| »» image_tags | string | true | 镜像标签列表 |
| »» image_tag | string | true | 镜像标签 |
| »» pod_name | string | true | POD名称 |
| »» status | integer | true | 状态 |
| »» status_txt | string | true | 状态说明 |
| »» created_at | string(date-time) | true | 创建时间 |

## POST 创建Pod实例

POST /api/v1/app/instance/create

### 请求参数

**Body**

```json
{
  "pod_uuid": "string",
  "image_uuid": "string",
  "image_tag": "string",
  "gpu_model_uuid": "string",
  "auto_start": "integer"
}
```

| 名称 | 位置 | 类型 | 必选 | 说明 |
|------|------|------|------|------|
| pod_uuid | body | string | 否 | pod唯一标识 |
| image_uuid | body | string | 否 | 镜像id，不传使用pod对应的标识 |
| image_tag | body | string | 是 | 版本 |
| gpu_model_uuid | body | string | 是 | gpu型号id |
| auto_start | body | integer | 否 | 创建完成是否自动启动 |

### 返回结果

| 状态码 | 状态码含义 | 说明 | 数据模型 |
|--------|------------|------|----------|
| 200 | OK | none | Inline |

**返回示例**

```json
{
  "code": "string",
  "msg": "string",
  "result": {
    "instance": {
      "uuid": "string",
      "title": "string",
      "pod_uuid": "string",
      "pod_title": "string",
      "pod_name": "string",
      "pod_price": "string",
      "pod_startup_elapse": 0,
      "image_tag": "string",
      "out_web_url": "string",
      "category": 0,
      "gpus": 0,
      "no_card": 0,
      "gpu_model_name": "string",
      "charging_type": 0,
      "charging_type_name": "string",
      "charging_num": 0,
      "price_h": 0,
      "instance_type_txt": "string",
      "status": 0,
      "status_txt": "string"
    }
  }
}
```

## POST GPU列表

POST /api/v1/gpu/models

查看可用GPU列表

### 返回结果

| 状态码 | 状态码含义 | 说明 | 数据模型 |
|--------|------------|------|----------|
| 200 | OK | none | Inline |

**返回示例**

```json
{
  "code": "string",
  "msg": "string",
  "result": {
    "total": "string",
    "no_card_price": 0,
    "items": [
      {
        "uuid": "string",
        "title": "string",
        "desc": "string",
        "price": "string",
        "remark": "string",
        "status": 0,
        "status_txt": "string",
        "created_at": "2019-08-24T14:15:22Z",
        "free_txt": "string"
      }
    ]
  }
}
```

## POST 实例列表

POST /api/v1/app/instance/list

查看可用pod列表

### 请求参数

**Body**

```json
{
  "page": 0,
  "page_size": 0,
  "status": 0
}
```

| 名称 | 位置 | 类型 | 必选 | 说明 |
|------|------|------|------|------|
| page | body | number | 否 | 页码，默认1 |
| page_size | body | number | 否 | 每页数量，默认10 |
| status | body | number | 是 | 状态(0:"已创建", 1:"开机中", 2:"运行中", 3:"关机中", 4:"已关机", 9:"已销毁") |

## POST 重启Pod实例

POST /api/v1/app/instance/restart

### 请求参数

**Body**

```json
{
  "instance_uuid": "string"
}
```

| 名称 | 位置 | 类型 | 必选 | 说明 |
|------|------|------|------|------|
| instance_uuid | body | string | 是 | 实例唯一标识 |

## POST Pod实例定时关机

POST /api/v1/app/instance/scheduled/shutdown

### 请求参数

**Body**

```json
{
  "instance_uuid": "string",
  "regular_time": "string",
  "cancel": true
}
```

| 名称 | 位置 | 类型 | 必选 | 说明 |
|------|------|------|------|------|
| instance_uuid | body | string | 是 | 实例唯一标识 |
| regular_time | body | string | 否 | 关机时间，ex:2025-11-29 19:40:00 |
| cancel | body | boolean | 否 | 是否是取消定时关机 |

## POST Pod实例状态

POST /api/v1/app/instance/status

### 请求参数

**Body**

```json
{
  "instance_uuid": "string"
}
```

| 名称 | 位置 | 类型 | 必选 | 说明 |
|------|------|------|------|------|
| instance_uuid | body | string | 是 | 实例唯一标识 |

### 返回示例

```json
{
  "code": "string",
  "msg": "string",
  "result": {
    "instance": {
      "status": 0,
      "status_txt": "string"
    }
  }
}
```

## POST 销毁Pod实例

POST /api/v1/app/instance/stop

### 请求参数

**Body**

```json
{
  "instance_uuid": "string",
  "shutdown_reason": "string"
}
```

| 名称 | 位置 | 类型 | 必选 | 说明 |
|------|------|------|------|------|
| instance_uuid | body | string | 是 | 实例唯一标识 |
| shutdown_reason | body | string | 否 | 关闭原因 |

## POST 启动Pod实例

POST /api/v1/app/instance/start

### 请求参数

**Body**

```json
{
  "instance_uuid": "string"
}
```

| 名称 | 位置 | 类型 | 必选 | 说明 |
|------|------|------|------|------|
| instance_uuid | body | string | 是 | 实例唯一标识 |

# 数据模型

## 通用响应

```json
{
  "code": "string",
  "msg": "string",
  "result": {}
}
```

### 属性

| 名称 | 类型 | 必选 | 说明 |
|------|------|------|------|
| code | string | true | 响应编码 (0:成功, 2:未登录, -2:系统异常) |
| msg | string | true | 返回消息，非0显示错误原因 |
| result | object | true | 响应数据 | 