//列表查询页面
(function () {
	'use strict';
	var ID = {
		userId: '6502'
	}; //6605、、、6498 6359
	var T = new AllFunc();
	var vId = '#vue-moblieApproval-list';
	var pageId = '#page-list';
	var url = './parts/index/list.html';
	//自动登录 ---------------------
	T.AutoLogin(ID,'', function () {
		T.Load(url, pageId, callFuc, vId);
	});
	//自动登录 end---------------------------------
	var userDate = new Date().getTime();
	// 得到零点时时
	function zeroTime(T) {
		return new Date(new Date(T).toLocaleDateString()).getTime();
	}

	//保留两位小数
		T.F('setMoney', function (d) {
		var f = parseFloat(d, 10);
		if (!f) {
			return '0.00';
		}
		var s = f.toString();
		var rs = s.indexOf('.');
		if (rs < 0) {
			rs = s.length;
			s += '.';
		}
		while (s.length <= rs + 2) {
			s += '0';
		}
		var temp=s.split(".");
		temp[1]=temp[1].slice(0,2);
		s=temp.join(".");
		return s;
	});
	//时间转转-拼接
	function tForm(d) {
		var t = new Date(d);
		var t1 = t.getMonth() + 1;
		t1 = t1 < 10 ? '0' + t1 : t1;
		var t2 = t.getDate();
		t2 = t2 < 10 ? '0' + t2 : t2;
		return t.getFullYear() + '-' + t1 + '-' + t2;
	}
	//判断是否跨年，跨年显示年
	function tyear(d) {
		var thisT = d.split(' ')[0];
		d = thisT.slice(5);
		return parseInt(thisT.split('-')[0], 10) < new Date().getFullYear() ? thisT : d;
	}

	//当时就显示时分，跨年就显示年
	T.F("isNow", function (d) {
		if (!d) {
			return '';
		}
		d = parseFloat(d);
		var d2 = zeroTime();
		if (d > d2) {
			d2 = new Date(d);
			var t1 = d2.getHours(),
				t2 = d2.getMinutes();
			return (t1 < 10 ? '0' + t1 : t1) + ':' + (t2 < 10 ? '0' + t2 : t2);
		}
		return tyear(tForm(d));
	});
	//时间格式转换
	T.F('setT', function (d) {
		if (!d) {
			return '';
		}
		return tForm(d);
	});

	T.F('setdate', function (d) {
		return tyear(d);
	});
	T.F('card', function (d) {
		var v = d.toString();
		v.replace(/\s/g, '').replace(/(.{4})/g, "$1 ");
	});
	T.F('iTyep', function (d) {
		var str = '增值税专用发票';
		d = parseInt(d, 10);
		if (d === 2) {
			str = '增值税普通发票';
		}
		if (d === 3) {
			str = '行政专用收据';
		}
		return str;
	});

	T.F("tip", function (key) {
		var tipStr = {
			'-1': '未通过',
			'0': '待发起',
			'1': '待审批',
			'2': '已通过',
			'3': '审批中',
			'4': '已完成',
			'5': '待发起',
			'6': '已撤回',
			'7': '已作废',
			'8': '已退回',
			'10': '已反审'
		};
		return tipStr[key];
	});

	function callFuc() {
		//当前页参数
		var userInfo = {
			key: '',
			pageNum: 1,
			pageSize: 20,
			approveStatus: '',
			startStr: '',
			endStr: '',
			createby: ID.userId
		};
		//进入详情页参数
		var detailsInfo = {
			complete: {
				loginUserId: ID.userId,
				businessKey: '',
				approveAction: 'start_user_reback',
				processInstanceId: ''
			},
			a: {},
			b: [],
			c: {},
			buttom: [] //a为详情信息，b为流程信息，c为该列的信息,buttom请求到的buttom信息 
		};
		var urlB = './api/list.json'; //请求列表地址
		var urlD = '/nets-budget/api/reimburse/recall'; //撤消操作URL 
		var urlDele = '/nets-budget/api/reimburse/delete'; //删除列表
		var Cancel = '/nets-budget/api/reimburse/cancel'; //作废列表

		//各详情页请求URL
		var detailsUrl = {
			bottom: '/nets-authority/api/workflow/get_business_form_button_list', //获取业务表单的操作按钮（同意、撤回等）
			allHas: '/nets-authority/api/workflow/opinion_list', //获取流程与附件
			personal_reimbursement: '/nets-budget/api/reimburse/get_by_id', //个人报销	
		};
		var thisUrl = 'personal_reimbursement';
		var allData = {
			pageShow: false,
			//列表类型
			listType: {},
			//时间选择
			timeList: {
				data: [{
					name: '全部',
					key: 0,
					ks: true
				}, {
					name: '本周',
					key: 1,
					ks: false
				}, {
					name: '本月',
					key: 2,
					ks: false
				}, {
					name: '本季',
					key: 3,
					ks: false
				}, {
					name: '本年',
					key: 4,
					ks: false
				}, {
					name: '自定义',
					key: 5,
					ks: false
				}],
				now: 0
			},
			//列表数据
			listData: {
				data: []
			},
			typeNmae: '待审批',
			modeS: '',
			modeTime1: tForm(userDate),
			modeTime2: tForm(userDate)
		};
		var $dom = false;
		var ms = {
			//作废
			cancellation: function (d) {
				T.PopupTip('是否确定作废！', function () {
					setBack1(d);
				});

				function setBack1(d) {
					T.MyPost(Cancel, function (data) {
						T.ResOk(data, function () {
							T.Tip('作废成功');
							GetData();
						});
					}, {
						"id": d.id
					});
				}
			},
			//后退
			backOff: function () {
				T.GoPage();
			},
			//显示弹窗
			SelecShow: function (str) {
				if ($dom) {
					var r = str === 'selec-show' ? 'selec-type-show' : 'selec-show';
					$dom.removeClass(r);
					if ($dom.hasClass(str)) {
						$dom.removeClass(str);
					} else {
						$dom.addClass(str);
					}
				}
			},
			//隐藏弹窗
			SelecHide: function (str, n) {
				if ($dom) {
					if (allData.timeList.now === 5) {
						if (!allData.modeTime1) {
							T.Tip('开始时间不能为空');
							return false;
						}
						if (!allData.modeTime2) {
							T.Tip('结束时间不能为空');
							return false;
						}
						userInfo.startStr = zeroTime(allData.modeTime1);
						userInfo.endStr = zeroTime(allData.modeTime2) + 1000 * 3600 * 24;
						if (userInfo.endStr < userInfo.startStr) {
							T.Tip('结束时间不能小于开始时间');
							return false;
						}

					}

					if (!n) {
						userInfo.key = allData.modeS;
						GetData();
						$dom.removeClass(str);
					} else {
						$dom.removeClass('selec-type-show selec-show');
					}
				}
			},
			//搜索
			searchClic: function () {
				ms.SelecHide(true, true);
				userInfo.key = allData.modeS;
				GetData();
			},
			keysearch: function (e) {
				if (parseInt(e.keyCode) === 13) {
					e.preventDefault();
					ms.searchClic();
				}
			},

			//类型选择
			typeS: function (d, n) {
				var dt = allData.listType;
				if (n === dt.now) {
					return false;
				}
				d.ks = true;
				dt.data[dt.now].ks = false;
				dt.now = n;
				userInfo.approveStatus = d.key;
			},
			//时间选择
			timeS: function (d, n) {
				var dt = allData.timeList;
				if (n === dt.now) {
					return false;
				}
				d.ks = true;
				dt.data[dt.now].ks = false;
				dt.now = n;
				var nowTime = new Date(new Date().toLocaleDateString());
				var day = 1000 * 60 * 60 * 24;
				var t1 = nowTime.getTime() + day;
				if (n === 5) {
					$(vm.$refs.timeInputWarp).addClass('time-input-show');
				} else {
					$(vm.$refs.timeInputWarp).removeClass('time-input-show');
				}
				userInfo.endStr = t1;
				switch (n) {
					case 0:
						userInfo.startStr = '';
						userInfo.endStr = '';
						break;
					case 1:
						userInfo.startStr = t1 - (nowTime.getDay() < 1 ? 7 : nowTime.getDay()) * day;
						break;
					case 2:
						userInfo.startStr = t1 - nowTime.getDate() * day;
						break;
					case 3:
						var m = nowTime.getMonth();
						m = m < 3 ? 1 : m < 6 ? 4 : m < 9 ? 7 : 10;
						m = nowTime.getFullYear() + '/' + m + '/1';
						userInfo.startStr = new Date(m).getTime();
						break;
					case 4:
						userInfo.startStr = new Date(nowTime.getFullYear() + '/1/1').getTime();
						break;
				}
			},
			//重置
			reduction: function () {
				ms.timeS(allData.timeList.data[0], 0);
				ms.typeS(allData.listType.data[0], 0);
			},
			GoDsc: function (d) {
				detailsInfo.c = d;
				GetDsc();
			},
			//删除
			dele: function (d) {
				T.PopupTip('是否确定删除！', function () {
					shureDele(d);
				});

				function shureDele(d) {

					T.MyPost(urlDele, function (data) {
						T.ResOk(data, function () {
							T.Tip('删除成功');
							GetData();
						});
					}, {
						ids: d.id
					});
				}
			},
			//编辑
			edit: function (d) {
				T.AllData.userInput.ref({
					data: d
				});
			},
			oper: function (d) {
				T.PopupTip('是否确定撤回流程！', function () {
					setBack(d);
				});

				function setBack(d) {
					var putData = {
						businessKey: d.id,
						userId: ID.userId,
						approveContent: '撤回'
					};
					T.MyPost(urlD, function (data) {
						T.ResOk(data, function () {
							T.Tip('撤回成功');
							GetData();
						});
					}, putData);
				}
			}
		};

		var vm = T.V(vId, allData, ms, {
			userInput: ms.wh
		}); //new Vue
		//页面显示,及初始化
		T.N(vm, function () {
			vm.pageShow = true;
			$dom = $(vm.$refs.dataWarp);
		});
		ThisRef();

		function ThisRef() {
			//得到列表类型
			GetType([{
				shortName: '全部',
				key: ''
			}, {
				shortName: '新建中',
				key: '0'
			}, {
				shortName: '已通过',
				key: '2'
			}, {
				shortName: '审批中',
				key: '3'
			},{
				shortName: '待发起',
				key: '5'
			},{
				shortName: '已撤回',
				key: '6'
			}, {
				shortName: '已作废',
				key: '7'
			}, {
				shortName: '已退回',
				key: '8'
			}, {
				shortName: '已反审',
				key: '10'
			}]);
			GetData();
		}

		//得到列表	
		function GetData(ks) {
			if (ks) {
				userInfo.pageNum += 1;
			} else {
				userInfo.pageNum = 1;
				$("#scro").scrollTop(0);
			}
			T.MyPost(urlB, GetList, userInfo);
		}
		//得到筛选列表
		function GetType(data) {
			var obj = [];
			$.each(data, function () {
				this.ks = false;
				obj.push(this);
			});
			obj[0].ks = true;

			allData.listType = {
				now: 0,
				data: obj
			};

		}


		T.AllData.list = {
			'GetData': GetData,
			'GetDsc': GetDsc
		};

		function GetDsc() {
			var ksN = 0;
			T.LdShow();
			var d = detailsInfo;
			//获取业务表单的操作按钮（同意、撤回等）
			var n = parseInt(d.c.approveStatus, 10);
			d.complete.businessKey = d.c.id;
			d.complete.processInstanceId = d.c.flowInstanceId;
			/*			//如果待审批需要底部按钮则n===3||n===1
						if(n===3){
							//获取业务表单的操作按钮（同意、撤回等）
							GetA(detailsUrl.bottom,'buttom',{processInstanceId:d.c.flowInstanceId,userId:ID.userId});
							}else{
								ksN++;
								d.buttom=[];
								Last();
								
								}	*/
			ksN++;
			if (n === 3) {
				//显示撤回按钮
				d.buttom = [1];
			} else if (n === 5||n === 0) {
				//显示删除与编辑按钮
				d.buttom = [2];
			} else if (n === 8 || n === 6) {
				//显示作废与编辑按钮
				d.buttom = [3];
			} else {
				d.buttom = [];
				Last();
			}
			//得到详情
			var putData = {
				id: d.c.id
			};
			GetA(detailsUrl[thisUrl], 'a', putData);

			//得到记录
			if (d.c.flowInstanceId) {
				GetA(detailsUrl.allHas, 'b', {
					processInstanceId: d.c.flowInstanceId
				});
			} else {
				ksN++;
				d.b = [];
				Last();
			}




			function GetA(url, key, o) {
				T.MyGet(url, function (d) {
					T.ResOk(d, function (td) {
						detailsInfo[key] = td;
						ksN++;
						Last();
					});
				}, o, true);

			}

			function Last() {
				if (ksN === 3) {
					T.LdHide();
					T.AllData.detailsData.goDetails(detailsInfo);
				}
			}
		}

		function GetList(data) {

			T.ResOk(data, function (d) {
				d = d || {};
				var obj = [];
				var o = d.data;

				$.each(o, function () {
					var s = parseInt(this.approveStatus, 10);
					this.processDefinitionKey = thisUrl;

					//显示撤回按钮
					if (s === 3) {
						this.showButton1 = true;
					} else {
						this.showButton1 = false;
					}
					//显示删除与编辑按钮
					if (s === 0||s === 5) {
						this.showButton2 = true;
					} else {
						this.showButton2 = false;
					}
					//显示作废与编辑按钮
					if (s === 8 || s === 6) {
						this.showButton3 = true;
					} else {
						this.showButton3 = false;
					}

					this.tipImgSrc = false;
					//已完成或已通过（现在意义一样）
					if (s === 2 || s === 4) {
						this.tipImgSrc = './images/succes@1x.png';
						//未通过
					} else if (s < 0) {
						this.tipImgSrc = './images/fail@1x.png';
					}

					this.hasP = (this.showButton1 || this.showButton2 || this.showButton3) ? true : false;

					obj.push(this);
				});
				//判断是否是加载更多
				if (nowLoading) {
					d.data = allData.listData.data.concat(obj);

					setTimeout(function () {
						nowLoading = false;
					}, 1000);

				} else {
					d.data = obj;
				}
				//下拉刷新完成。
				if (topRefHide) {
					topRefHide();
					topRefHide = false;
				}
				allData.listData = d;

			});
		}
		var nowLoading = false;
		var topRefHide = false;
		//上拉更新
		T.topRef("#scro", function (h) {
			GetData();
			topRefHide = h;
		});
		T.IsLast($("#scro")[0], 100, function () {
			if (!nowLoading && allData.listData.hasNext) {
				nowLoading = true;
				GetData(true);
			}
		});

	}

})();
