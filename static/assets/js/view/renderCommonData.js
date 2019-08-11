var baseUrl = "http://localhost:8088/api/equipmentServer/";
let token = null;
/**
 * 全局默认设置
 */
$.ajaxSetup({
    headers: { // 默认添加请求头
        "Content-Type": "application/json",
        "eq-token": token
    },
    error: function (err) {
        console.error(err);
        alert("网络错误");
    }
});


isLogin();

/**
 * 退出登录
 */
$('#logout').on('click', function (e) {
    localStorage.clear();
    token = null;
    window.location.replace('./login.html');
})


/**
 * @param {Array} formArr 用户当前填写的待提交的表单(以类数组的方式传入) 类数组中元素有value 与 name
 * 返回当前设备的信息
 * @returns {deviceObj} 返回处理过后的用户填入的表单数据
 */
function formatObj(formArr) {
    var dataObj = {};
    formArr.forEach(v => {
        if (!dataObj[v.name]) {
            dataObj[v.name] = v.value;
        }
    });

    return dataObj;
}

/**
 * 判断是否登录
 */
function isLogin() {
    const href = window.location.href;
    token = localStorage.getItem('eq-token');
    /**
 * 全局默认设置
 */
    $.ajaxSetup({
        headers: { // 默认添加请求头
            "eq-token": token
        }
    });
    if (href.toLowerCase().includes('login.html')) {
        if (token) {
            window.location.replace('./deviceManage.html');
        } else {
            token = null;
        }
    } else {
        if (!token) {
            window.location.replace('./login.html');
        }
    }
}

Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1,                 //月份 
        "d+": this.getDate(),                    //日 
        "h+": this.getHours(),                   //小时 
        "m+": this.getMinutes(),                 //分 
        "s+": this.getSeconds(),                 //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds()             //毫秒 
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}