$(document).ready(function () {

    var baseUrl = "";
    var datas = null;//未分类的数据
    var classifyDatas = null;//已经完成分类的数据
    var orderKey = true;
    //管理员账号
    var account = "admin";

    const allHeaders = ['订单编号', '设备id', '开始时间', '结束时间', '租借天数', '租借个数', '租借人工号','订单状态', '操作'];



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
        "data|30-50": [{   // 随机生成15-30
            'orderId|+1': 50,  // 
            'orderEqId|+1': 20,//
            'orderTime|+1': 5,
            'orderNumber|+1': 10,
            'orderAdmin|1': '@cname',  //用户所属学院
            'orderState|1': [-2,-1,0,1, 2],  // 外借设备id
        }
        ]
    });

    //拿到
    $.ajax({
        url: 'http://testUser.com',
        type: "GET",
        dataType: 'json'
    }).done(function (res, status) {
        //获取全部数据
        datas = res.data;
        //把获取到的数据根据状态进行分类
        classifyDatas = classifyAllorder(datas);
        datas.forEach(element => {
            addAllDataToOrderTable(element);
        })
        });
//==================================init初始化============================
 //初始化deviceTable对象的表头
initializeOrderHeader(allHeaders);
var stateMap = new Map();
initStateMap();
//初始化订单表
var orderTable = initOrderTables(); 

//==========================event==============================================
/**
 * 获取全部订单数据
 */
$('.orderManage .allOrder').on('click',function(e){  
    
        if(orderKey){
            $('#orderTable').dataTable().fnClearTable();
            datas.forEach(element => {
            addAllDataToOrderTable(element);
            orderKey = false;
        
    })
}
});


/**
 * 获取全部订单数据
 */
$('.orderManage .cancelOrder').on('click',function(e){
    orderKey = true
    //清空datatables   
    $('#orderTable').dataTable().fnClearTable();
    //填充新的数据
    classifyDatas.cancelOrderData.forEach(element => {
        addCancelOrderData(element);
})
})

/**
 * 获取待处理全部订单数据
 */
$('.orderManage .waitOrder').on('click',function(e){
    orderKey = true
    //清空datatables   
    $('#orderTable').dataTable().fnClearTable();
    //填充新的数据  
    classifyDatas.waitOrderData.forEach(element => {
        addWaitOrderData(element);
})
})

/**
 * 获取未退还全部订单数据
 */
$('.orderManage .noReturnedOrder').on('click',function(e){
    orderKey = true
    //清空datatables   
    $('#orderTable').dataTable().fnClearTable();
    //填充新的数据
    classifyDatas.noReturnedOrderData.forEach(element => {
        addNoReturnedOrderData(element);
})
})


/**
 * 获取已退还全部订单数据
 */
$('.orderManage .returnedOrder').on('click',function(e){
    orderKey = true
    //清空datatables   
    $('#orderTable').dataTable().fnClearTable();
    //填充新的数据
    classifyDatas.returnedOrderData.forEach(element => {
        addReturnedOrderData(element);
})
})


/**
 * 获取预约中全部订单数据
 */
$('.orderManage .reserveingOrder').on('click',function(e){
    orderKey = true
    //清空datatables   
    $('#orderTable').dataTable().fnClearTable();
    //填充新的数据
    classifyDatas.reserveingOrderData.forEach(element => {
        addReserveingData(element);
})
})


/**
 * 删除相关的订单数据
 */
$('#orderTable tbody ').on('click','.orderDel-btn',function(e){
    if(confirm('确认删除订单数据吗')){
        alert('删除成功!!');
    }
}
)
//===========================function部分===========================
/**
 *
 * @param {object}  所有的订单数据
 *@returns {object} 分好类的所有订单数据
 */
function classifyAllorder(orderData){
    let classifyData = {
        'cancelOrderData':[],
        'reserveingOrderData':[],
        'waitOrderData':[],
        'noReturnedOrderData':[],
        'returnedOrderData':[],
    };
    orderData.forEach(element =>{
       switch (element.orderState){
           case -2:classifyData.cancelOrderData.push(element);element.orderState =stateMap.get(-2);break;
               case -1:classifyData.waitOrderData.push(element);element.orderState=stateMap.get(-1);break;
                   case 0:classifyData.reserveingOrderData.push(element);element.orderState=stateMap.get(0);break;
                       case 1:classifyData.noReturnedOrderData.push(element);element.orderState=stateMap.get(1);break;
                           case 2:classifyData.returnedOrderData.push(element);element.orderState=stateMap.get(2);break;
                               default:return;
       }
    });
    
    return classifyData;
}



/**
 *
 *初始化记录状态的map
 */
function initStateMap(){
        stateMap.set(-2,'已取消');
        stateMap.set(-1,'待取');
        stateMap.set(0,'预约中');
        stateMap.set(1,'待归还');
        stateMap.set(2,'已归还');
}
/**
 *
 *填充已经取消的order数据的表格
 * @param {Array} data
 */
function addCancelOrderData(data){
    var cancelBtn =
    '<div class="btn-group btn-group-sm fw-flex m-l-45" UserId="' + data.orderId + '">' +
    '<button title="删除订单数据" type="button" class="btn orderDel-btn btn-danger"><span class="ti-trash "></span></button>' +
    '</div>'
var rowNode = orderTable.row.add([
    data.orderId,
    data.orderEqId,
    (new Date()).FormatTime("yyyy-MM-dd ",0),
    (new Date()).FormatTime("yyyy-MM-dd ",0),
    0,
    0,
    data.orderAdmin,
    data.orderState,
    cancelBtn
]).draw()
    .node();
}


/**
 *
 *填写待取的数据的表格
 * @param {array} data
 */
function addWaitOrderData(data){
    var btns2 =
    '<div class="btn-group btn-group-sm fw-flex m-l-45" UserId="' + data.orderId + '">' +
    '<button title="提醒取走设备" type="button" class="btn remindWait-btn btn-success"><span class="ti-info-alt"></span></button>' +
    '</div>'
    
var rowNode = orderTable.row.add([
    data.orderId,
    data.orderEqId,
    (new Date()).FormatTime("yyyy-MM-dd ",0),
    (new Date()).FormatTime("yyyy-MM-dd ",data.orderTime),
    data.orderTime,
    data.orderNumber,
    data.orderAdmin,
    data.orderState,
    btns2
]).draw()
    .node();
}


/**
 *
 *填写预约中的数据的表格
 * @param {array} data
 */
function addReserveingData(data){
    var btns2 =
    '<div class="btn-group btn-group-sm fw-flex m-l-45" UserId="' + data.orderId + '">' +
    '<button title="拒绝预约" type="button" class="btn refuse-btn btn-danger"><span class="ti-hand-stop "></span></button>' +
    '<button title="同意预约" type="button" class="btn allow-btn btn-success"><span class="ti-check"></span></button>' +
    '</div>'
var rowNode = orderTable.row.add([
    data.orderId,
    data.orderEqId,
    (new Date()).FormatTime("yyyy-MM-dd ",0),
    (new Date()).FormatTime("yyyy-MM-dd ",data.orderTime),
    data.orderTime,
    data.orderNumber,
    data.orderAdmin,
    data.orderState,
    btns2
]).draw()
    .node();
}
/**
 *
 *填写未归还数据的表格
 * @param {array} data
 */
function addNoReturnedOrderData(data){
    var btns2 =
    '<div class="btn-group btn-group-sm fw-flex m-l-45" UserId="' + data.orderId + '">' +
    '<button title="提醒归还设备" type="button" class="btn remindReturn-btn btn-success"><span class="ti-info-alt"></span></button>' +
    '</div>'
var rowNode = orderTable.row.add([
    data.orderId,
    data.orderEqId,
    (new Date()).FormatTime("yyyy-MM-dd ",0),
    (new Date()).FormatTime("yyyy-MM-dd ",data.orderTime),
    data.orderTime,
    data.orderNumber,
    data.orderAdmin,
    data.orderState,
    btns2
]).draw()
    .node();
}
/**
 *
 *填写已经归还的数据的表格
 * @param {array} data
 */
function addReturnedOrderData(data){
    var btns2 =
            '<div class="btn-group btn-group-sm fw-flex m-l-45" UserId="' + data.orderId + '">' +
            '<button title="删除订单数据" type="button" class="btn orderDel-btn btn-danger"><span class="ti-trash "></span></button>' +
            '</div>'
        var rowNode = orderTable.row.add([
            data.orderId,
            data.orderEqId,
            (new Date()).FormatTime("yyyy-MM-dd ",0),
            (new Date()).FormatTime("yyyy-MM-dd ",data.orderTime),
            data.orderTime,
            data.orderNumber,
            data.orderAdmin,
            data.orderState,
            btns2
        ]).draw()
            .node();
}

 /**
     * 向订单表添加一条数据
     * @param {object} data 
     */
    function addAllDataToOrderTable(data) {

        var btns2 =''
            
        var rowNode = orderTable.row.add([
            data.orderId,
            data.orderEqId,
            (new Date()).FormatTime("yyyy-MM-dd ",0),
            (new Date()).FormatTime("yyyy-MM-dd ",data.orderTime),
            data.orderTime,
            data.orderNumber,
            data.orderAdmin,
            data.orderState,
            btns2
        ]).draw()
            .node();
    }

/**
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


    //设置时间相关
Date.prototype.FormatTime = function (fmt,time) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1,                 //月份 
        "d+": this.getDate()+time,                    //日 
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

})