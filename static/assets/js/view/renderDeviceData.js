$(document).ready(function () {

    var baseUrl = "http://localhost:8080/Test/";

    //mock数据
    /**
    * @param {string} url 第一个参数 当前请求的api
    * @param {json} data  第二个参数 需要返回数据的类型设置
    * 返回当前设备的信息
    * @returns {deviceObj} 返回虚拟请求的设备信息
    */
    Mock.mock('http://test.com', {
        "code": 200,
        "essMsg|": ['OK', 'unknownFault'],
        "data|10-20": [{   // 随机生成15-30
            'eqId|+1': 5,  // 设备id
            'eqName|1': ['数码相机', '单反相机', '遮光布'],    // 设备名称
            'eqNumber|10002-50000': 0,  //设备编号
            'categoryId|+1': 1,  // 分类id
            'amount|1-500': 0,   // 库存数量
            'loan|1-500': 0,  // 已经外借数量
            'numberUse|500-1000': 0,  // 已经借用的总次数
            'introduce|10000-20000': 0,  // 设备的介绍
            'eqDate|10000-20000': 0,  // 创建日期
            'eqAdmin': '@cname',  // 创建人
            'images|1': ['assets/images/testImg.png'],  // 从obj对象中随机获取1至3个属性
        }
        ]
    });
    //==================================init初始化============================

    //初始化deviceTable 对象
    var deviceTable = initDataTables();
    
    var catgoryData = new Map();
    /**
     *获取分类的数据
     */
    getCateGoryData();

    /**
     * 初始化页面数据
     */
    loadInitData();

    //==========================event==============================================

    //处理点击选择的页面
    $('.all-device').on('click', function () {

    })
    //用户点击提交之后 获取表单的值 改变表格数据 改变上传图片样式 
    $('#add-device-btn').on('click', function (e) {
        e.preventDefault();
        var data = $('#add-device-form').serializeArray();
        var key = true;
        
        //把获取的数组转化为对象 把获取的图片地址剪切进来
        data = formatObj(data); 
        //管理员账号获取
        data.eqAdmin = '黄海';
        //图片返回
        data.images = 'assets/images/testImg.png"';
        //判断用户填写的信息是否符合规范
        for(prop in data){
            if(data[prop] == ''){
                alert("请把设备信息填写完整！！");
                console.log(data);
                key = false;
                break;
            }
        }
        
        if(true){
        addDataToDeviceTable(data)}
    })

    /**
     * 删除一条数据
     */
    $('#deviceTable tbody').on('click', '.del-btn', function (e) {
        //当前操作的行
        const $row = deviceTable.row($(this).parents('tr'));
        //待删除的设备id
        const deviceId = $($row.data()[10]).attr("deviceId");
        // console.log(deviceId);
        if (confirm("确认删除此条数据吗?")) {
            //ajax Delete
            $row
                .row($(this).parents('tr'))
                .remove()
                .draw();
        }
    })

    /**
     * 
     * 对已经在表中的数据进行编辑
     */

    $('#deviceTable tbody').on('click','.edit-btn',function(e){
        //当前操作的行
        const $row = deviceTable.row($(this).parents('tr'));
        //待编辑的设备id
        const deviceId = $($row.data()[10]).attr("deviceId")
        //待编辑的设备的所有信息
        const editData = $($row.data());
        //把数据填充到表单之中
        renderModalData(editData);
    })

    /**
     * 
     * 处理用户添加分类的操作
     */
    $(".category-add-btn").on('click',function(e){
        e.preventDefault();
        //获取用户输入的新分类名
        var addForm = $(".addCategory").val();
        var key = true;
        var newCategory = '';
        //将新分类名与已有的分类名进行比较
        catgoryData.forEach(function (ele,index){
            if(ele == addForm.toString()){
                alert("当前分类已经存在，请输入未添加的分类名！");
                key = false;
            }
        })
        if(key &&  addForm != ""){
            newCategory += '<div class="alert alert-info alert-dismissible  pull-left m-r-7" role="alert">\
            <button type="button" class="close category-del-btn" data-dismiss="" aria-label="">\
            <span aria-hidden="true">&times;</span></button>\
            <strong>'+ addForm +'</strong>&nbsp;</div>';
            $('.taglist').append(newCategory);
            //ajax 更新数据库 获取id
            //更新当前页面的分类map的值
            //改变添加的编辑的表单select          
            alert("添加成功");
        }
        //重置
        $(".addCategory").val('');
    })
    
    /**
     * 
     * 处理用户删除分类的操作
     */
    $(".taglist").on('click','.category-del-btn',function(e){
        //获取当前标签的值
        var  categoryName = $(this).parent('div').find('strong').text();        
        //判断当前分类标签是否存在于表格中
        var len = deviceTable.data().length;
        var order = 3;
        var key = true;
        var $data = deviceTable.data();
        for(var i = 0 ; i < len ; i++ ){
            if($data[i][order] == categoryName){
                alert("删除失败，仍然有当前分类设备在表格中!");
                key = false;
                break;
            }
        }
        if(key){
          if(confirm("确认删除吗？")){
            $(this).attr('data-dismiss','alert');
            alert("删除成功!!");
            //ajax发送到数据库
            //修改对应的map
            //改变添加的编辑的表单select限选框
            (".category-del-btn").trigger('click');
          }
        }
    })
   
    //===========================function部分===========================
    
    function initCategory(){

    }
    /** 
     *
     *渲染编辑仪器信息时 信息弹窗的数据
     * @param {Array} data 当前一排的数据信息
     */
    function renderModalData(data){
          var editForm = document.getElementById('edit-device-form');
          editForm['eqName'].value = data[1];
          editForm['eqNumber'].value = data[2];
          editForm['introduce'].value = data[4];
          editForm['amount'].value = data[5];
          
    }      
    /**
     * 向设备表添加一条数据
     * @param {object} data 
     */
    function addDataToDeviceTable(data) {
        var $btns = '<div deviceId="' + data.eqId + '" style="display:flex;"><button type="button" class="btn btn-primary edit-btn" \
             data-toggle="modal" data-target="#deviceModalEdit">编辑</button>' + 
            '<button class="btn del-btn btn-danger" style="margin-left:10px;"> 删除</button></div>'
        var $img = '<img src="' + data.images + '" style="width:100px;height:100px;">'
        console.log();
        var rowNode = deviceTable.row.add([
            $img,
            data.eqName,
            data.eqNumber,
            catgoryData.get(data.categoryId % 3),
            data.introduce,
            data.amount,
            data.loan,
            data.numberUse,
            data.eqAdmin,
            (new Date()).Format("yyyy-MM-dd hh:mm:ss"),
            // data.eqDate,
            $btns
        ]).draw()
            .node();
        // $(rowNode)
        //     .css('color', 'red')
        //     .animate({ color: 'black' });
    }

    /**
    * 加载页面初始化数据
    * @param {*} equipmentData 实验器材的全部数据
    */
    async function loadInitData() {
        var datas = [];
        //每次进入该页面都会获取所有的设备信息
        await $.ajax({
            url: 'http://test.com',
            type: 'get',
            dataType: 'json'
        }).done(function (res, status) {
            datas = res.data;
        });
        console.log(datas);

        datas.forEach((key) => {
            addDataToDeviceTable(key);
        })
    }

    /**
     * 获取分类数据
     */
    async function getCateGoryData() {
        //ajax
        catgoryData.set(0, "音响");
        catgoryData.set(1, "相机");    
        catgoryData.set(2, "录音");
    }

    /**
     *初始化dataTables
     * @return deviceTable 
     */
    function initDataTables() {
        var $deviceTable = $('#deviceTable').DataTable({
            dom: 'lBfrtip',
            filter: true,
            "lengthMenu": [[5, 10, 15, 20, -1], [5, 10, 15, 20, "All"]],
            buttons: []
        });
        return $deviceTable;
    }



    /**
     * @param {object} formArr 用户当前填写的待提交的表单(以类数组的方式传入) 类数组中元素有value 与 name
     * 返回当前设备的信息
     * @returns {deviceObj} 返回处理过后的用户填入的表单数据
     */
    function formatObj(formArr) {
        var deviceObj = {};
        for (var i = 0; i < formArr.length; i++) {
            if (!deviceObj[formArr[i].name]) {
                deviceObj[formArr[i].name] = formArr[i].value;
            }
        }
        
        return deviceObj;
    }

    

    //==================================图片上传部分=====================//
    /**
    * 创建的WebUploadr对象
    */
    var imageUploader = WebUploader.create({

        // 是否开起分片上传。
        chunked: false,
        //选择完文件或是否自动上传
        auto: false,
        //swf文件路径
        swf: 'Uploader.swf',
        // 上传并发数。允许同时最大上传进程数[默认值：3]   即上传文件数
        threads: 3,
        //文件接收服务端接口
        server: baseUrl + "file/save",
        // 选择文件的按钮
        pick: {id:'#imagePicker'},
        //上传请求的方法
        method: "POST",
        // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
        resize: false,
        //指定接受哪些类型的文件
        accept: {
            title: 'Images',
            extensions: 'gif,jpg,jpeg,bmp,png',
            mimeTypes: 'image/*'
        }
    });

    /**
     * 文件被添加进队列的时候
     */
    imageUploader.on('fileQueued', function (file) {
        var $list = $('#imagesList');
        var $li = $(' <li id="' + file.id + '">' +
            '<div class= "wait state">等待上传</div>' +
            '<span class="delete">×</span>' +
            '<img src="" alt="图片">' +
            '<p class="filename">' + file.name + '</p>' +
            '</li>'),
            $img = $li.find('img');
        $list.append($li);
        //创建图片预览
        imageUploader.makeThumb(file, function (error, src) {
            if (error) {
                $img.replaceWith('<span>不支持格式,不能预览</span>');
                return;
            }
            $img.attr('src', src);
        });
    });

    //移除选择的图片
    $('#imagesList').on('click', '.delete', function () {
        var fileId = $(this).parents('li').attr('id');
        if (confirm("确认移除次图片吗?")) {
            // 从上传队列中移除
            imageUploader.removeFile(fileId, true);
            // 从视图中移除缩略图
            $(this).parents('li').remove();
        }
    });

    // 文件上传过程中创建进度条实时显示。
    imageUploader.on('uploadProgress', function (file, percentage) {
        var $li = $('#' + file.id),
            $progress = $li.find('div.progress');
        // 避免重复创建
        if (!$progress.length) {
            $li.children('div.state').remove();
            $progress = $('<div class="progress state"></div>').appendTo($li);
        }
        $progress.text('上传中');
    });



    // 文件上传成功处理。
    imageUploader.on('uploadSuccess', function (file, response) {
        var $li = $('#' + file.id),
            $success = $li.find('div.success');
        // 避免重复创建
        if (!$success.length) {
            $li.children('div.state').remove();
            $success = $('<div class="success"></div>').appendTo($li);
        }
        $success.text('上传成功');

    });

    //上传出错
    imageUploader.on('uploadError', function (file) {
        var $li = $('#' + file.id),
            $error = $li.find('div.error');
        // 避免重复创建
        if (!$error.length) {
            // 移除原来的
            $li.children('div.state').remove();
            // 创建新的状态进度条
            $error = $('<div class="error"></div>').appendTo($li);
        }
        $error.text('上传出错');
    });


    /**
     * 确认上传
     */
    $("#sureUpload").on('click', function () {
        imageUploader.upload();
    })

})

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

