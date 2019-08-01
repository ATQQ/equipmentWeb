$(document).ready(function () {

    var baseUrl = "";

    //管理员账号
    var account = "admin";

    const headers = ['学号/工号', '姓名', '学院', '专业', '手机号', '状态', '押金金额', '操作'];


    //mock数据
    /**
    * @param {string} url 第一个参数 当前请求的api
    * @param {json} data  第二个参数 需要返回数据的类型设置
    * 返回当前设备的信息
    * @returns {deviceObj} 返回虚拟请求的设备信息
    */
    Mock.mock('http://testUser.com', {
        "code": 200,
        "essMsg|": ['OK', 'unknownFault'],
        "data|10-20": [{   // 随机生成15-30
            'userName': '@cname',  // 用户名
            'userId|+1': 1,//主键
            'userNumber|+1': 2018301062421,    // 用户的学号
            'userProfession|1': ['编导', '舞蹈', '主持'],
            'userPhone|10000000000-19999999999': 0,
            'userAcademy|1': ['艺术院', "计科院"],  //用户所属学院
            'userEqId|+1': 1,  // 外借设备id
            'userTimes|1-20': 0,   // 外借总时长
            'userUseTimes|1-500': 0,  // 用户总外借次数
            'userState|1': ['正常', '冻结']//记录用户状态
        }
        ]
    });
    //==================================init初始化============================


    // 初始化表头
    initializeUserHeader(headers);


    //初始化deviceTable对象
    var userTable = initDataTables();


    /**
     * 初始化页面数据
     */
    loadInitUserData()

    //==========================event==============================================

    $("#add-user-btn").on('click', function (e) {
        e.preventDefault();
        var userData = $('#add-user-form').serializeArray();
        //获取用户输入
        var key = true;
        //确保用户输入正确

        //把获取的数组转化为对象
        userData = formatObj(userData);

        for (prop in userData) {
            if (userData[prop] == '') {
                alert("请把设备信息填写完整！！");
                key = false;
                return;
            }
        }
        //填写完整直接上传数据
        if (key) {
            $.ajax({

            })
        }
    })

    /**
         * 删除一条用户数据
         */
    $('#userTable tbody').on('click', '.del-btn', function (e) {
        //当前操作的行
        const $row = userTable.row($(this).parents('tr'));
        //待删除的设备id
        const userId = $($row.data()[6]).attr("userId");
        // console.log(deviceId);
        if (confirm("确认删除此条数据吗?")) {

            $.ajax({

            })

        }
    })
    /**
         * 改变用户当前操作状态
         */
    $('#userTable tbody').on('click', '.state-btn', function (e) {
        //当前操作的行
        const $row = userTable.row($(this).parents('tr'));
        //待删除的设备id
        const userId = $($row.data()[6]).attr("userId");
        //从后端获取当前用户状态 冻结 = xxx  正常 = xxx
        $.ajax({

        })
        //根据状态分为两个提示框 确认冻结吗？ 确认恢复吗? 
        $.ajax({

        })


    })
    /**
         * 批量导入
         */
    $('#addManyUser').on('click', function (e) {

    })

    //===========================function部分===========================

    /**
     * 初始化用户表头
     * @param {Array} headers 
     */
    function initializeUserHeader(headers) {
        let $tr = document.createElement('tr');
        headers.forEach(v => {
            const $th = document.createElement('th');
            $th.append(v);
            $tr.append($th);
        })
        $('#userTable thead').append($tr);
    }


    /**
     * 向设备表添加一条数据
     * @param {object} data 
     */
    function addDataToUserTable(data) {

        var btns2 =
            '<div class="btn-group btn-group-sm fw-flex m-l-45" UserId="' + data.userId + '">' +
            '<button data-toggle="modal" data-target="#userModalEdit" title="编辑" type="button" class="btn btn-info edit-btn"><span class="ti-pencil-alt2 "></span></button>' +
            '<button title="删除" type="button" class="btn del-btn btn-danger"><span class="ti-trash "></span></button>' +
            '<button title="状态" type="button" class="btn state-btn btn-success"><span class="ti-info-alt"></span></button>' +
            '</div>'
        var rowNode = userTable.row.add([
            data.userNumber,
            data.userName,
            data.userAcademy,
            data.userProfession,
            data.userPhone,
            data.userState,
            0,
            btns2,
        ]).draw()
            .node();
    }

    /**
     * 对已经在表中的数据进行编辑
     */
    $('#userTable tbody').on('click', '.edit-btn', function (e) {
        //当前操作的行
        const $row = userTable.row($(this).parents('tr'));
        //待编辑的设备id
        const userId = $($row.data()[6]).attr("userId")
        //待编辑的设备的所有信息
        const editData = $($row.data());
        //把数据填充到表单之中
        renderUserModalData(editData);

        /**
         * 如果确认编辑
         */
        $('#edit-user-btn').unbind('click');
        $('#edit-user-btn').on('click', function (e) {
            var data = $('#edit-user-form').serializeArray();
            data = formatObj(data);
            data.userId = userId;
            //判断用户填写的信息是否符合规范
            for (prop in data) {
                if (data[prop] == '') {
                    alert("请把设备信息填写完整！！");
                    return;
                }
            }

            $.ajax({
            })
        })
    })
    /**
     *
     * 用户编辑时填充用户数据
     * @param {*} editData
     */
    function renderUserModalData(editData) {
        var editForm = document.getElementById('edit-user-form');
        var len = editForm.length
        for (var i = 0; i < len - 2; i++) {
            editForm[i].value = editData[i];
        }


    }

    /**
     *初始化dataTables
     * @return deviceTable 
     */
    function initDataTables() {
        var $userTable = $('#userTable').DataTable({
            dom: 'lBfrtip',
            filter: true,
            "lengthMenu": [[5, 10, 15, 20, -1], [5, 10, 15, 20, "All"]],
            buttons: []
        });
        return $userTable;
    };

    /**
    * 加载页面初始化数据
    * @param {*} userData 用户的全部数据
    */
    function loadInitUserData() {
        var datas = [];
        //测试数据

        $.ajax({
            url: 'http://testUser.com',
            type: "GET",
            dataType: 'json'
        }).done(function (res, status) {
            datas = res.data;
            datas.forEach(element => {
                addDataToUserTable(element);
            });
        })
    }
});



