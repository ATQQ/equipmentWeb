$(document).ready(function () {

    /**
     * 用户登录时的操作
     */
    $('#login-btn').on('click', function (e) {
        e.preventDefault();
        //获取用户输入
        var userLoginData = $('#login-form').serializeArray();
        userLoginData = formatObj(userLoginData);
        //发送给后端确认 成功后跳转页面
        $.ajax({
            url: baseUrl + "user/login",
            type: "POST",
            data: JSON.stringify(userLoginData)
        }).done(res => {
            const data = res.data;
            const code = res.code;
            switch (code) {
                case 200:
                    if (data.userPower === 1) {
                        token = data.token;
                        localStorage.setItem('eq-token', token);
                        window.location.replace('./deviceManage.html') ;
                    } else {
                        alert("没有权限");
                    }
                    break;
                case 201:
                    alert("密码错误");
                    break;
                case 205:
                    alert("账号不存在")
                    break;
                default:
                    break;
            }
        })
    })
})
