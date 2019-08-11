## 用户登录
* url：**user/login**
* method:**POST**
* 响应示例
1. 请求成功示例
```js
   {
      "code":200,
	  "data":{
            "firstLogin":1,
            "userPower":1,
            "token":"ddsffsfxxx"
	  },
	  "errMsg":"OK"
   }
```
2. 密码错误
 ```js
{
    "code":201,
	"errMsg":"error password"	
}
```
3. 账号不存在
```js
 {
   "code":205,
   "errMsg":"unKnown account"
 }
```
4. 服务器端错误
 ```js
 {
    "code":500,
	"data":"",
	"errMasg"："unKnown fault"
 }
 ```

## 更新用户个人信息 
* url：**user/userinfo/{account}**
* method:**PUT**
### 请求示例
1. 重置密码
```js
{
    "password":"a1234565"
}
```
2. 更新个人部分信息
```js
{
    "userName":"新名字",
    "userNumber":"1233414xxx",
    "userAcademy":"计科院",
    "userProfession":"舞蹈"
}
```
3. 更新手机号
```js
{
    "userPhone":"111132424xx"
}
```
...此处省略更多示例....
### 响应示例
1. 请求成功示例
```js
{
    "code":200,
    "errMsg":"OK"
}
```
2. 没有权限
 ```js
{
    "code":202,
	"errMsg":"no power"	
}
```
3. 服务器端错误
 ```js
 {
    "code":500,
	"errMasg"："unKnown fault"
 }
 ```

## 管理员获取用户列表
* url：**user/users/{account}**
* method:**GET*
### 响应示例
1. 请求成功示例
```js
{
    "code":200,
    "data":{
        "userList":[
            {
                "userId":1,
                "userName":"小明",
                "userNumber":"201731061422",
                "userPower":1,
                "userAcademy":"饥渴院",
                "userProfession":"软工",
                "userPhone":"131414143",
                "deposit":0
            },
            {
                "userId":2,
                "userName":"小明2",
                "userNumber":"201731061422",
                "userPower":1,
                "userAcademy":"饥渴院",
                "userProfession":"软工",
                "userPhone":"131414143",
                "deposit":0
            }
        ]
    }
    "errMsg":"OK"
}
```
2. 没有权限
 ```js
{
    "code":202,
	"errMsg":"no power"	
}
```
3. 服务器端错误
 ```js
 {
    "code":500,
	"errMasg"："unKnown fault"
 }
 ```

## 用户获取个人信息
* url：**user/user/{account}**
* method:**GET*
### 响应示例
1. 请求成功示例
```js
{
    "code":200,
    "data":{
        "userInfo":
            {
                "userName":"小明",
                "userNumber":"201731061422",
                "userPower":1,
                "userAcademy":"饥渴院",
                "userProfession":"软工",
                "userPhone":"131414143",
                "deposit":0
        }
    }
    "errMsg":"OK"
}
```
2. 没有权限
 ```js
{
    "code":202,
	"errMsg":"no power"	
}
```
3. 服务器端错误
 ```js
 {
    "code":500,
	"errMasg"："unKnown fault"
 }
 ```


## 用户获取订单列表
* url：**order/order/{account}**
* method:*$GET$*
### 响应示例
1. 获取所属订单列表(管理员获取所有的/普通用户获取所属的)
```js
{
    "code":200,
    "data":{
        "orders":[
            {
                "ordrId":3,
                "orderNumber":"20343434343432",
                "eqId":3,
                "orderStart":32213131313,
                "orderEnd":23232121331,
                "orderLendDays":5,
                "number":4,
                "useNumber":301731061422,
                "orderStatus":-1
            },
            {
                "ordrId":3,
                "orderNumber":"20343434343432",
                "eqId":3,
                "orderStart":32213131313,
                "orderEnd":23232121331,
                "orderLendDays":5,
                "number":4,
                "useNumber":301731061422,
                "orderStatus":-1
            }
        ]
    }
    "errMsg":"OK"
}
```

2. 没有权限
 ```js
{
    "code":202,
	"errMsg":"no power"	
}
```
3. 服务器端错误
 ```js
 {
    "code":500,
	"errMasg"："unKnown fault"
 }
 ```
