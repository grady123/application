(function() {
    'use strict';
    var ID={userId:1};
    var T = new AllFunc();
    var vId='#fillForm';
    var pageId="#page-userInput";
    var url='./parts/index/userInput.html';
    var refOption = {
        nameKey: 'userInput',
        id: '#page-userInput',
        fucKey: 'ref',
        dataKey: 'data',
        data: {
            data: {}
        }
    };
    var judge=true;
    T.Ref(refOption);
    //过滤器
    (function () {
        function add0(m){return m<10?'0'+m:m }
        Vue.filter('billsTime',function(shijianchuo){
            //shijianchuo是整数，否则要parseInt转换
            var time = new Date(shijianchuo);
            var y = time.getFullYear();
            var m = time.getMonth()+1;
            var d = time.getDate();
            return y+'-'+add0(m)+'-'+add0(d);
        });
    })();
    T.Load(url,pageId,user_Input);
    var  number=0;
    function user_Input() {
        //用户
        console.log(T.LoginInfo);
        function LoginInfo() {
            if(T.LoginInfo.userId){
                iV.userId=T.LoginInfo.userId;
                iV.createbyName=T.LoginInfo.userName;
                //报销人部门
                if(T.LoginInfo.userOrgList){
                    iV.applyOrgId=T.LoginInfo.userOrgList[0].id;
                    iV.applyOrgName=T.LoginInfo.userOrgList[0].orgUnitName;
                    T.LoginInfo.userOrgList.forEach(function (v,i) {
                        v.name=v.orgUnitName;
                    });
                    if(number==0){
                        var sData= new lArea();
                        sData.init({'trigger': '#applyMan','data':T.LoginInfo.userOrgList,'callBack':function (d) {
                            iV.applyOrgId=d[0].id;
                            iV.applyOrgName=d[0].orgUnitName;
                        }});
                    }
                }
            }else {
                iV.userId=6502;
                iV.createbyName='黄先生测试';
                iV.applyOrgName='新城测试环境';
                iV.applyOrgId=1347;
            }
            T.MyGet('./api/login.json',function(res){
                console.log(res.data.userOrgList)
                var sData= new lArea();
                res.data.userOrgList.forEach(function (v,i) {
                    v.name=v.orgUnitName;
                });
                sData.init({'trigger': '#applyMan','data':res.data.userOrgList,'callBack':function (d) {
                    iV.applyOrgId=d[0].id;
                    iV.applyOrgName=d[0].orgUnitName;
                }});
            });
        }
        //     日期
        var t=new Date();
        var tempDate=t.getFullYear()+'-'+(t.getMonth()+1>=10?t.getMonth()+1:'0'+(t.getMonth()+1) )+'-'+(t.getDate()>=10?t.getDate():'0'+t.getDate());
        var year=t.getFullYear();
        var click=false;
        //支付明细序号
        var num='';
        //存储没还金额
        var repay=0;
        var data={
            Added:'',
            userId:'',
            reimburseSn:'',
            id:'',
            menu:false,
            menu1:false,
            initData:'',
            file:[],
            //详情附件
            file1:[],
            sum:0,
            //没还金额
            repay:0,
            list:[],
            paymentDetails:[],
            receiptType:'',
            bankName:'',
            bankAccount:'',
            itemList:[],
            submitMoney:0,
            collectionDate:'',
            relNonTaxMoney:'',
            nonTaxMoney:'',
            /*详情字段---------------------------*/
            reimburseTitle:'',
            applyOrgName:'',
            totalMoney:'',
            taxMoney:'',
            reimburseRemark:'',
            createbyName:'',
            applyOrgId:'',
            year:'',
            createDate:'',
            payStatus:'',
            approveStatus:'',
            extent:[],
            //付款性质
            paymentPropertyId:"",
            paymentPropertyName:"",
            //环境
            environment:''
        };
        var ms ={
            billsTime:function (shijianchuo) {
                function add0(m){return m<10?'0'+m:m }
                //shijianchuo是整数，否则要parseInt转换
                var time = new Date(shijianchuo);
                var y = time.getFullYear();
                var m = time.getMonth()+1;
                var d = time.getDate();
                return y+'-'+add0(m)+'-'+add0(d);
            },
            //预算单元
            selChange:function(i){
                T.AllData.selectUnitstatus = false;
                var that=this;
                var callBack = function(data){
                    console.log(data)
                    that.itemList[i].evaluationOrgId=data.id;
                    that.itemList[i].evaluationOrgName=data.name;
                    that.itemList[i].unitName=data.name;
                };
                T.AllData.selectUnit(this.userId,this.createbyName,callBack)
            },
            //预算科目
            budgetsubject:function (i) {
                num=i;
                T.AllData.noteTakingSubjectSelect.ref({itemlist:this.initData.item,'userid':iV.userId});
            },
            //获取详情
            getData1:function(){
                T.MyGet('./api/get_by_id.json',function(res){
                    var that=this;
                    if(res.status==0){
                        console.warn('获取详情');
                        console.log(res);
                        console.warn('END');
                        var data=res.data;
                        res.data.itemList.forEach(function (v,i) {
                            v.businessDate=that.billsTime(v.businessDate);
                            if(v.invoiceType==1){
                                v.invoiceType='增值税专用发票'}else if(v.invoiceType==2){
                                v.invoiceType='增值税普通发票'}else if(v.invoiceType==3){
                                v.invoiceType='行政专用收据'
                            }
                        });
                        //报销明细
                        this.itemList=data.itemList;
                        //其他
                        this.reimburseTitle=data.reimburse.reimburseTitle;
                        this.applyOrgId=data.reimburse.applyOrgId;
                        this.applyOrgName=data.reimburse.applyOrgName;
                        this.totalMoney=data.reimburse.totalMoney;
                        this.taxMoney=data.reimburse.taxMoney;
                        // this.sum=data.reimburse.relTotalMoney;
                        this.bankName=data.reimburse.receiptBank;
                        this.bankAccount=data.reimburse.receiptBankAccount;
                        this.userId=data.reimburse.createby;
                        this.createbyName=data.reimburse.createbyName;
                        this.reimburseRemark=data.reimburse.reimburseRemark;
                        this.year=data.reimburse.year;
                        this.payStatus=data.reimburse.payStatus;
                        this.approveStatus=data.reimburse.approveStatus;
                        this.file1=data.attachmentList;
                        this.createDate=that.billsTime(data.reimburse.createDate);
                        this.collectionDate=that.billsTime(data.reimburse.collectionDate);
                        //借款
                        this.list=data.borrowList2;
                        this.count();/*计算*/
                        this.receiptTypeValue=data.reimburse.paymentMode;
                        if(data.reimburse.paymentMode==1){this.receiptType='银行转账'}else if(data.reimburse.paymentMode===2) {
                            this.receiptType='现金'}
                        this.replacement();/*绑定事件*/
                    }else{T.Tip(res.message);}
                }.bind(this),{'id':this.id});
            },
            //初始数据
            getData:function(){
                T.MyGet('./api/initParams.json',function(res){
                    var that=this;
                    if(res.status==0){
                        console.warn('初始数据');
                        console.log(res);
                        console.warn('END');
                        this.initData=res.data;
                        this.initData.taxRate.forEach(function (v,i) {
                            v.name=v.name.replace("%","");
                        });/*计算未还金额*/
                        T.MyGet('./api/get_by.json',function(res){
                            that.repay=0;
                            if(res.status==0){
                                that.extent= res.data;
                                res.data.forEach(function (v,i) {
                                    that.repay+=(v.borrowMoney-(v.borrowMoney-v.unpaymentMoney)-v.transitAmount);
                                });
                                repay=that.repay;
                            }else{T.Tip(res.message);}
                        }.bind(this),{'userId':iV.userId,'availableFlag':1,'payStatus':1});
                        iV.$nextTick(function(){
                            if(number==0){
                                number++;
                                //银行
                                this.initData.userBanks.forEach(function (v,i) {
                                    v.name=v.bankName+''+v.bankAccount;
                                });
                                var sData = new lArea();
                                sData.init({'trigger': '#savings','data': this.initData.userBanks,'callBack':function (d) {
                                    that.bankName=d[0].bankName;
                                    that.bankAccount=d[0].bankAccount;
                                }});
                                //付款方式
                                var sData1 = new lArea();
                                sData1.init({'trigger': '#repayment','data': this.initData.payments,'callBack':function (d) {
                                    that.receiptType=d[0].name;
                                    that.receiptTypeValue=d[0].value;
                                }});
                                //文件上传
                                $("#uploadInput").on("change", function(){
                                    var this1=$(this)[0];
                                    if(this1.files[0].size<1024*15*1024){
                                        for(var i=0;i<this1.files.length;i++){
                                            if(!this1.files[i]){return false;}
                                            var c=true;
                                            for (var a=0;a<that.file.length;a++){
                                                if(that.file[a].name==this1.files[i].name){
                                                    c=false;
                                                    this1.value='';
                                                }
                                            }
                                            if(c){
                                                that.file.push(this1.files[i]);
                                                this1.value='';
                                            }
                                        }
                                    }else{
                                        T.Tip("附件不能超过15M");
                                        this1.value='';
                                    }

                                });
                            }
                            if(iV.Added==1){this.getData1();}else {this.addition();}
                        });
                    }else{T.Tip(res.message);}
                }.bind(this),{'userId':this.userId});
            },
            //付款性质
            payment:function() {
                var time = new Date();
                var y = time.getFullYear();
                T.MyPost('/nets-budget/api/payPropertyItem/get_by_category',function(res){
                    if(res.status==0){
                    console.log(res)
                        //付款性质
                        var pay_type = new lArea();
                      pay_type.init({
                         n: 2,
                         'trigger': '#pay_type',
                         'data': ms.resetDataFormat(res.data),
                         'callBack': function (res) {
                         if (res.length) {
                             console.log(res)
                             data.paymentPropertyId=res[1].id;
                             data.paymentPropertyName=res[1].name;
                          }
                        }
                     });
                    }else{T.Tip(res.message);}
                },{"categoryId":3,"year":y});
            },
            // 重置数据格式
            resetDataFormat: function (d) {
                var pidList = d;
                var afterList = d;
                cnode(pidList);
                return afterList;

                function cnode (d) {
                    var n = afterList.length;
                    var newData = null;
                    var l = d.length;
                    var i = 0;
                    for (i = 0; i < l; i++) {
                        if (n > 0) {
                            newData = set(d[i].id, afterList);
                            afterList = newData.data;
                            if (newData.nodelist.length > 0) {
                                d[i].child = newData.nodelist;
                                cnode(d[i].child);
                            }
                        }
                    }
                }
                function set (n, data) {
                    n = parseInt(n, 10);
                    var t = 0,
                        l = 0,
                        arr1 = [],
                        arr2 = [],
                        i = 0;
                    l = data.length;
                    for (i = 0; i < l; i++) {
                        t = parseInt(data[i].pId, 10);
                        if (t === n) {
                            arr1.push(data[i]);
                        } else {
                            arr2.push(data[i]);
                        }
                    }
                    return {
                        nodelist: arr1,
                        data: arr2
                    };
                }
            },
            //借款
            bill:function () {
                T.GoPage('#page-bills', '');
                setTimeout(function(){
                    T.Event.emit('men1')
                },200);
            },
            //报销条数
            count:function () {
                var that=this;
                that.sum=0;
                that.paymentDetails=[];
                this.list.forEach(function (v,i) {
                    that.sum+=v.unpaymentMoney;
                    var obj={
                        "id": iV.Added==0?'':iV.id,
                        "reimburseSn": iV.Added==0?iV.initData.flowNo:iV.reimburseSn,
                        "borrowSn": v.borrowSn,
                        "relRemMoney": v.relRemMoney,
                        "borrowMoney": v.borrowMoney,
                        "unpaymentMoney": v.unpaymentMoney,
                        "borrowTitle":v.borrowTitle,
                        "createDate": that.billsTime(v.createDate),
                        "borrowType": v.borrowType,
                        "payOrgName": v.payOrgName,
                        "isRelRem": v.isRelRem
                    };
                    that.paymentDetails.push(obj)
                });
                this.repay=repay-this.sum;
                this.calculate();
            },
            //删除报销条数
            deleteFiles:function(i){
                this.list.splice(i,1);
                this.count();
            },
            //附件删除
            deleteFiles1:function(i){
                this.file.splice(i,1);
            },
            deleteFiles3:function(i){
                this.file1.splice(i,1);
            },
            //删除支付明细
            deleteFiles2:function(i){
                this.itemList.splice(i,1);
            },
            //添加支付明细
            addition:function () {
                var itemList={
                    "id":iV.Added==0?'':iV.id,
                    //报销单号
                    "reimburseSn": iV.Added==0?iV.initData.flowNo:iV.reimburseSn,
                    //业务日期
                    "businessDate": tempDate,
                    //预算科目Id
                    "subjectId": "",
                    //预算科目名称
                    "subjectName": "",
                    //预算单元
                    "evaluationOrgId": "",
                    "evaluationOrgName": "",
                    "unitName": "",
                    //票据类型
                    "invoiceType": "",
                    //票据编号
                    "invoiceNumber":"",
                    "invoiceContent": "",
                    //不含税价
                    "nonTaxMoney":'',
                    //税率
                    "taxRate":'',
                    //税额
                    "taxMoney":'',
                    //价税合计
                    "taxTotalMoney":'',
                    //实际申请(含税)
                    "relTaxMoney": 0,
                    //填制人（报销人）
                    "createby":this.userId,
                    //填制人姓名
                    "createbyName": this.createbyName,
                    //创建时间
                    "createDate":tempDate
                };
                this.itemList.push(itemList);
                this.replacement();/*帮事件*/
            },
            //绑定事件
            replacement:function () {
                //日期选择插件
                var that=this;
                var kkk= this.itemList;
                this.itemList=[];
                iV.$nextTick(function(){
                    that.itemList=kkk;
                    setTimeout(function () {
                        that.itemList.forEach(function (v,i) {
                            //业务日期
                            // $("#dateSelec"+i).attr('data-lcalendar',tempDate+',2099-06-16');
                            var sDate=new lCalendar();
                            sDate.init({'trigger': '#dateSelec'+i,'type': 'date'});
                            //票据类型
                            var sData1 = new lArea();
                            sData1.init({'trigger': '#repayment'+i,'data':that.initData.invoiceType});
                            //税率
                            var sData2 = new lArea();
                            sData2.init({'trigger': '#taxRate'+i,'data':that.initData.taxRate});
                        });
                    },100);
                });
            },
            //表单检验
            verify:function(){
                var that=this;
                if(!this.receiptType){T.Tip("付款方式不能为空");judge=false;}
                if(!this.receiptType){T.Tip("付款方式不能为空");judge=false;}
                if(this.receiptType=='银行转账'){
                    if(!this.bankName){T.Tip("收款银行不能为空");judge=false;}
                    if(!this.bankAccount){T.Tip("收款账号不能为空");judge=false;}
                }
                this.itemList.forEach(function (v,i) {
                    that.changeCount(v.nonTaxMoney,i);
                    if(v.taxRate==''){T.Tip("税率不能为空");judge=false;}
                    if(!v.nonTaxMoney){T.Tip("不含税价不能为空");   v.nonTaxMoney=' ';  judge=false;}
                    if(!v.invoiceType){T.Tip("票据类型不能为空");judge=false;}
                    if(!v.unitName){T.Tip("预算单元不能为空");judge=false;}
                    if(!v.subjectName){T.Tip("预算科目不能为空");judge=false;}
                    if(!v.businessDate){T.Tip("业务日期不能为空");judge=false;}
                });
                if(!this.paymentPropertyId){T.Tip("付款性质不能为空");judge=false;}
                if(!this.applyOrgName){T.Tip("部门不能为空");judge=false;}
                if(!this.reimburseTitle){T.Tip("主题不能为空");judge=false;}

                return judge;
            },
            //提交
            submit:function () {
                T.PopupTip('确定发起报销申请？',function(){
                    this.save(2);
                }.bind(this))
            },
            //保存
            save:function(vl){
                if(!this.verify()){judge=true; return}
                if(click){return;}
                click=true;
                vl=vl||1;
                this.itemList.forEach(function (v,i) {
                    if(v.invoiceType=='增值税专用发票'){
                        v.invoiceType=1}else if(v.invoiceType=='增值税普通发票'){
                        v.invoiceType=2}else if(v.invoiceType=='行政专用收据'){
                        v.invoiceType=3
                    }
                });
                var form={
                    "billAction": vl,
                    "reimburse": {
                        "commissionFlag":0,
                        "flowInstanceId":0,
                        "id":iV.Added==0?'':this.id,
                        "reimburseSn":  iV.Added==0?iV.initData.flowNo:iV.reimburseSn,
                        //报销主题
                        "reimburseTitle": this.reimburseTitle,
                        "payStatus":iV.Added==0?0:this.payStatus,
                        //报销合计
                        "totalMoney":this.totalMoney,
                        //税额
                        "taxMoney": this.taxMoney,
                        //报销金额
                        "relTaxMoney": this.submitMoney,
                        //本次借款（还差借款数）
                        "relTotalMoney": this.sum,
                        // 不含税价总数
                        "relNonTaxMoney": this.relNonTaxMoney,
                        //不含税金额
                        "nonTaxMoney": this.nonTaxMoney,
                        //归集日期
                        "collectionDate": this.collectionDate,
                        "attachmentNumber":"",
                        "approveStatus": iV.Added==0?0:this.approveStatus,
                        //填制人部门ID
                        "applyOrgId": this.applyOrgId,
                        //填制人部门名称
                        "applyOrgName": this.applyOrgName,
                        //实际付款单位Id
                        "payOrgId": this.applyOrgId,
                        //收款人
                        "payee":this.createbyName,
                        //付款方式：1银行，2现金
                        "paymentMode": this.receiptTypeValue,
                        //收款银行
                        "receiptBank":this.bankName,
                        "receiptBankAccount":this.bankAccount,
                        //说明
                        "reimburseRemark": this.reimburseRemark,
                        "year":iV.Added==0?year:this.year,
                        //填制人id
                        "createby": this.userId,
                        "createbyName": this.createbyName,
                        //创建时间
                        "createDate":iV.Added==0?tempDate:this.createDate,
                        "fileIds": "",
                        //付款性质
                        "paymentPropertyId":this.paymentPropertyId
                    },
                    //报销详情
                    "itemList": this.itemList,
                    //借款
                    "borrowList": this.paymentDetails
                };
                localStorage.setItem(iV.userId+"appForReim", JSON.stringify(this.bankName));
                localStorage.setItem(iV.userId+"appForReim1", JSON.stringify(this.bankAccount));
                if(this.file.length==0){
                    var arr0=[];
                    $.each(this.file1, function(i,val){
                        arr0.push(val.id);
                    });
                    form.reimburse.fileIds=arr0.join(",");
                    form.reimburse.attachmentNumber=this.file1.length;
                    form=JSON.stringify(form);
                    T.MyPost('/nets-budget/api/reimburse/save_or_update',function(res){
                        if(res.status==0){
                            if(vl==1){T.Tip('保存成功！');}else {T.Tip('提交成功！');}
                            setTimeout(function(){ T.GoPage();T.GoPage();T.AllData.list.GetData()},1500);
                        }else{T.Tip(res.message);}
                        setTimeout(function(){click=false;},1600);
                    },form);
                }else{
                    var that=this;
                    var arr=[];
                    var seveform=function(){
                        form.reimburse.fileIds=arr.join(",");
                        form.reimburse.attachmentNumber=that.file.length+that.file1.length;
                        form=JSON.stringify(form);
                        T.MyPost('/nets-budget/api/reimburse/save_or_update',function(res){
                            if(res.status==0){
                                if(vl==1){T.Tip('保存成功！');}else {T.Tip('提交成功！');}
                                setTimeout(function(){T.GoPage();T.GoPage();T.AllData.list.GetData()},1500);
                            }else{T.Tip(res.message);}
                            setTimeout(function(){click=false;},1600);
                        },form);
                    };
                    $.each(this.file1, function(i,val){
                        arr.push(val.id);
                    });

                    var  fd =new FormData();
                    this.file.forEach(function (item, index) {
                        fd.append('file'+index,item);
                    });
                    T.MyPost('/nets-budget/sys_file/mutil_upload',function(res){
                        if(res.status==0){
                            res.data.forEach(function (v,i) {
                                arr.push(v.id);
                            });
                            seveform();
                        }else{T.Tip(res.message);click=false;}
                    },fd);
                }
            },
            //判断金额
            changeCount:function(borrowMoney,i){
                console.log(borrowMoney)
                //var digits=this.data.digit;
                var digits=2;
                var borrowMoneyStr = borrowMoney+"";
                if(borrowMoney=="" || borrowMoney==0 ||borrowMoney==undefined){
                    // $("#borrowMoney").val("");
                    data.itemList[i].nonTaxMoney='';
                    T.Tip("不含税价金额不合法");
                    judge=false;
                }
                if(borrowMoneyStr.indexOf("..") > 0 ){
                    // $("#borrowMoney").val("");
                    data.itemList[i].nonTaxMoney='';
                    T.Tip("不含税价金额不合法");
                    judge=false;
                };
                var fix_amountTest=/^(([1-9]\d*)|\d)(\.\d{1,2})?$/;
                if(digits=="1"){
                    fix_amountTest=/^(([1-9]\d*)|\d)(\.\d{1,1})?$/;
                }else if(digits=="2"){
                    fix_amountTest=/^(([1-9]\d*)|\d)(\.\d{1,2})?$/;
                }else if(digits=="3"){
                    fix_amountTest=/^(([1-9]\d*)|\d)(\.\d{1,3})?$/;
                }else if(digits=="4"){
                    fix_amountTest=/^(([1-9]\d*)|\d)(\.\d{1,4})?$/;
                }
                if(fix_amountTest.test(borrowMoney)==false){
                    // borrowMoney = Number(borrowMoney).toFixed(digits);
                    //$("#borrowMoney").val(borrowMoney).trigger('change');
                    // this.borrowMoney=borrowMoney;
                    data.itemList[i].nonTaxMoney='';
                    T.Tip("不含税价金额不合法");
                    judge=false;
                }else{
                    borrowMoney = Number(borrowMoney).toFixed(digits);
                    // $("#borrowMoney").val(borrowMoney);
                }
            },
            //检验
            /*  clearNoNum: function (obj){
             obj = obj.replace(/[^\d.]/g,"");  //清除“数字”和“.”以外的字符
             obj = obj.replace(/\.{2,}/g,"."); //只保留第一个. 清除多余的
             obj = obj.replace(".","$#$").replace(/\./g,"").replace("$#$",".");
             obj = obj.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3');//只能输入两个小数
             if(obj.indexOf(".")< 0 && obj !=""){//以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
             obj= parseFloat(obj);
             }
             },*/
            //自动计算
            calculate:function () {
                var that=this;
                this.totalMoney=0;
                this.taxMoney=0;
                this.submitMoney=0;
                this.relNonTaxMoney=0;
                this.itemList.forEach(function (v,i) {
                    v.taxMoney=parseFloat((T.accMul(v.nonTaxMoney,T.accDiv(v.taxRate,100))).toFixed(that.initData.digit));
                    v.taxTotalMoney= parseFloat((T.accAdd(v.nonTaxMoney,v.taxMoney)).toFixed(that.initData.digit));
                    that.totalMoney+=(v.taxTotalMoney-0);
                    that.taxMoney+=(v.taxMoney-0);
                    that.relNonTaxMoney+=(v.nonTaxMoney-0);
                });
                this.totalMoney= this.totalMoney.toFixed(2);
                this.taxMoney= this.taxMoney.toFixed(2);
                //报销金额
                this.submitMoney=(T.accSub(this.totalMoney,this.sum)-0);
                //实际金额(不含税)=relTaxMoney-taxMoney
                this.nonTaxMoney=(T.accSub(this.submitMoney,this.taxMoney)-0);
            },
            GoPage:function () {
                T.GoPage();
            }
        };
        //	配置参数
        var iV ={
            methods:ms,
            el:'#fillForm',
            data:data,
            created:function(){
                if(typeof globalConfig=="object"){
                    if(globalConfig.sys.type==1){
                    //    旭辉系统
                        this.environment=1;
                        this.payment();
                    }else {
                        this.environment=0;
                    }
                }
            },
            watch:{
                //检测是否收款银行
                'receiptType':{
                    handler:function(curVal,oldVal){
                        if(this.receiptType=='现金'){
                            this.bankName='';
                            this.bankAccount='';
                        }
                    },
                    deep:true
                },
                'itemList':{
                    handler:function(curVal,oldVal){
                        this.calculate();
                    },
                    deep:true
                }
            }
        };
        iV = new Vue(iV);
        iV.$nextTick(function(){
            var that=this;
            //预算科目
            T.Event.on('noteTakingSubjectSelect', function (result) {
                that.itemList[num].subjectId=result.id;
                that.itemList[num].subjectName=result.name;
            });
            //借款条数
            T.Event.on('men',function (t) {
                t.forEach(function (v,i) {
                    var a=true;
                    that.list.forEach(function (val,ind) {
                        if(v.borrowSn==val.borrowSn){a=false;}
                    });
                    if(a){that.list.push(v)}
                });
                that.count();
            });
            //数据选择插件&借款类型联级
            var d= [{
                "id": "2",
                "name": "一级",
                "child": [{
                    "id": "21",
                    "name": "二级1",
                    "child": [{
                        "id": "211",
                        "name": "三级1"
                    }, {
                        "id": "212",
                        "name": "三级2"
                    }, {
                        "id": "213",
                        "name": "三级3"
                    }]
                }, {
                    "id": "22",
                    "name": "二级2"
                }, {
                    "id": "23",
                    "name": "二级3"
                }]
            }];
            // var sData1 = new lArea();
            // sData1.init({n:3,'trigger': '#receiptType','data':d});
            //日期选择插件
            // $("#date-selec").attr('data-lcalendar',tempDate+',2099-06-16');
            var sDate=new lCalendar();
            sDate.init({'trigger': '#date-selec','type': 'date'});
            function this_ref (d) {
                var data;
                if (T.AllData.userInput.data !== undefined) {// 接收回来的数据
                    data = T.AllData.userInput.data.data;
                    console.log(data);
                    if (data.id) {
                        console.log('数据过来了准备赋值吧----编辑');
                        that.paymentPropertyId=data.paymentPropertyId;
                        that.paymentPropertyName=data.paymentPropertyName;
                        that.Added=1;
                        that.id=data.id;
                        that.reimburseSn=data.reimburseSn;
                        that.file=[];
                        LoginInfo();
                        that.getData();
                    } else {
                        console.log('报销新增');
                        that.Added=0;
                        that.reimburseTitle='';
                        that.totalMoney='';
                        that.taxMoney='';
                        that.receiptType='银行转账';
                        var userBanks=JSON.parse(localStorage.getItem(iV.userId+"appForReim"));
                        var userBanks1=JSON.parse(localStorage.getItem(iV.userId+"appForReim1"));
                        if(userBanks){
                            that.bankName=userBanks;
                            that.bankAccount=userBanks1;
                        }else {
                            that.bankName='';
                            that.bankAccount='';
                        }
                        that.paymentPropertyId='';
                        that.paymentPropertyName='';
                        that.receiptTypeValue=1;
                        that.reimburseRemark='';
                        that.itemList=[];
                        that.list=[];
                        that.file=[];
                        that.file1=[];
                        that.sum=0;
                        that.collectionDate=tempDate;
                        LoginInfo();
                        that.getData();
                    }
                }
            }
            T.Ref(refOption, this_ref);
            this_ref();
        });
    }
})();
