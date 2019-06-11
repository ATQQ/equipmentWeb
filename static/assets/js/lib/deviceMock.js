
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
        'eqDate|10000-20000': 0,  // 创建日期
        'introduce|10000-20000': 0,  // 设备的介绍
        'eqAdmin': '@cname',  // 创建人
        'images|1': ['1.png','2.png','3.png','4.png','5.png'],  // 从obj对象中随机获取1至3个属性
    }
        ]
});
       $.ajax({
   url: 'http://test.com',
   type: 'get',
   dataType: 'json'
}).done(function(data, status, xhr) {
   console.log(data);
});