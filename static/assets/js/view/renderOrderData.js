$(document).ready(function () {

    let datas = null;//未分类的数据
    let deviceList = [];//设备数据
    //管理员账号
    let account = "admin";

    const allHeaders = ['订单编号', '图片', '设备名称', '开始时间', '结束时间', '租借天数', '租借个数', '租借人工号', '订单状态', '操作'];

    //===========================function部分===========================

    /**
    * 根据订单状态筛选出对应的数据
    * @param {Number|String} orderStatus 
    * @param {Array} datas 
    */
    const filterOrderData = (orderStatus, datas) => {
        orderStatus = Number.parseInt(orderStatus);
        if (orderStatus !== 666) {
            return datas.filter(d => d.orderStatus === orderStatus)
        }
        return datas;
    }

    /**
     * 通过订单状态取得对应的按钮
     * @param {Number} orderStatus 
     * @param {Number} orderId 订单编号
     */
    const getBtnsByOrderStatus = (orderStatus, orderId) => {
        switch (orderStatus) {
            case -2:
                return '';
            case -1:
                return '<div class="btn-group btn-group-sm fw-flex m-l-45" order="' + orderId + '">' +
                    '<button title="拒绝预约" type="button" class="btn refuse-btn btn-danger"><span class="ti-hand-stop "></span>拒绝</button>' +
                    '<button title="同意预约" type="button" class="btn allow-btn btn-success"><span class="ti-check"></span>同意</button>' +
                    '</div>';
            case 0:
                return '<div class="btn-group btn-group-sm fw-flex m-l-45" order="' + orderId + '">' +
                    '<button title="提醒取走设备" type="button" class="btn remindTake-btn btn-primary">' +
                    '<span class="ti-info-alt"></span>' +
                    '</button>' +
                    '<button title="已取走" type="button" class="btn sureTake-btn btn-success">' +
                    '确认取走' +
                    '</button>' +
                    '</div>';
            case 1:
                return '<div class="btn-group btn-group-sm fw-flex m-l-45" order="' + orderId + '">' +
                    '<button title="提醒归还设备" type="button" class="btn remindReturn-btn btn-primary"><span class="ti-info-alt"></span></button>' +
                    '<button title="确认归还设备" type="button" class="btn sureReturn-btn btn-success">确认归还</button>' +
                    '</div>';
            case 2:
                return '';
            default:
                return '';
        }
    }

    /**
     * 获取设备图片与名称
     * @param {Number} eqId 设备id 
     */
    const getDeviceImg = (eqId) => {
        let device = deviceList.find(v => {
            return eqId === v.eqId;
        })

        let imgArr = device.images;
        imgArr = JSON.parse(imgArr);
        const imgUrl = imgArr.length == 0 ? 'assets/images/testImg.png' : (baseUrl + 'file/image?picName=' + imgArr[0]);
        let $img = document.createElement("img");
        $img.src = imgUrl;
        $img.style.width = '100px';
        $img.style.height = '100px';
        
        return [$img.outerHTML, device.eqName];
    }

    /**
     * 向订单表格插入一条数据
     * @param {Object} order 
     */
    const inserDataToTable = (order) => {
        let btns = getBtnsByOrderStatus(order.orderStatus, order.orderNumber);
        let deviceImg = getDeviceImg(order.eqId);
        orderTable.row.add([
            order.orderNumber,
            ...deviceImg,
            (new Date(order.orderStart)).Format("yyyy-MM-dd hh:mm:ss"),
            order.orderEnd ? (new Date(order.orderEnd)).Format("yyyy-MM-dd hh:mm:ss") : '未结束',
            order.orderLendDays,
            order.number,
            order.userNumber,
            stateMap.get(order.orderStatus),
            btns
        ]).draw();
    }

    /**
     *
     *初始化记录状态的map
     */
    function initStateMap() {
        stateMap.set(-2, '已取消');
        stateMap.set(-1, '预约中');
        stateMap.set(0, '待取');
        stateMap.set(1, '待归还');
        stateMap.set(2, '已归还');
    }


    /* *
    * 初始化用户表头
    * @param {Array} headers 
    */
    function initializeOrderHeader(headers) {
        let $tr = document.createElement('tr');
        headers.forEach(v => {
            const $th = document.createElement('th');
            $th.append(v);
            $tr.append($th);
        })
        $('#orderTable thead').append($tr);
    }

    /* *
     *初始化dataTables
     * @return deviceTable 
     */
    function initOrderTables() {
        var $orderTable = $('#orderTable').DataTable({
            dom: 'lBfrtip',
            filter: true,
            "lengthMenu": [[5, 10, 15, 20, -1], [5, 10, 15, 20, "All"]],
            buttons: [],
            "destroy": true,
        });
        return $orderTable;
    }

    /**
     * 更改订单状态
     * @param {String} orderNumber 
     * @param {Number} orderStatus 
     */
    const changeOrderStatus = (orderNumber, orderStatus, nowStatus) => {
        $.ajax({
            url: baseUrl + `order/order`,
            type: "PUT",
            data: JSON.stringify({
                orderStatus,
                orderNumber
            })
        }).then((res) => {
            if (res.code === 200) {
                alert("操作成功");
                loadOrderData(nowStatus);
            } else {
                alert("操作失败");
            }
        })
    }

    /**
    * 加载最新订单数据
    * @param {Number} orderStatus 展示的指定状态数据
    */
    const loadOrderData = (orderStatus) => {
        //拿到
        $.ajax({
            url: baseUrl + `order/order/${account}`,
            type: "GET",
        }).done(function (res) {
            //获取最新数据
            datas = res.data.orders;
            // 取得过滤后的数据
            let filterData = filterOrderData(orderStatus, datas);
            // 清空原有数据
            orderTable
                .clear()
                .draw();
            //加载过滤后的数据 
            filterData.forEach(order => {
                inserDataToTable(order)
            })
        });
    }

    /**
     * 获取设备列表
     */
    const loadDeviceData = () => {
        return new Promise(resolve => {
            $.ajax({
                url: baseUrl + "devices/" + account,
                type: "GET"
            }).done(res => {
                if (res.code == 200) {
                    deviceList = res.data.equipmentList;
                    resolve();
                } else {
                    switch (res.code) {
                        case 201:
                            alert('没有权限');
                            break;
                        case 206:
                        case 500:
                            alert('未知异常');
                            break;
                        default:
                            break;
                    }
                }
            })
        })
    }

    const InitPage = async () => {
        await loadDeviceData();
        await loadOrderData(666);
    }

    //==================================init初始化============================
    //初始化deviceTable对象的表头
    initializeOrderHeader(allHeaders);

    // 初始化订单状态Map
    let stateMap = new Map();
    initStateMap();
    //初始化订单表
    let orderTable = initOrderTables();
    // 加载全部
    InitPage();
    //==========================event==============================================

    /**
     * 切换不同订单数据
     */
    $('#orderManage').on('click', 'div[orderStatus]', function (e) {
        // 取得过滤的目标订单状态
        let orderStatus = $(this).attr('orderStatus');
        // 取得过滤后的数据
        let filterData = filterOrderData(orderStatus, datas);
        // 清空原有数据
        orderTable
            .clear()
            .draw();
        //加载过滤后的数据 
        filterData.forEach(order => {
            inserDataToTable(order)
        })
    })


    /**
     * 拒绝申请
     */
    $('#orderTable tbody').on('click', '.refuse-btn', function (e) {
        let orderNumber = $(this).parent().attr("order");
        if (confirm("确认拒绝?")) {
            changeOrderStatus(orderNumber, -2, -1);
        }
    })

    /**
     * 同意申请
     */
    $('#orderTable tbody').on('click', '.allow-btn', function (e) {
        let orderNumber = $(this).parent().attr("order");
        if (confirm("确认同意?")) {
            changeOrderStatus(orderNumber, 0, -1);
        }
    })

    /**
    * 确认取走
    */
    $('#orderTable tbody').on('click', '.sureTake-btn', function (e) {
        let orderNumber = $(this).parent().attr("order");
        if (confirm("确认设备已经取走了吗?")) {
            changeOrderStatus(orderNumber, 1, 0);
        }
    })

    /**
    * 确认发送提醒短信
    */
    $('#orderTable tbody').on('click', '.remindTake-btn', function (e) {
        let orderNumber = $(this).parent().attr("order");
        if (confirm("确认发送提醒短信")) {
            // changeOrderStatus(orderNumber, 1, 0);
            alert("发送成功")
        }
    })
    /**
    * 确认发送提醒短信(归还)
    */
    $('#orderTable tbody').on('click', '.remindReturn-btn', function (e) {
        let orderNumber = $(this).parent().attr("order");
        if (confirm("确认发送提醒短信")) {
            // changeOrderStatus(orderNumber, 1, 0);
            alert("发送成功")
        }
    })
    /**
    * 确认归还
    */
    $('#orderTable tbody').on('click', '.sureReturn-btn', function (e) {
        let orderNumber = $(this).parent().attr("order");
        if (confirm("确认设备已经归还")) {
            changeOrderStatus(orderNumber, 2, 1);
        }
    })





})