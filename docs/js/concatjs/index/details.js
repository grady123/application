(function () {
	'use strict';
	var T = new AllFunc();
	var vId = '#vue-ping-details';
	var pageId = '#page-details';
	var url = './parts/index/details.html';
	var moniData = {
		a: {
			attachments: []
		},
		b: [],
		c: {
			type: 1, //1=待审批 2=已审批 3=抄送我的 4=我发起的
			tipImgSrc: './images/succes@1x.png',
			processDefinitionKey: 'w'
		},
		buttom: [],
		otherMore: []
	};
	var ID = {
		userId: '6605'
	}; //6605、、、6498
	if (T.LoginInfo.userId) {
		ID.userId = T.LoginInfo.userId;
	}
	var refOption = {
		nameKey: 'detailsData',
		id: pageId,
		fucKey: 'goDetails',
		dataKey: 'data',
		data: moniData
	};
	var urlDele = '/nets-budget/api/reimburse/delete'; //删除列表
	var urlD = '/nets-budget/api/reimburse/recall'; //撤消操作URL
	var Cancel = '/nets-budget/api/reimburse/cancel'; //作废列表
	T.Load(url, pageId, callFuc, vId);
	T.Ref(refOption);

	function callFuc() {
		var allData = {
			pageShow: false,
			data: moniData
		};
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
							T.GoPage();
						});
						T.AllData.list.GetData();
					}, {
						"id": d.id
					});
				}
			},
			// 撤回
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
							setTimeout(function () {
								T.GoPage();
								T.AllData.list.GetData();
							}, 1500);
						});
					}, putData);
				}
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
							setTimeout(function () {
								T.GoPage();
								T.AllData.list.GetData();
							}, 1500);
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
			//后退
			backOff: function () {
				T.GoPage();
			},
			//展开
			showDom: function (e) {
				var $this = $(e.currentTarget);
				var warp = $this.parents('.details-data-warp');
				if (warp.hasClass('dsc-hide')) {
					warp.removeClass('dsc-hide');
					$this.find('.change-text').text('收起');
				} else {
					warp.addClass('dsc-hide');
					$this.find('.change-text').text('展开');
				}
			},
			//到明细里面去
			goDsc: function (d, str, type) {
				T.AllData.datailsDsc.goDsc({
					type: type,
					title: str,
					data: d
				});
			},
			//到流程操作面里去
			goOper: function (d, o) {
				allData.data.complete.approveAction = d.btnCode;
				T.AllData.operDsc.goOper({
					complete: allData.data.complete,
					data: d,
					other: allData.data
				});
				if (o) {
					ms.oMore();
				}
			},
			//查看更多或取消更多
			oMore: function (o) {
				if (o) {
					$(vm.$refs.bw).addClass("pre-moreBwS");
				} else {
					$(vm.$refs.bw).removeClass("pre-moreBwS");
				}

			}
		};


		var vm = T.V(vId, allData, ms, {
			userInput: ms.wh
		}); //new Vue
		T.N(vm, function () {
			vm.pageShow = true;
		}); //页面显示
		T.Ref(refOption, ref);
		var domHtml = false;
		ref();

		function ref() {
			var d = T.AllData.detailsData.data;
			d.a.curApproveUserName = $.trim(d.a.curApproveUserName);
			if (!d.a.curApproveUserName) {
				d.a.curApproveUserName = false;
			}
			var arr1 = [];
			var arr2 = [];
			if (d.buttom.length > 4) {
				$.each(d.buttom, function () {
					if (this.btnName.length < 5 && arr1.length < 3) {
						arr1.push(this);
					} else {
						arr2.push(this);
					}

				});
				d.buttom = arr1;
			}

			allData.data = d;
			allData.data.otherMore = arr2;
			T.N(vm, function () {
				if (domHtml) {
					domHtml.each(function () {
						$(this).prop("style", false);
					});
				}
				setTimeout(function () {
					//详情页高度处理
					domHtml = $(".list-warp");
					domHtml.each(function () {
						var that = $(this);
						that.height(that.find('.list-get-heigth').height());
					});
					//流程等高度处理
					$(".get-height").each(function () {
						var that = $(this);
						var h = that.height();
						that.parent(".other-list-warp").height(h);
					});
				}, 300);

			});

		}
	}

})();
