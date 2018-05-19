(function () {
	'use strict';
	var T = new AllFunc();
	var vId = '#vue-details-a';
	var pageId = '#page-details-a';
	var url = './parts/index/details-a.html';
	var refOption = {
		nameKey: 'datailsDsc',
		id: pageId,
		fucKey: 'goDsc',
		dataKey: 'data',
		data: {
			title: '详情',
			data: false,
			type: 1
		}
	};
	T.Ref(refOption);
	T.Load(url, pageId, callFuc, vId);

	function callFuc() {
		var allData = {
			pageShow: false,
			data: {}
		};
		var ms = {
			//后退
			backOff: function () {
				T.GoPage();
			},
			show: function (d) {
				$.each(allData.data.data, function () {
					this.show = false;
				});
				d.show = true;
				allData.data = JSON.parse(JSON.stringify(allData.data));
			}

		};
		ref();
		var vm = T.V(vId, allData, ms); //new Vue
		T.N(vm, function () {
			vm.pageShow = true;
		}); //页面显示
		T.Ref(refOption, ref);

		function ref() {
			if (T.AllData.datailsDsc.data.type === 3) {
				$.each(T.AllData.datailsDsc.data.data, function () {
					this.show = false;
				});
			}

			allData.data = T.AllData.datailsDsc.data;
		}
	}


})();
