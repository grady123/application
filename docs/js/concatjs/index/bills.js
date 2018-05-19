(function() {
    'use strict';
    var ID={userId:1};
    var T = new AllFunc();
    var vId='#bills';
    var pageId="#page-bills";
    var url='./parts/index/bills.html';


    //过滤器
    T.Load(url,pageId,user_Input);
    function user_Input() {
        //开发参数
        var params = {'userId':6502,ary:[]};

        //用户
        console.log(T.LoginInfo);
        if(T.LoginInfo.userId){
            params.userId=T.LoginInfo.userId;
        }
        //共同传的参数
        T.AllData.newlyData =params;
        var data={
            data:'',
            allSelect:false,
            ary:[],
            //总数
            sum:0
        };
        var ms ={
            //获取主页数据
            getData:function(){
                T.MyGet('./api/get_by.json',function(res){
                    if(res.status==0){
                        console.warn('初始数据');
                        console.log(res);
                        console.warn('END');
                        var a=[];
                        res.data.forEach(function (item,i) {
                            item.unpaymentMoney=item.borrowMoney-(item.borrowMoney-item.unpaymentMoney)-item.transitAmount;
                            if(item.unpaymentMoney!=0){
                                a.push(item)
                            }
                        });

                        this.data=a;
                    }else{
                        T.Tip(res.message);
                    }
                }.bind(this),{'userId':params.userId});
            },
            select:function (i) {
                if(this.ary.indexOf(i)===-1){
                    this.ary.push(i)
                }else {
                    this.ary.splice(this.ary.indexOf(i),1)
                }
                if(this.data.length==this.ary.length){
                    this.allSelect=true;
                }else {
                    this.allSelect=false;
                }
            },
            allSelect1:function (v) {
                if(v){
                    for (var i=0;i<this.data.length;i++){
                        if(this.ary.indexOf(i)===-1){
                            this.ary.push(i)
                        }
                    }
                }else {
                    this.ary=[]
                }
            },
            confirm:function () {
                if(this.ary.length===0){
                    T.Tip('请选择借款');
                    return
                }
                params.ary=[];
                var that=this;
                this.ary.forEach(function (v,i) {
                    params.ary.push(that.data[v])
                });
                setTimeout(function(){
                    T.Event.emit('men',params.ary)
                },200);
                T.GoPage();
            }
        };

        //	配置参数
        var iV ={
            methods:ms,
            el:'#bills',
            data:data,
            created:function(){
                this.getData()
            },
            watch:{
                'ary':{
                    handler:function(curVal,oldVal){
                        var that=this;
                        that.sum=0;
                        this.ary.forEach(function (v,i) {
                            that.sum+=that.data[v].unpaymentMoney
                        });
                    },
                    deep:true
                },
            }
        };
        iV = new Vue(iV);
        iV.$nextTick(function(){
            var that=this;
            //重置
            T.Event.on('men1',function (v) {
                that.ary=[];
                that.allSelect=false;
            });
            $(".go1").on("click", function() {
                T.GoPage();
            });
        });
    }
})();
