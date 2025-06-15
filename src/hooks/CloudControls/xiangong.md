# 获取实例列表
## 简介
此接口用于获取用户的实例列表。
## 请求参数
无需请求参数。
## 响应参数
`list` ([]Instance) - 实例列表
字段 | 类型 | 说明
--- | --- | ---
`id` | `string` | 实例ID
`create_timestamp` | `int64` | 创建时间戳
`data_center_name` | `string` | 数据中心名称
`name` | `string` | 实例名称
`public_image` | `string` | 公共镜像名称
`gpu_model` | `string` | GPU型号
`gpu_used` | `int` | 已使用的GPU数量
`cpu_model` | `string` | CPU型号
`cpu_core_count` | `int` | CPU核心数
`memory_size` | `int64` | 内存大小（字节）
`system_disk_size` | `int64` | 系统盘大小（字节）
`data_disk_size` | `int64` | 数据盘大小（字节）
`expandable_data_disk_size` | `int64` | 可扩展的数据盘大小（字节）
`data_disk_mount_path` | `string` | 数据盘挂载路径
`storage_mount_path` | `string` | 存储挂载路径
`price_per_hour` | `float64` | 每小时价格
`ssh_key` | `string` | SSH密钥
`ssh_port` | `string` | SSH端口
`ssh_user` | `string` | SSH用户
`password` | `string` | 密码
`jupyter_token` | `string` | Jupyter令牌
`jupyter_url` | `string` | Jupyter URL
`xgcos_token` | `string` | XG COS令牌
`xgcos_url` | `string` | XG COS URL
`start_timestamp` | `int64` | 启动时间戳
`stop_timestamp` | `int64` | 停止时间戳
`status` | `string` | 实例状态
`ssh_domain` | `string` | SSH域名
`web_url` | `string` | Web URL
`progress` | `int` | 进度
`image_id` | `string` | 镜像ID
`image_type` | `string` | 镜像类型
`image_price` | `float64` | 镜像价格
`image_save` | `bool` | 是否保存镜像
`base_price` | `float64` | GPU 每小时费用
`retain` | `float64` | 是否关机保留磁盘
`retain_price` | `float64` | 关机保留磁盘每小时费用
`retain_size` | `float64` | 关机保留磁盘磁盘尺寸（字节）

`total` (int) - 实例总数


# 获取实例信息

获取已创建实例的详细信息。

## 请求参数

无需请求参数。

## 响应参数

字段 | 类型 | 说明
--- | --- | ---
`id` | `string` | 实例ID
`create_timestamp` | `int64` | 创建时间戳
`data_center_name` | `string` | 数据中心名称
`name` | `string` | 实例名称
`public_image` | `string` | 公共镜像名称
`gpu_model` | `string` | GPU型号
`gpu_used` | `int` | 已使用的GPU数量
`cpu_model` | `string` | CPU型号
`cpu_core_count` | `int` | CPU核心数
`memory_size` | `int64` | 内存大小（字节）
`system_disk_size` | `int64` | 系统盘大小（字节）
`data_disk_size` | `int64` | 数据盘大小（字节）
`expandable_data_disk_size` | `int64` | 可扩展的数据盘大小（字节）
`data_disk_mount_path` | `string` | 数据盘挂载路径
`storage_mount_path` | `string` | 存储挂载路径
`price_per_hour` | `float64` | 每小时价格
`ssh_key` | `string` | SSH密钥
`ssh_port` | `string` | SSH端口
`ssh_user` | `string` | SSH用户
`password` | `string` | 密码
`jupyter_token` | `string` | Jupyter令牌
`jupyter_url` | `string` | Jupyter URL
`xgcos_token` | `string` | XG COS令牌
`xgcos_url` | `string` | XG COS URL
`start_timestamp` | `int64` | 启动时间戳
`stop_timestamp` | `int64` | 停止时间戳
`status` | `string` | 实例状态
`ssh_domain` | `string` | SSH域名
`web_url` | `string` | Web URL
`progress` | `int` | 进度
`image_id` | `string` | 镜像ID
`image_type` | `string` | 镜像类型
`image_price` | `float64` | 镜像价格
`image_save` | `bool` | 是否保存镜像
`base_price` | `float64` | GPU 每小时费用
`retain` | `float64` | 是否关机保留磁盘
`retain_price` | `float64` | 关机保留磁盘每小时费用
`retain_size` | `float64` | 关机保留磁盘磁盘尺寸（字节）

## 实例 `status` 状态
| 状态 | 描述     |
|------|--------|
| deploying   | 正在部署  |
| running   | 正在运行  |
| booting   | 正在开机  |
| shutting_down   | 正在关机  |
| shutdown   | 已关机  |
| destroying   | 正在销毁  |
| destroyed   | 已销毁  |
| saving_image   | 正在储存镜像  |
| freezing   | 正在冻结  |
| freeze   | 已冻结  |
| replacing_image   | 正在更换镜像  |



# 销毁实例

## 简介

此接口用于发送销毁命令给指定的实例。
该接口请求成功后即下发命令异步执行，执行过程与结果请查看实例信息中的状态。

## 请求参数

### Body参数

| 参数名 | 类型   | 描述     | 是否必须 |
| ------ | ------ | -------- | -------- |
| id     | string | 实例ID | 是       |

## 响应参数

| 参数名  | 类型    | 描述       |
| ------- | ------- | ---------- |
| code    | int     | 响应代码   |
| msg  | string  | 消息文本   |
| success | bool    | 操作是否成功 |




# 部署实例

部署实例接口用于创建和配置新的服务实例。
该接口请求成功后即下发命令异步执行，执行过程与结果请查看实例信息中的状态。

## 请求参数

| 字段名                | 类型    | 描述                   |
|---------------------|-------|----------------------|
| gpu_model            | `string` | GPU型号:`NVIDIA GeForce RTX 4090` `NVIDIA GeForce RTX 4090 D`               |
| gpu_count            | `int`    | GPU数量:`0`~`8`               |
| data_center_id        | `int`    | 数据中心ID: `1`            |
| image               | `string` | 镜像: 可填写社区镜像ID、私有镜像ID或公共镜像ID                |
| image_type           | `string` | 镜像类型: `public` `community` `private`               |
| storage             | `bool`   | 是否挂载云储存 (可选)         |
| storage_mount_path    | `string` | 云储存挂载路径 (可选)            |
| ssh_key              | `string` | SSH密钥ID(可选)               |
| system_disk_expand    | `bool`   | 是否扩展系统盘(可选)          |
| system_disk_expand_size| `int`    | 系统盘扩展大小（字节）(可选)   |
| name| `string`    | 为部署的实例设定一个实例名(可选)   |

## 公共镜像列表
|镜像名/版本|镜像ID|
|------|---------|
|SD_WebUI_1.10.1_老白_v1.1/已安装常用插件，适合新手直接使用。|`9c530cfd-b929-4f2d-99d9-97a6d572ac89`|
|SD_ComfyUI_老白_v1.9/(PyTorch3.1 CUDA12.2)已安装常用节点。|`decbfd43-8963-434a-a42d-9df6ee0bae0f`|
|Miniconda3_3.10/ubuntu22.04/CUDA 12.2|`a0607405-d0fd-4efc-b34e-de0872d4a633`|
|Miniconda3_3.10/ubuntu22.04/CUDA 12.2 TensorRT|`2f98442f-1e6e-4531-8b92-88a09d5d8a20`|
|Miniconda3_3.10/ubuntu22.04/CUDA 12.1|`260cd46a-12aa-44ed-b47a-88f770b49041`|
|Miniconda3_3.10/ubuntu22.04/CUDA 11.8|`9115617d-3d2a-494d-af82-597319953e46`|
|Miniconda3_3.10/centos7/CUDA 11.4|`8b73bf90-d6a2-4f21-9521-8aed8ea7d2c9`|
|Miniconda3_3.8/ubuntu20.04/CUDA 11.8|`438c59fd-886b-4cda-8396-12a9cd4a3b97`|
|SD_WebUI_v1.10.1_纯净版|`a96bac5e-e47c-4abd-9752-ec43871f9d17`|
|SD_WebUI_v1.10.0_纯净版|`af846fff-cd98-4176-9d9b-ae1507886981`|
|SD_WebUI_1.9.4_老白_v1.0/已安装常用插件，适合新手直接使用。|`317f5796-556b-42a2-9e6f-da6e677beb97`|
|SD_WebUI_v1.9.4_纯净版|`cc0c9888-25d7-4098-8c89-63166669b56f`|
|SD_WebUI_v1.9.3_纯净版|`c02e3191-743b-40dc-8517-b56ce450d2e4`|
|SD_WebUI_v1.9.2_纯净版|`fb98f8c0-827d-4166-8321-aae3ba5cd93e`|
|SD_WebUI_v1.9.1_纯净版|`2afdda15-abc9-4f12-8479-b8d1369dd224`|
|SD_WebUI_v1.9.0_纯净版|`68f42e1d-1a1e-4b3d-92ee-4daa79ab2d47`|
|SD_WebUI_v1.8.0_纯净版|`8bc14930-01a8-4f48-b84c-756f4c1ff797`|
|SD_WebUI_v1.7.0_纯净版|`d8338a2f-b9e8-40c6-8db6-c34658d239d7`|
|SD_WebUI_1.6.0_纯净版|`eafdbee2-8ce6-4b63-bcdd-3172fc4b3a36`|
|SD_WebUI_1.6.0_ControlNet|`500e6434-2acc-4e10-a1b5-7fa27c08ea13`|
|SD_WebUI_1.5.2_ControlNet|`f607f6e9-67f3-44e7-ac93-910ff91181c8`|
|SD_WebUI_1.5.1_ControlNet|`06b82605-3d95-4dfe-b2df-73c3f0a5dcf5`|
|SD_ComfyUI_老白_v1.8/(PyTorch3.1 CUDA12.2)已安装常用节点。|`423f8d45-1ee5-4c06-8bc6-658dbdc41f83`|
|SD_ComfyUI_老白_v1.7/(PyTorch3.1 CUDA12.2)已安装常用节点。|`c922d7e3-dc82-4e4c-9708-09493cfa106b`|
|SD_ComfyUI_老白_v1.6/(PyTorch3.1 CUDA12.2)已安装常用节点。|`7ac1b85f-5217-43e5-9e8d-d3f41b77e450`|
|SD_ComfyUI_老白_v1.5/(PyTorch3.1 CUDA12.2)已安装常用节点。|`97f9abcf-6b6f-4ae8-bfa5-a829f4617ae7`|
| SD_ComfyUI_老白_v1.4/(PyTorch3.1 CUDA12.2)已安装常用节点。|`9ff40247-267f-4986-a16f-4bf825ca2529`|
|SD_ComfyUI_老白_v1.3/(PyTorch2.2.2 CUDA12.2)已安装常用节点。|`75baee08-42da-4c92-8ab7-56b80ab3fb2f`|
|SD_ComfyUI_老白_v1.2/(PyTorch2.2.2 CUDA12.2)已安装常用节点。|`363c66af-f10d-4b96-b51e-211f8d98dfc7`|
| SD_ComfyUI_老白_v1.1/(PyTorch3.1 CUDA12.2)已安装常用节点。|`94505b31-6966-4801-ba29-82bdd54df662`|
|SD_ComfyUI_老白_v1.0/(PyTorch3.1 CUDA12.2)已安装常用节点。|`0ef12cab-e2a9-4737-be27-291afdb3d7ef`|
|SD_Forge_Layer|`29e86ee5-9e5e-46fb-8558-adbac87d606f`|
|blender 三维设计软件/blender-4.1.1-linux-x64|`1313cad2-5988-4d1f-8a35-bbc0eec2622d`|
|Miniconda3_3.8/ubuntu20.04/CUDA 11.1|`e7a66296-fe56-4fd1-a67d-cff5613b6372`|

## 响应参数

| 字段名 | 类型      | 描述     |
|------|---------|--------|
| id   | `string` | 实例ID  |



# 关机并保留GPU

## 简介
该操作为仅关机，关机后 GPU 会为您继续保留，期间实例照常收费。

该接口请求成功后即下发命令异步执行，执行过程与结果请查看实例信息中的状态。

## 请求参数

### Body参数

| 参数名 | 类型   | 描述     | 是否必须 |
| ------ | ------ | -------- | -------- |
| id     | string | 实例ID | 是       |

## 响应参数

| 参数名  | 类型    | 描述       |
| ------- | ------- | ---------- |
| code    | int     | 响应代码   |
| msg  | string  | 消息文本   |
| success | bool    | 操作是否成功 |

# 关机并释放GPU

## 简介
关机后 GPU 会被释放并不再计费。
GPU 释放后，系统磁盘已使用空间以 ¥0.00003 / GB / 小时继续计费
磁盘中储存的数据会进行安全备份，备份完成后您可以随时再次开机。

该接口请求成功后即下发命令异步执行，执行过程与结果请查看实例信息中的状态。

## 请求参数

### Body参数

| 参数名 | 类型   | 描述     | 是否必须 |
| ------ | ------ | -------- | -------- |
| id     | string | 实例ID | 是       |

## 响应参数

| 参数名  | 类型    | 描述       |
| ------- | ------- | ---------- |
| code    | int     | 响应代码   |
| msg  | string  | 消息文本   |
| success | bool    | 操作是否成功 |



# 关机并销毁

## 简介

此接口用于发送关机并销毁命令给指定的实例。
该接口请求成功后即下发命令异步执行，执行过程与结果请查看实例信息中的状态。

## 请求参数

### Body参数

| 参数名 | 类型   | 描述     | 是否必须 |
| ------ | ------ | -------- | -------- |
| id     | string | 实例ID | 是       |

## 响应参数

| 参数名  | 类型    | 描述       |
| ------- | ------- | ---------- |
| code    | int     | 响应代码   |
| msg  | string  | 消息文本   |
| success | bool    | 操作是否成功 |



# 开机

## 简介

此接口用于发送开机命令给指定的实例。
该接口请求成功后即下发命令异步执行，执行过程与结果请查看实例信息中的状态。

## 请求参数

### Body参数

| 参数名 | 类型   | 描述     | 是否必须 |
| ------ | ------ | -------- | -------- |
| id     | string | 实例ID | 是       |
| gpu_model     | string | (留空则按照关机时的型号)关机保留磁盘实例开机时，选择GPU型号:`NVIDIA GeForce RTX 4090` `NVIDIA GeForce RTX 4090 D` | 否       |
| gpu_count     | string | (留空则按照关机时的数量)关机保留磁盘实例开机时，GPU数量:`0`~`8` | 否       |

## 响应参数

| 参数名  | 类型    | 描述       |
| ------- | ------- | ---------- |
| code    | int     | 响应代码   |
| msg  | string  | 消息文本   |
| success | bool    | 操作是否成功 |


# 获取账户余额
## 简介
此接口用于获取用户的账户余额信息。
## 请求参数
此接口不需要请求参数。
## 响应参数

| 字段名  | 类型    | 说明     |
| ------- | ------- | -------- |
| balance | float64 | 账户余额 |
