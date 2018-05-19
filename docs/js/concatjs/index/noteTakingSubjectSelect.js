(function () {
    'use strict';
    var T = new AllFunc();
    var allData = {};

    T.Load('./parts/index/noteTakingSubjectSelect.html', "#page_budget_subjects", function () {

        var MAX_HISTORY = 20;
        var vm = new Vue({
            el: '#note_taking_subject_select_wrap',
            data: {
                userid: '',
                itemlist: [],
                navList: [],
                navWidth: '',
                isHotSubject: true,//是常用 预算科目   还是预算科目选择  nav
                AllSubjectData: {},// 所有科目 的数据   第一次交互过来的
                items: [],
                historyList: JSON.parse(window.localStorage.getItem('historyList')) || [],
                searchVal: ''
            },
            computed: {},
            created: function () {

            },
            mounted: function () {
                var _this = this;
                setTimeout(function () {
                    var itemList = _this._resetDataFormat(_this.itemlist);

                    var allList = [];
                    itemList.forEach(function (item, index) {
                        allList.push(_this.seachChildrenList(item));
                    });
                    _this.AllSubjectData = {
                        name: '预算科目',
                        childrenList: allList
                    };
                    if (!_this.navList.length) {
                        _this.navList.push(_this.AllSubjectData);
                    }

                }, 300);
            },
            methods: {
                goBack: function () {
                    this.isHotSubject = true;
                    this.navList.splice(1);
                    this.searchVal = '';
                    T.GoPage();
                },
                // 查看全部
                cheKanAll: function () {
                    this.isHotSubject = false;
                    this._getNavListWidth();
                },
                // 重置数据结构
                _resetDataFormat: function (d) {
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
                                    d[i].childrenList = newData.nodelist;
                                    cnode(d[i].childrenList);
                                }
                            }
                        }
                    }

                    function set (n, data) {
                        n = parseInt(n, 10);
                        var t = 0, l = 0, arr1 = [], arr2 = [], i = 0;
                        l = data.length;
                        for (i = 0; i < l; i++) {
                            t = parseInt(data[i].pId, 10);
                            if (t === n) {
                                arr1.push(data[i]);
                            } else {
                                arr2.push(data[i]);
                            }
                        }
                        return {nodelist: arr1, data: arr2};
                    }
                },
                // 查找是否有childrenList
                seachChildrenList: function (json) {
                    if (!json.childrenList) {
                        json.childrenList = [];
                    }
                    seach(json.childrenList);

                    function seach (a) {
                        var len = a.length;
                        if (len) {
                            a.forEach(function (item, index) {
                                if (!item.childrenList) {
                                    item.childrenList = [];
                                } else {
                                    if (item.childrenList instanceof Array && item.childrenList.length) {
                                        seach(item.childrenList);
                                    }
                                }

                            });
                        }
                    }

                    return json;
                },
                // 无限获取下一级节点
                getChildrenList: function (res) {
                    this.items = res.childrenList;
                    this.navList.push(res);
                },
                // 导航点击时
                navClick: function (index, res) {
                    var len = this.navList.length;
                    if (len === 1 || len === index + 1) {
                        return false;
                    }
                    this.navList.splice(index + 1);
                },
                // 确定选中  返回
                confirmSelect: function (res) {
                    var childLen = res.childrenList.length;
                    if (childLen) {// 如果有子级就直接 return
                        return false;
                    }
                    this._pitchOn(res);
                },
                // 历史记录点击时
                historyClick: function (res) {
                    this._pitchOn(res);
                },
                _pitchOn: function (res) {
                    this._addHistory(res);
                    this.isHotSubject = true;
                    T.Event.emit('noteTakingSubjectSelect', res);
                    this.navList.splice(1);
                    this.searchVal = '';
                    T.GoPage(false);
                },
                // 添加历史记录
                _addHistory: function (json) {
                    var bSing = false;
                    var index = -1;
                    if (this.historyList.length) {
                        this.historyList.forEach(function (item, i) {
                            if (item.id === json.id) {
                                bSing = true;
                                index = i;
                            }
                        });
                    }
                    if (bSing) {
                        if (index !== -1) {
                            this.historyList.unshift(this.historyList.splice(index, 1)[0]);
                        }
                    } else {
                        this.historyList.unshift(json);
                        if (this.historyList.length > MAX_HISTORY) {
                            this.historyList.pop();
                        }
                    }
                    var historyList = JSON.stringify(this.historyList);
                    window.localStorage.setItem('historyList' + this.userid, historyList);
                },
                // 动态获取导航width
                _getNavListWidth: function () {
                    this.$nextTick(function () {
                        var navList = this.$refs.navList;
                        var n = 60;
                        navList.forEach(function (item, index) {
                            n += item.offsetWidth;
                        });
                        this.navWidth = n + 'px';
                    });
                },
                // 查找
                search: function () {
                    var _this = this;
                    var items = this.navList[this.navList.length - 1].childrenList;
                    if (this.searchVal) {
                        this.items = search();
                        this.isHotSubject = false;
                    } else {
                        this.items = this.navList[this.navList.length - 1].childrenList;
                    }

                    function search () {
                        var arr = [];
                        items.forEach(function (item, index) {
                            if (item.name.search(_this.searchVal) !== -1) {
                                arr.push(item);
                            }
                        });
                        return arr;
                    }
                }
            },
            watch: {
                navList: function () {
                    if (this.navList.length) {
                        this._getNavListWidth();
                        this.items = this.navList[this.navList.length - 1].childrenList;
                    }
                },
                itemlist: function () {
                    if (!this.itemlist.length) {
                        T.Tip('参数错误 无预算科目');
                        setTimeout(function () {
                            T.GoPage(0);
                        }, 500);
                    }
                    this.historyList = JSON.parse(window.localStorage.getItem('historyList' + this.userid)) || [];
                }
            }
        });

        function this_ref () {
            var data;
            if (T.AllData.noteTakingSubjectSelect.data11 !== undefined) {
                data = T.AllData.noteTakingSubjectSelect.data11;

                vm.itemlist = JSON.parse(JSON.stringify(data.itemlist));
                vm.userid = data.userid;

            }
        }

        T.Ref(refOption, this_ref);
        this_ref();
    });
    var refOption = {
        nameKey: 'noteTakingSubjectSelect',
        id: '#page_budget_subjects',
        fucKey: 'ref',
        dataKey: 'data11',
        data: {
            itemlist: []
        }
    };
    T.Ref(refOption);

})();
