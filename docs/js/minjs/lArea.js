/*
 * lArea城市选择控件
 * 
 * 作者：黄磊
 * 
 * 邮箱：xfhxbb@yeah.net
 * 
 * Copyright 2016
 * 
 * 创建于：2016-02-03
 */
window.lArea = (function() {
	"use strict";
    var MobileArea = function() {
        this.gearArea;
        this.data;
        this.index = 0;
        this.value = [0];
    }
    MobileArea.prototype = {
        init: function(params) {
            this.params = params;
            this.trigger = document.querySelector(params.trigger);
			this.n=params.n?params.n:1;
            this.bindEvent(this.type);
			this.cb=params.callBack;
        },
        getData: function(callback) {
            var _self = this;
            if (typeof _self.params.data == "object") {
                _self.data = _self.params.data;
                callback();
            } 
        },
        bindEvent: function(type) {
            var _self = this;
			var n=this.n;
			var i=0;
			var dom=[];
            //呼出插件
            function popupArea(e) {
                _self.gearArea = document.createElement("div");
                _self.gearArea.className = "gearArea";
				var temp='<div class="area_ctrl slideInUp"><div class="area_btn_box"><div class="area_btn larea_cancel">取消</div><div class="area_btn larea_finish">确定</div></div><div class="area_roll_mask"><div class="area_roll">';
				for(i=0;i<n;i++){
					temp+='<div><div class="gear Area_name'+i+'" data-areatype="Area_name'+i+'"></div><div class="area_grid"></div></div>';
					}
				temp+='</div></div></div>';
                _self.gearArea.innerHTML =temp;
                document.body.appendChild(_self.gearArea);
                setTimeout(function(){_self.gearArea.className = "gearArea gearShow";},0);
                var larea_cancel = _self.gearArea.querySelector(".larea_cancel");
                larea_cancel.addEventListener('touchstart', function(e) {
                    _self.close(e);
                });
                var larea_finish = _self.gearArea.querySelector(".larea_finish");
                larea_finish.addEventListener('touchstart', function(e) {
                    _self.finish(e);
                });
				dom=[];
				for(i=0;i<n;i++){
					dom.push(_self.gearArea.querySelector(".Area_name"+i));
					dom[i].addEventListener('touchstart', gearTouchStart);
					dom[i].addEventListener('touchmove', gearTouchMove);
					dom[i].addEventListener('touchend', gearTouchEnd);
					}
				areaCtrlInit();
            }
            //初始化插件默认值
            function areaCtrlInit() {
				for(i=0;i<n;i++){
					_self.value[i]=0;
					dom[i].setAttribute("val", _self.value[i]);
					}
                _self.setGearTooth(_self.data);
				
            }
            //触摸开始
            function gearTouchStart(e) {
                e.preventDefault();
                var target = e.target;
                while (true) {
                    if (!target.classList.contains("gear")) {
                        target = target.parentElement;
                    } else {
                        break;
                    }
                }
                clearInterval(target["int_" + target.id]);
                target["old_" + target.id] = e.targetTouches[0].screenY;
                target["o_t_" + target.id] = (new Date()).getTime();
                var top = target.getAttribute('top');
                if (top) {
                    target["o_d_" + target.id] = parseFloat(top.replace(/em/g, ""));
                } else {
                    target["o_d_" + target.id] = 0;
                }
            }
            //手指移动
            function gearTouchMove(e) {
                e.preventDefault();
                var target = e.target;
                while (true) {
                    if (!target.classList.contains("gear")) {
                        target = target.parentElement;
                    } else {
                        break;
                    }
                }
                target["new_" + target.id] = e.targetTouches[0].screenY;
                target["n_t_" + target.id] = (new Date()).getTime();
                //var f = (target["new_" + target.id] - target["old_" + target.id]) * 18 / target.clientHeight;
                var f = (target["new_" + target.id] - target["old_" + target.id]) * 18 / 370;
                target["pos_" + target.id] = target["o_d_" + target.id] + f;
                target.style["-webkit-transform"] = 'translate3d(0,' + target["pos_" + target.id] + 'em,0)';
                target.setAttribute('top', target["pos_" + target.id] + 'em');
            }
            //离开屏幕
            function gearTouchEnd(e) {
                e.preventDefault();
                var target = e.target;
                while (true) {
                    if (!target.classList.contains("gear")) {
                        target = target.parentElement;
                    } else {
                        break;
                    }
                }
                var flag = (target["new_" + target.id] - target["old_" + target.id]) / (target["n_t_" + target.id] - target["o_t_" + target.id]);
                if (Math.abs(flag) <= 0.2) {
                    target["spd_" + target.id] = (flag < 0 ? -0.08 : 0.08);
                } else {
                    if (Math.abs(flag) <= 0.5) {
                        target["spd_" + target.id] = (flag < 0 ? -0.16 : 0.16);
                    } else {
                        target["spd_" + target.id] = flag / 2;
                    }
                }
                if (!target["pos_" + target.id]) {
                    target["pos_" + target.id] = 0;
                }
                rollGear(target);
            }
            //缓动效果
            function rollGear(target) {
                var d = 0;
                var stopGear = false;
                clearInterval(target["int_" + target.id]);
                target["int_" + target.id] = setInterval(function() {
                    var pos = target["pos_" + target.id];
                    var speed = target["spd_" + target.id] * Math.exp(0.01 * d);
                    pos += speed;
                    if (Math.abs(speed) > 0.1) {} else {
                        speed = 0.1;
                        var b = Math.round(pos / 2) * 2;
                        if (Math.abs(pos - b) < 0.02) {
                            stopGear = true;
                        } else {
                            if (pos > b) {
                                pos -= speed;
                            } else {
                                pos += speed;
                            }
                        }
                    }
                    if (pos > 0) {
                        pos = 0;
                        stopGear = true;
                    }
                    var minTop = -(target.dataset.len - 1) * 2;
                    if (pos < minTop) {
                        pos = minTop;
                        stopGear = true;
                    }
                    if (stopGear) {
                        var gearVal = Math.abs(pos) / 2;
                        setGear(target, gearVal);
                        clearInterval(target["int_" + target.id]);
                    }
                    target["pos_" + target.id] = pos;
                    target.style["-webkit-transform"] = 'translate3d(0,' + pos + 'em,0)';
                    target.setAttribute('top', pos + 'em');
                    d++;
                }, 30);
            }
            //控制插件滚动后停留的值
            function setGear(target, val) {
                val = Math.round(val);
                target.setAttribute("val", val);
                _self.setGearTooth(_self.data);
            }
            _self.getData(function() {
                _self.trigger.addEventListener('click', popupArea);
            });
        },
        //重置节点个数
        setGearTooth: function(data) {
            var _self = this;
            var item = data || [];
            var l = item.length;
            var gearChild = _self.gearArea.querySelectorAll(".gear");
            var gearVal = gearChild[_self.index].getAttribute('val');
            gearChild[_self.index].setAttribute('data-len', l);
            if (l > 0) {
                var childData = item[gearVal].child;
                var itemStr = "";
                for (var i = 0; i < l; i++) {
                    itemStr += "<div class='tooth'  ref='" + item[i].id + "'>" + item[i].name + "</div>";
                }
                gearChild[_self.index].innerHTML = itemStr;
                gearChild[_self.index].style["-webkit-transform"] = 'translate3d(0,' + (-gearVal * 2) + 'em,0)';
                gearChild[_self.index].setAttribute('top', -gearVal * 2 + 'em');
                _self.index++;
                if (_self.index > _self.n-1) {
                    _self.index = 0;
                    return;
                }
                _self.setGearTooth(childData);
            } else {
                gearChild[_self.index].innerHTML = "<div class='tooth'></div>";
                _self.index = 0;
            }
        },
        finish: function(e) {
			console.log(e);
            var _self = this;
			var n=this.n;
			var dom=[];
			var val=[];
			var text=[];
			var data=[];
			var str='';
			var nde=null;
			var idata=false;
			for(var i=0;i<n;i++){
				dom.push( _self.gearArea.querySelector(".Area_name"+i));
				val.push(parseInt(dom[i].getAttribute("val")));
				console.log(val[i]);
				console.log(idata.child);
				data[i]=idata?idata.child?idata.child[val[i]]:false:_self.data[val[i]];
				idata=data[i];
				nde=dom[i].childNodes[val[i]];
				text.push(nde?nde.textContent:'');
				_self.value[i]=val[i];
				str+=text[i]+" ";
				}
				if(_self.cb){
					_self.cb(data);
					}else{
						_self.trigger.value=str.slice(0,-1);
						}
			_self.close(e);
  
           // _self.trigger.value = provinceText + " " + cityText + " " + countyText;

        },
        close: function(e) {
            e.preventDefault();
            var _self = this;
            var evt = new CustomEvent('input');
            _self.trigger.dispatchEvent(evt);
			_self.gearArea.className='gearArea';
			setTimeout(function(){document.body.removeChild(_self.gearArea);},500);
            
        }
    };
    return MobileArea;
})();
