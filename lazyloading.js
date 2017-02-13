/*
*   lazyloadtree 1.0.0
*   By nobrokenboy
*   @function: to realize a lazyloader
* */
var lazyloading=(function () {
    "use strict";
    /*
    * @function _hasClass: judge is the element has the className
    * @param obj
    * @param classOfName
    * */
    var _hasClass=function(obj,classOfName){
        return obj.className.match(new RegExp('(\\s|^)'+classOfName+'(\\s|$)'));
    };

    /*
    * @function _addClass: give the element add a className
    * @param obj
    * @param classOfName
    * */
    var _addClass=function(obj,classOfName){
        if(!_hasClass(obj,classOfName)){
            //必须是加空格的双引号
            obj.className+=" "+classOfName;
        }
    };

    /*
    * @function _removeClass:remove className from the element
    * @param obj
    * @param classOfName
    * */
    var _removeClass=function(obj,classOfName){
        if(_hasClass(obj,classOfName)){
            var reg=new RegExp('(\\s|^)'+classOfName+'(\\s|$)');
            obj.className=obj.className.replace(reg,"");
        }
    };

    /*
    * @function _toggleClass:toggle className from the element
    * @param obj
    * @param className
    * */
    var _toggleClass=function(obj,classOfName){
        if(_hasClass(obj,classOfName)){
            _removeClass(obj,classOfName);
        }else{
            _addClass(obj,classOfName);
        }
    };

    /*
    *  @function:change type to real Array
    * */
    var _toArr= function (items) {
        try {
            return Array.prototype.slice.call(items);
        } catch (ex) {

            var i= 0,
                len= items.length,
                result= Array(len);

            while (i < len) {
                result[i] = items[i];
                i++;
            }

            return result;
        }
    };
    /*
    * @function:judge a object is that type
    * */
    var _isType = function(type, obj) {
        //检测数组可以使用Object.prototype.toString()方法进行检测，如果是数组的话，他会返回"[object Array]",如果是对象，会返回"[object object]"
        var _class = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && _class === type;
    };

    /*
    * @function:
    * */
    var _deepExtend = function(out) {
        out = out || {};
        for (var i = 1; i < arguments.length; i++) {
            var obj = arguments[i];
            if (!obj)
                continue;
            for (var key in obj) {
                //检测该对象属性是不是从父类那边继承来的
                if (obj.hasOwnProperty(key)) {
                    if (_isType('Object', obj[key]) && obj[key] !== null)
                        _deepExtend(out[key], obj[key]);
                    else
                        out[key] = obj[key];
                }
            }
        }
        return out;
    };

    /*
    * @function:remove the duplicate element from the array
    * @return:a array that is not duplicate
    * */
    var _removeDuplicate=function(arr){
        var obj={},
            result=[];
        for(var i= 0,j=arr.length;i<j;i++){
            obj[arr[i]]=i;
        }
        //获取对象的key
        for(var i in obj){
            result.push(parseInt(i));
        }
        return result;
    };

    /*
    *  @function:get the min element index of the Array
    * */
    var _getMinIndex= function (array) {
        array=array||[];
        var len=array.length,
            index=0;
        if(len>0){
            if(len==1){
                return index;
            }
            //遍历对比大小
            for(var j=0;j<len;j++){
                if(array[index]>array[j]){
                    index=j;
                }
            }
            return index;

        }

    }
    /*
    * @function:add different event for a element
    * */
    var _addEventListener=function(el,type,listener,isUseCapture){
        //检测对象是否存在
        if(el===null||typeof(el)==="undefined")return;
        //默认isUseCapture 为false
        isUseCapture=isUseCapture||false;
        if(el.addEventListener){
            el.addEventListener(type,listener,isUseCapture);
        }else if(el.attachEvent){
            el.attachEvent("on"+type, function () {
                listener.apply(el);
            });
        }else{
            el["on"+type]=listener;
        }
    };

    /*
    * @function:remove event from a element
    * */
    var _removeEventListener= function (el,type,listener) {
        //检测对象是否存在
        if(el===null||typeof (el)==="undefiend")return;
        if(el.removeEventListener){
            el.removeEventListener(type,listener);
        }else if(el.detachEvent){
            el.detachEvent("on"+type, function () {
                listener.apply(el);
            });
        }else{
            el["on"+type]=null;
        }
    };
    
    /*
     * @function:节流，防止因resize,scroll事件导致页面多次触发函数
     * */
    var _throttle=function(fn, threshhold, scope) {
    	debugger;
		  threshhold || (threshhold = 250);
		  var last,
		      timer;
		  return function () {
			    var context = scope || this;
			    var now = +new Date(),//+new Date()==+new Date==new Date().getTime()==new Date().valueOf()
			        args = arguments;
			    if (last && now - last + threshhold < 0) {
			      // hold on to it
			      clearTimeout(deferTimer);
			      timer = setTimeout(function () {
			        last = now;
			        fn.apply(context, args);
			      }, threshhold);
			    } else {
			      last = now;
			      fn.apply(context, args);
			    }
			 }
  	};
     /*
      
      * @function 获取元素距离页面的高度
      * */
    var _getPageTop=function(ele){
    	var top = ele.offsetTop;
        var parent = ele.offsetParent;
        while(parent!=null)
        {
            top += parent.offsetTop;
            parent = parent.offsetParent;
        }
        return top;
    };
	/*
	 *
	 * @function 根据图片的属性进行懒加载
	 * */
	
	var lazyloader=function(args){
		this.settings={
			selector:'',
			loadingImg:'',
			imgDoneLength:0,
			onInit:function(){
				
			},
			onLoading:function(){
				
			},
			onLoaded:function(){
				
			}
		};
		
		//Parse args
		if(typeof args==='string'){
			this.settings.selector=args;
		}else if(typeof args==='object'){
			_deepExtend(this.settings,args);
		}
		var _self=this;
		
	
		//get the selector
		var loadingImgArrs=document.querySelectorAll(this.settings.selector);
		//循环获取图片
		Array.prototype.slice.call(loadingImgArrs).forEach(function(i){
			//暂时设置图片为这一张，先判断是否有先指定加载哪张图片
			var dataSrc=i.getAttribute("data-img-fake");
			//先用小点
			if(dataSrc){
				//判断图片是不是img标签
				if(i instanceof HTMLImageElement){
					i.setAttribute("src",dataSrc);
				}else{
					i.style.backgroundImage="url("+dataSrc+")";
				}
			}else{
				if(i instanceof HTMLImageElement){
					i.setAttribute("src",_self.settings.loadingImg);
				}else{
					i.style.backgroundImage="url("+_self.settings.loadingImg+")";
				}
			}
			
			
			
		});
		//初始化
		_self.init();
		
		//监听滚动条事件
		_addEventListener(window,'scroll',function(){
			_self.loading();
		});
		
		//检测窗口大小发生变化时
		_addEventListener(window,'resize',function(){
			_self.loading();
		})
	};
	
	//init
	 lazyloader.prototype.init=function(){
	 	var _self=this;
	 	_self.loading();
	 	this.settings.onInit.apply(this);
	 };
	 //loading
	 lazyloader.prototype.loading=function(){
	 	this.settings.onLoading.apply(this);
	 	var _self=this;
	 	//获取可见区域
		var seeHeight=document.documentElement.clientHeight;
		//获取滚动区域
		var scrollHeight=window.pageYOffset||document.documentElement.scrollTop||document.body.scrollTop;
		
		var loadingImgArrs=document.querySelectorAll(this.settings.selector);
		Array.prototype.slice.call(loadingImgArrs).forEach(function(i,l){
			//获取真正的图片
			var imgReal=i.getAttribute("data-src");
			//获取图片的中心点位置,这里借用刘总的思路
			var imgCenterH=_getPageTop(i)+i.clientHeight/2;
			//判断图片是否在可视范围内，同时图片也是加载完成
			if(imgCenterH<seeHeight+scrollHeight){
				if(_self.settings.imgDoneLength++<loadingImgArrs.length){
					_self.settings.imgDoneLength++;
				}
				console.log(_self.settings.imgDoneLength);
				//判断该元素是不是图片
				if(i instanceof HTMLImageElement){
					i.setAttribute("src",imgReal);
				}else{
					i.style.backgroundImage="url("+imgReal+")";
				}
			}
		});
		
		if(this.settings.imgDoneLength==loadingImgArrs.length){
			console.log("完毕了");
			//移除滚动条监听事件以及窗口大小变化的事件
			_removeEventListener(window,'scroll',function(){
				_self.loading();
			});
			_removeEventListener(window,'resize',function(){
				_self.loading();
			});
			_self.loaded();
		}
	 	
	 	
	 	
	 };
	 //loaded
	 lazyloader.prototype.loaded=function(){
	 	this.settings.onLoaded.apply(this);
	 };
	 
	 return {
	 	lazyloader:lazyloader
	 };

})();