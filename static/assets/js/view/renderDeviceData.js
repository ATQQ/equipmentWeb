$(document).ready(function () {


    //管理员账号
    var account = "admin";
    //临时存放上传图片的数组
    var uploadImg = [];
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

    async function initPage() {
        /**
        *获取分类的数据
        */
        await getCateGoryData();
        /**
         * 获取设备设备数据
         */
        await getDeviceData();
    }

    initPage();

    //==========================event==============================================

    //处理点击选择的页面
    $('.all-device').on('click', function () {

    })



    /**
     * 确认新增设备
     **/
    $('#add-device-btn').on('click', function (e) {
        e.preventDefault();
        var data = $('#add-device-form').serializeArray();
        var key = true;

        //把获取的数组转化为对象 把获取的图片地址剪切进来
        data = formatObj(data);
        //管理员账号设置
        data.eqAdmin = account;

        //判断用户填写的信息是否符合规范

        for (prop in data) {
            if (data[prop] == '') {
                alert("请把设备信息填写完整！！");
                key = false;
                return;
            }
        }

        // data.images = 'assets/images/testImg.png"';

        //获取队列中等待的图片数目
        const fileNum = imageUploader.getFiles('inited').length;
        //如果没有图片直接上传更新数据
        if (fileNum == 0) {
            //图片
            data.images = JSON.stringify(uploadImg);
            $.ajax({
                url: baseUrl + "devices/" + account,
                type: "POST",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                data: JSON.stringify(
                    data
                ),
                success: function (res) {
                    if (res.code == 200) {
                        alert("新增成功");
                        addDataToDeviceTable(res.data);
                    } else {
                        switch (res.code) {
                            case 201:
                                alert('此设备号编号已经存在,请重新设置');
                                break;
                            default:
                                break;
                        }
                    }
                },
                error: function () {
                    alert("网络错误")
                }
            })
            return;
        }
        $('#sureUpload').click();
    })


    /**
     * 管理/查看关联设备数据
     */
    $('#deviceTable tbody').on('click', '.relation-btn', function (e) {
        //当前操作的行
        const $row = deviceTable.row($(this).parents('tr'));
        //待查询的设备id
        const deviceId = $($row.data()[10]).attr("deviceId");

        const $datas = deviceTable.data();

        const categoryId3 = $('#categoryId3').val();

        loadEqCorrections(deviceId);

        //判断面板数据是否为空
        let isEmpty = true;

        $("#unexist").empty();

        for (let i = 0; i < $datas.length; i++) {
            if ($($datas[i][10]).attr('categoryId') == categoryId3) {
                addDataForRelationPanel('unexist', $($datas[i][10]).attr("deviceId"), $datas[i][1], $datas[i][4]);
                isEmpty = false;
            }
        }
        if (isEmpty) {
            $('#unexistArea').children('p.emptyTips').show();
        } else {
            $('#unexistArea').children('p.emptyTips').hide();
        }
        // 打开弹窗
        $('#correlationsModal').modal('show');


        /**
         * 当未关联分类发生改变时刷新面板数据
         */
        $('#categoryId3').unbind('change');
        $('#categoryId3').on('change', function (e) {
            const categoryId3 = e.target.value;
            isEmpty = true;
            $("#unexist").empty();

            for (let i = 0; i < $datas.length; i++) {
                if ($($datas[i][10]).attr('categoryId') == categoryId3) {
                    addDataForRelationPanel('unexist', $($datas[i][10]).attr("deviceId"), $datas[i][1], $datas[i][4]);
                    isEmpty = false;
                }
            }

            if (isEmpty) {
                $('#unexistArea').children('p.emptyTips').show();
            } else {
                $('#unexistArea').children('p.emptyTips').hide();
            }

        });

        /**
         * 添加未关联设备
         */
        $('#unexistArea').unbind('click');
        $('#unexistArea').on('click', 'button.relation-add-btn', function (e) {
            const relationDeviceId = $(this).parent('li').attr('deviceId');

            //判断是否已经存在
            if ($('#exist').children('li[deviceid="' + relationDeviceId + '"]').length == 0) {
                $.ajax({
                    url: baseUrl + "correlations/" + account,
                    type: "POST",
                    headers: {
                        "Content-Type": "application/json;charset=utf-8"
                    },
                    data: JSON.stringify({
                        eqParentId: deviceId,
                        eqChildId: relationDeviceId
                    }),
                    success: function (res) {
                        if (res.code === 200) {
                            const eqData = getDeviceDataById(relationDeviceId);
                            addDataForRelationPanel("exist", relationDeviceId, eqData[1], eqData[4], res.data.eqCoId);
                            //隐藏掉提示框
                            $('#existArea').children('p.emptyTips').hide();
                        } else {
                            alert(res.errMsg);
                        }
                    },
                    error: function () {
                        alert("网络异常");
                    }
                })
            } else {
                alert("此关联设备已存在");
            }

        })
    })


    /**
     * 删除关联设备
     */
    $('#exist').on('click', '.relation-del-btn', function (e) {

        const eqCoId = $(this).parent('li').attr('eqcoid');

        const $li = $(this).parent('li');
        $.ajax({
            url: baseUrl + "correlations/" + account,
            type: "DELETE",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            data: JSON.stringify({
                eqCoId: eqCoId
            }),
            success: function (res) {
                if (res.code) {
                    $li.remove();
                    if ($('#exist').children('li').length == 0) {
                        //显示提示框
                        $('#existArea').children('p.emptyTips').show();
                    }
                }
            },
            error: function () {
                alert("网络异常");
            }
        })

    })

    /**
     * 删除一条设备数据
     */
    $('#deviceTable tbody').on('click', '.del-btn', function (e) {
        //当前操作的行
        const $row = deviceTable.row($(this).parents('tr'));
        //待删除的设备id
        const deviceId = $($row.data()[10]).attr("deviceId");
        // console.log(deviceId);
        if (confirm("确认删除此条数据吗?")) {
            $.ajax({
                url: baseUrl + "devices/" + account,
                type: "DELETE",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                data: JSON.stringify({
                    eqId: deviceId
                }),
                success: function (res) {
                    if (res.code == 200) {
                        $row
                            .remove()
                            .draw();
                    } else {
                        switch (res.code) {
                            case 201:
                                alert("没有权限");
                                break;
                            case 206:
                                alert("未知异常");
                                break;
                            default:
                                break;
                        }
                    }
                },
                error: function () {
                    alert("网络异常");
                }
            })

        }
    })


    /**
     * 对已经在表中的数据进行编辑
     */
    $('#deviceTable tbody').on('click', '.edit-btn', function (e) {
        //当前操作的行
        const $row = deviceTable.row($(this).parents('tr'));
        //待编辑的设备id
        const deviceId = $($row.data()[10]).attr("deviceId")
        //待编辑的设备的所有信息
        const editData = $($row.data());
        //把数据填充到表单之中
        renderModalData(editData);

        /**
         * 如果确认编辑
         */
        $('#edit-device-btn').unbind('click');
        $('#edit-device-btn').on('click', function (e) {
            var data = $('#edit-device-form').serializeArray();
            data = formatObj(data);
            data.eqId = deviceId;
            //判断用户填写的信息是否符合规范
            for (prop in data) {
                if (data[prop] == '') {
                    alert("请把设备信息填写完整！！");
                    return;
                }
            }

            $.ajax({
                url: baseUrl + "devices/" + account,
                type: "PUT",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                data: JSON.stringify(
                    data
                ),
                success: function (res) {
                    if (res.code == 200) {
                        alert("编辑成功,查看最新数据 请刷新列表");
                        // $('#deviceModalEdit').modal('hide');
                    } else {
                        alert(res.errMsg);
                    }
                },
                error: function () {
                    alert("网络错误")
                }
            })
        })
    })

    /**
     * 
     * 处理用户添加分类的操作
     */
    $("#category-add-btn").on('click', function (e) {
        e.preventDefault();
        //获取用户输入的新分类名
        var addForm = $(".addCategory").val();
        if (!addForm) {
            return;
        }
        var key = true;
        //将新分类名与已有的分类名进行比较
        catgoryData.forEach(function (ele, index) {
            if (ele == addForm.toString()) {
                alert("当前分类已经存在，请输入未添加的分类名！");
                key = false;
            }
        })
        if (key) {
            $.ajax({
                url: baseUrl + "categorys/" + account,
                type: "POST",
                headers: {
                    'Content-Type': "application/json;charset=ytf-8"
                },
                data: JSON.stringify({
                    cgName: addForm
                }),
                success: function (res) {
                    // console.log(res);
                    if (res.code == 200) {

                        //更新当前页面的分类map的值
                        catgoryData.set(res.data.cg_id, addForm);
                        //改变添加的编辑的表单select
                        addCategoryToSelectOp(res.data.cg_id, addForm);
                        //向分类面板添加数据
                        addCategoryToPanel(res.data.cg_id, addForm);
                    } else {
                        switch (res.code) {
                            case 201:
                                alert("分类名称已存在");
                                break;
                            case 206:
                            case 500:
                                alert("未知异常");
                                break;
                            default:
                                break;
                        }
                    }

                },
                error: function () {
                    alert("网络错误");
                }
            })

        }
        //重置
        $(".addCategory").val('');
    })

    /**
     * 处理用户删除分类的操作
     */
    $(".taglist").on('click', '.category-del-btn', function (e) {
        let that = this;
        //获取当前标签的值
        var categoryName = $(this).parent('div').find('strong').text();
        //标签的id
        const categoryId = $(this).parent('div').attr('categoryid');
        //判断当前分类标签是否存在于表格中
        var len = deviceTable.data().length;
        var order = 3;
        var key = true;
        var $data = deviceTable.data();
        for (var i = 0; i < $data.length; i++) {
            if ($data[i][order] == categoryName) {
                alert("删除失败，仍然有当前分类设备在表格中!");
                key = false;
                break;
            }
        }
        if (key) {
            if (confirm("确认删除吗？")) {
                // $(this).attr('data-dismiss', 'alert');
                // (".category-del-btn").trigger('click');
                $.ajax({
                    url: baseUrl + "categorys/" + account,
                    type: "DELETE",
                    headers: {
                        'Content-Type': "application/json;charset=ytf-8"
                    },
                    data: JSON.stringify({
                        cgId: categoryId
                    }),
                    success: function (res) {
                        // console.log(res);
                        if (res.code == 200) {
                            //修改对应的map
                            catgoryData.delete(categoryId);
                            //改变编辑的表单select限选框
                            deleteCategoryInSelectOp(categoryId);
                            //移除当前的按钮
                            $(that).parent('div').remove();
                        } else {
                            switch (res.code) {
                                case 206:
                                case 500:
                                    alert("未知异常");
                                    break;
                                default:
                                    alert("未知异常");
                                    break;
                            }
                        }

                    },
                    error: function () {
                        alert("网络错误");
                    }
                })

            }
        }
    })

    /**
     * 初始话新增设备的弹窗面板
     */
    $('#addDevice').on('click', function () {
        resetModalPanel();
    })
    //===========================function部分===========================

    /**
     * 初始化新增设备弹窗数据
     */
    function resetModalPanel() {
        imageUploader.reset();
        $('#imagesList').empty();
    }


    /**
     * 为相关联设备面板添加数据
     * @param {String} panelType exist|unexist 
     * @param {Number} deviceId 设备id
     * @param {String} deviceName 设备名称
     * @param {String} deviceIntroduce 设备简介
     * @param {String} eqCoId 关联id
     */
    function addDataForRelationPanel(panelType, deviceId, deviceName, deviceIntroduce, eqCoId) {
        let $li = "";
        switch (panelType) {
            case 'exist':
                $li += (
                    '<li eqCoId="' + eqCoId + '"  title="' + deviceIntroduce + '" deviceId="' + deviceId + '" class="alert alert-info alert-dismissible pull-left m-r-7">' +
                    '<button type="button" class="close relation-del-btn" data-dismiss="" aria-label="Close">' +
                    '<span aria-hidden="true">x</span>' +
                    ' </button>' +
                    '<strong class="categoryName">' + deviceName + '</strong>' +
                    '</li>');
                break;
            case 'unexist':
                $li += (
                    '<li title="' + deviceIntroduce + '" deviceId="' + deviceId + '" class="alert alert-warning alert-dismissible pull-left m-r-7">' +
                    '<button type="button" class="close relation-add-btn" data-dismiss="" aria-label="Close">' +
                    '<span aria-hidden="true">√</span>' +
                    ' </button>' +
                    '<strong class="categoryName">' + deviceName + '</strong>' +
                    '</li>');
                break;
            default:
                return;
        }
        $('#' + panelType).append($li);

    }


    /**
     * 通过设备id获取设备基本数据
     * @param {Number} deviceId 
     */
    function getDeviceDataById(deviceId) {
        const $datas = deviceTable.data();
        for (let i = 0; i < $datas.length; i++) {
            if ($($datas[i][10]).attr('deviceId') == deviceId) {
                return $datas[i];
            }
        }
        return null;
    }

    /**
     * 加载关联设备信息
     * @param {Number} deviceId 
     */
    async function loadEqCorrections(deviceId) {
        $("#exist").empty();
        await $.ajax({
            url: baseUrl + "correlations/" + account,
            type: "GET",
            async: true,
            data: {
                eqParentId: deviceId
            },
            success: function (res) {
                if (res.code === 200) {
                    const eqCorrelations = res.data.eqCorrelations;
                    if (eqCorrelations.length === 0) {
                        $('#existArea').children('p.emptyTips').show();
                    } else {
                        $('#existArea').children('p.emptyTips').hide();
                        eqCorrelations.forEach((key) => {
                            //获取设备基本信息
                            const eqData = getDeviceDataById(key.eqChildId);
                            if (eqData) {
                                addDataForRelationPanel("exist", key.eqChildId, eqData[1], eqData[4], key.eqCoId);
                            }
                        })
                    }
                } else {
                    alert(res.errMsg);
                }
            },
            error: function () {
                alert("网络异常");
            }
        })
    }

    /**
     * 删除分类下拉列表中的选项
     * @param {Number} id 
     */
    function deleteCategoryInSelectOp(id) {
        $('#categoryId').children('option[value="' + id + '"]').remove();
        $('#categoryId2').children('option[value="' + id + '"]').remove();
        $('#categoryId3').children('option[value="' + id + '"]').remove();
    }


    /**
     * 向分类下拉列表插入数据
     * @param {Number} id 
     * @param {String} value 
     */
    function addCategoryToSelectOp(id, value) {
        $('#categoryId').append('<option value="' + id + '" >' + value + '</option>');
        $('#categoryId2').append('<option value="' + id + '" >' + value + '</option>');
        $('#categoryId3').append('<option value="' + id + '" >' + value + '</option>');
    }

    /**
     * 删除分类下拉列表中的选项
     * @param {Number} id 
     */
    function deleteCategoryInSelectOp(id) {
        $('#categoryId').children('option[value="' + id + '"]').remove();
        $('#categoryId2').children('option[value="' + id + '"]').remove();
        $('#categoryId3').children('option[value="' + id + '"]').remove();
    }

    /**
     * 向分类面板中插入数据
     * @param {Number} id 
     * @param {String} value 
     */
    function addCategoryToPanel(id, value) {
        const newCategory = '<div categoryId="' + id + '" class="alert alert-info alert-dismissible  pull-left m-r-7" role="alert">' +
            '<button type="button" class="close category-del-btn" data-dismiss="" aria-label="">' +
            '<span aria-hidden="true">&times;</span></button>' +
            '<strong>' + value + '</strong>&nbsp;</div>';
        //向页面插入数据
        $('.taglist').append(newCategory);
    }



    /** 
     *
     *渲染编辑仪器信息时 信息弹窗的数据
     * @param {Array} data 当前一排的数据信息
     */
    function renderModalData(data) {
        var editForm = document.getElementById('edit-device-form');
        editForm['eqName'].value = data[1];
        editForm['eqNumber'].value = data[2];
        catgoryData.forEach((val, key) => {
            if (val === data[3]) {
                editForm['categoryId'].value = key;
            }
        })
        editForm['introduce'].value = data[4];
        editForm['amount'].value = data[5];
    }

    /**
     * 向设备表添加一条数据
     * @param {object} data 
     */
    function addDataToDeviceTable(data) {
        let imgArr = data.images;
        imgArr = JSON.parse(imgArr);
        const imgUrl = imgArr.length == 0 ? 'assets/images/testImg.png' : (baseUrl + 'file/image?picName=' + imgArr[0]);
        var $btns = '<div categoryId="' + data.categoryId + '" deviceId="' + data.eqId + '" style="display:flex;"><button type="button" class="btn btn-primary " ' +
            'data-toggle="modal" data-target="#deviceModalEdit">编辑</button>' +
            '<button class="btn relation-btn btn-success" style="margin-left:10px;"> 关联设备</button></div>' +
            '<button class="btn del-btn btn-danger" style="margin-left:10px;"> 删除</button></div>';

        var btns2 =
            '<div class="btn-group btn-group-sm fw-flex" categoryId="' + data.categoryId + '" deviceId="' + data.eqId + '">' +
            '<button data-toggle="modal" data-target="#deviceModalEdit" title="编辑" type="button" class="btn btn-info edit-btn"><span class="ti-pencil-alt2 "></span></button>' +
            '<button title="关联设备" type="button" class="btn relation-btn btn-success"><span class="ti-layout-grid3-alt "></span></button>' +
            '<button title="删除" type="button" class="btn del-btn btn-danger"><span class="ti-trash "></span></button>' +
            '</div>'

        var $img = '<img src="' + imgUrl + '" style="width:100px;height:100px;">';
        var rowNode = deviceTable.row.add([
            $img,
            data.eqName,
            data.eqNumber,
            catgoryData.get(data.categoryId),
            data.introduce,
            data.amount,
            data.loan,
            data.numberUse,
            data.eqAdmin,
            (new Date(data.eqDate)).Format("yyyy-MM-dd hh:mm:ss"),
            btns2
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
    function getDeviceData() {
        return new Promise(resolve => {
            var datas = [];
            //每次进入该页面都会获取所有的设备信息
            //testData
            // await $.ajax({
            //     url: 'http://test.com',
            //     type: 'get',
            //     dataType: 'json'
            // }).done(function (res, status) {
            //     datas = res.data;
            // });

            $.ajax({
                url: baseUrl + "devices/" + account,
                type: "GET"
            }).done(res => {
                if (res.code == 200) {
                    datas = res.data.equipmentList;
                    datas.forEach((key) => {
                        addDataToDeviceTable(key);
                    })
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
                resolve();
            })
        })

        // console.log(datas);

        // datas.forEach((key) => {
        //     addDataToDeviceTable(key);
        // })
    }

    /**
     * 获取分类数据
     */
    function getCateGoryData() {
        return new Promise(resolve => {
            $.ajax({
                url: baseUrl + 'categorys/' + account,
                type: 'get'
            }).done(res => {
                if (res.code == 200) {
                    const data = res.data.category;
                    data.forEach((key) => {
                        catgoryData.set(key.cgId, key.cgName);
                        addCategoryToPanel(key.cgId, key.cgName);
                        addCategoryToSelectOp(key.cgId, key.cgName);
                    })
                }
                resolve();
            });
        })

        //testData
        // catgoryData.set(0, "音响");
        // catgoryData.set(1, "相机");
        // catgoryData.set(2, "录音");
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
        swf: '../plunge/Uploader.swf',
        // 上传并发数。允许同时最大上传进程数[默认值：3]   即上传文件数
        threads: 3,
        //文件接收服务端接口
        server: baseUrl + "file/upload",
        // 选择文件的按钮
        pick: { id: '#imagePicker' },
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
        $progress.text('上传中:' + Math.round(percentage * 100) + "%");
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
        uploadImg.push(response.data);

        //图片上传结束
        if (imageUploader.getStats().progressNum == 0) {
            var data = $('#add-device-form').serializeArray();

            //把获取的数组转化为对象 把获取的图片地址剪切进来
            data = formatObj(data);
            //管理员账号设置
            data.eqAdmin = account;
            //图片
            data.images = JSON.stringify(uploadImg);
            $.ajax({
                url: baseUrl + "devices/" + account,
                type: "POST",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                data: JSON.stringify(
                    data
                ),
                success: function (res) {
                    if (res.code == 200) {
                        alert("新增成功");
                        addDataToDeviceTable(res.data);
                    } else {
                        switch (res.code) {
                            case 201:
                                alert('此设备号编号已经存在,请重新设置');
                                break;
                            default:
                        }
                    }
                    uploadImg = [];
                },
                error: function () {
                    alert("网络错误")
                }
            })
        }

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



