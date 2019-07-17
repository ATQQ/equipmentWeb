
/**
     * 用户登录时的操作
     */
$('#login-btn').on('click',function(e){
    e.preventDefault();
    //获取用户输入
    var userLoginData = $('#login-form').serializeArray();
    userLoginData = formatObj(userLoginData);
    //发送给后端确认 成功后跳转页面
    $.ajax({

    })
})