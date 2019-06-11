/**
 *
 *
 * @param {*} equipmentData 实验器材的全部数据
 * @param {*} callback 在元素加入datatable之后初始化datatable
 * 为每一条数据所对应的button都设置对应的data-index的值方便后面进行相关的删除操作
 */

function renderDom(equipmentData,callback){
    var str = '';
    for (var i = 0; i < equipmentData.data.length ; i++) {
        str += ' <tr>\
        <td><img src= "'+equipmentData.data[i].images +'"></td>\
        <td>' + equipmentData.data[i].eqName  +'</td>\
        <td>'+ equipmentData.data[i].eqNumber  +'</td>\
        <td>'+ equipmentData.data[i].categoryId +'</td>\
        <td>'+ equipmentData.data[i].introduce  +'</td>\
        <td>' + equipmentData.data[i].amount  +'</td>\
        <td>' + equipmentData.data[i].loan  +'</td>\
        <td>' + equipmentData.data[i].numberUse  +'</td>\
        <td>' + equipmentData.data[i].eqAdmin  +'</td>\
        <td>' + equipmentData.data[i].eqDate  +'</td>\
        <td>\
            <button class="success btn btn-success edit-btn" data-index=' + i +'>编辑</button>\
            &nbsp;&nbsp;&nbsp;&nbsp;\
            <button class="btn btn-info del-btn" data-index=' + i +'>删除</button>\
        </td>\
    </tr>'
    
    }
    /* console.log(str); */
    $('#main-content .table-responsive .table tbody').html(str);
    callback();
}
/**
 *作为renderdom的回调函数 初始化dataTables
 *
 */
function initDataTables(){
    $('#bootstrap-data-table').DataTable({
    lengthMenu: [[10, 20, 50, -1], [10, 20, 50, "All"]],
});



$('#bootstrap-data-table-export').DataTable({
    dom: 'lBfrtip',
    lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
    buttons:[]
});

$('#row-select').DataTable( {
        initComplete: function () {
            this.api().columns().every( function () {
                var column = this;
                var select = $('<select class="form-control"><option value=""></option></select>')
                    .appendTo( $(column.footer()).empty() )
                    .on( 'change', function () {
                        var val = $.fn.dataTable.util.escapeRegex(
                            $(this).val()
                        );
 
                        column
                            .search( val ? '^'+val+'$' : '', true, false )
                            .draw();
                    } );
 
                column.data().unique().sort().each( function ( d, j ) {
                    select.append( '<option value="'+d+'">'+d+'</option>' )
                } );
            } );
        }
    })

}
/**
 * 
 *
 * @param {*} url 第一个参数 当前请求的api
 * @param {*} data  第二个参数 需要返回数据的类型设置
 * 返回当前设备的信息
 * @returns {deviceObj} 返回虚拟请求的设备信息
 */
Mock.mock('http://test.com', {
            "code":200,
            "essMsg|1":['OK','unknownFault'],
            "data|15-30": [{   // 随机生成15-30
                'eqId|+1': 5,  // 设备id
                'eqName|1': ['数码相机','单反相机','遮光布'],    // 设备名称
                'eqNumber|10002-50000': 0,  //设备编号
                'categoryId|+1': 1,  // 分类id
                'amount|1-500': 0,   // 库存数量
                'loan|1-500': 0,  // 已经外借数量
                'numberUse|500-1000': 0,  // 已经借用的总次数
                'introduce|10000-20000': 0,  // 设备的介绍
                'eqDate|10000-20000': 0,  // 创建日期
                'eqAdmin': '@cname',  // 创建人
                'images|1': ['1.png','2.png','3.png','4.png','5.png'],  // 从obj对象中随机获取1至3个属性
            }
                ]
     });
/**
 * 
 *
 * @param {*} formArr 用户当前填写的待提交的表单(以类数组的方式传入) 类数组中元素有value 与 name
 * 返回当前设备的信息
 * @returns {deviceObj} 返回处理过后的用户填入的表单数据
 */
function formatObj(formArr){
    var deviceObj = {};
    for(var i = 0 ; i < formArr.length ;i++){
        if(!deviceObj[formArr[i].name] ){
               deviceObj[formArr[i].name] = formArr[i].value;
        }
    }
    return deviceObj;
}
/**
 *绑定所有的点击事件
 *
 */

function bindBtnEvent(){
    //处理点击选择的页面
    $('.all-device').on('click',function(){
        
    })
    //用户点击提交之后 获取表单的值
    $('#add-device-btn').on('click',function(e){
        e.preventDefault();
        var data = $('#add-device-form').serializeArray();
        data = formatObj(data);
    })

   }

//每次进入该页面都会获取所有的设备信息
$.ajax({
        url: 'http://test.com',
        type: 'get',
        dataType: 'json'
    }).done(function(data, status) {
        renderDom(data,initDataTables);

});

//初始化所有点击事件
bindBtnEvent();