<template>
	<div class="contains">
		<searchBar :message="name"></searchBar>
		<div class="mod-ctn">
			<div class="left-ctn">
				<ul class="first-classify">
					<li v-for="(item, index) in firstClassifyList" :class="{current:index==one}" @click="tabChangeFirst(index, item.catId)" :catId="item.catId" >{{item.catName}}</li>
				</ul>
			</div>
			<div class="right-ctn">
				<i class="iconfontmod" @click="toggle" :class="{up: isUp, down:!isUp}">&#xe817;</i>
				<i class="hideRight"></i>
				<div class="second-classify">
					<span v-for="(item, index) in secondClassifyList" :class="{current:index==two}" @click="tabChangeSec(index,item.catId,true)" >{{item.catName}}</span>
				</div>
				<div class="unfold" v-if="!isUp">
					<span v-for="(item, index) in secondClassifyList" :class="{current:index==two}" @click="tabChangeSec(index,item.catId,false)" >{{item.catName}}</span>
				</div>
				<div id="product-wrap" class="content"  :style="{'-webkit-overflow-scrolling': scrollMode}">
					<ul>
						<li class="product-item" v-for="(item,index) in list" @click="jumpTo(item,$event,index)">
							<div class="pic">
								<img v-lazy.container="item.goodsImageUrl+'!m2'">
							</div>
							<div class="details">
								<div class="title">{{item.goodsName}}</div>
								<div class="promote"><span v-if="item.activityText">{{item.activityText}}</span></div>
								<div class="info clearfix">
									<span class="price" v-if="item.unit">￥{{item.salePrice}} / <span class="unit">{{item.unit}}</span></span>
									<span class="price" v-else>￥{{item.salePrice}}</span>
									<span class="enlarge" v-if="item.addCart && item.hasAvailableStore && item.marketable">
										<i class="addCard"></i>
									</span>
									<span class="enlarge disable" v-if="item.addCart && (!item.hasAvailableStore || !item.marketable)">
										<i class="addCard disable"></i>
									</span>
								</div>
							</div>
						</li>
					</ul>
					<div class="no-more" v-if="noMore&&!loading">没有更多商品啦~</div>
					<div class="loading" v-if="loading"><img src="../../../assets/images/loading.gif"></div>
				</div>
			</div>
		</div>

	</div>
</template>

<script>
import { Toast } from 'mint-ui';
import searchBar from '@/components/common/search-bar/search-bar.vue'
var timer; 
var startX,startY,endX,endY;
export default {
	components:{searchBar},
	data(){
		return {
			firstClassifyList:[],
			one:0,
			secondClassifyList:[],
			two:0,
			isUp:true,
			list:[],
			loading: false,
			noMore:false,
			allLoaded:false,
			scrollMode:"touch", //移动端弹性滚动效果，touch为弹性滚动，auto是非弹性滚动 
			searchCondition:{
				currentPage:1,  
				pageSize:10,
				marketable:1
			},
			bottomStatus:'',
			currentPage:1,
			quantity:0,
			name:'classify',
			distance:10
		}
	},
	watch:{
		two(newValue,oldValue){
			this.$nextTick(()=>{
				var spanArr=document.querySelectorAll('.second-classify span');
				//查询
				var container=document.querySelector('.second-classify');

				var margin=document.defaultView.getComputedStyle(document.querySelector('.second-classify span')).marginRight.replace(/px/g,'');
				var containerWidth=document.defaultView.getComputedStyle(container).width.replace(/px/g,'');
				var containerPaddingRight=document.defaultView.getComputedStyle(container).paddingRight.replace(/px/g,'');
				//去除下拉箭头后的宽度
				var contentWidth=containerWidth-containerPaddingRight;

				//计算当前被选中span距离左边的距离
				var gapWidth=0;
				for(var i=0;i<spanArr.length;i++){
					gapWidth+=spanArr[i].offsetWidth+2*margin;
					if(spanArr[i].getAttribute('class')=='current'){
						break;
					}
				}
				//滚动条类似一个分页，默认是第一页
				//判断当前被选中的span在哪一页
				var pageIndex=Math.ceil(gapWidth/contentWidth);
				if(pageIndex>1){
					console.log('移动');
					container.scrollLeft=contentWidth*(pageIndex-1);
				}else{
					container.scrollLeft=0;
				}
			})
			
		}
	},
	methods:{
		isMiniProgram(){
			if(navigator.userAgent.indexOf('miniprogram')>-1){
				return true
			}else{
				return false
			}
		},
		animate2Cart(index, callback){
			//克隆一个节点，然后动态的去加入到购物车
			var currentDIV=document.querySelectorAll('li.product-item')[index].firstChild;
			var currentImg=currentDIV.firstChild;
			var cloneImg=currentImg.cloneNode(false);
			cloneImg.style.position="fixed";
			
			//计算距离可视区域的高度和左边距离
			var height=currentImg.getBoundingClientRect().top;
			var left=currentImg.getBoundingClientRect().left;

			cloneImg.style.top=height+"px";
			cloneImg.style.left=left+"px";
			cloneImg.style.transform="scale(0.7,0.7)";
			cloneImg.style.zIndex="100";
			
			cloneImg.className="add2cart";
			
			currentDIV.appendChild(cloneImg);
			
			setTimeout(()=>{
				cloneImg.style.top="100vh";
				cloneImg.style.left="calc(62.5vw - 25px)";
				cloneImg.style.transform="scale(0,0)"
			},100)
			//一秒钟后删除克隆的节点
			setTimeout(()=>{
				currentDIV.removeChild(cloneImg);
				callback && callback()
			},1000)

		},
		jumpTo(item,event,index){
			let target = event.target;
			let name = target.className;
			let params = {}, self = this;
			params.productId = item.productId
			params.quantity = 1
			params.source = 'wap'
			if((name.indexOf("enlarge") != -1 || name.indexOf("addCard") != -1) && name.indexOf("disable") == -1){
				if(item.addCart){
					this.$ajax.get(this.$apiUrl.addCart,params).then(res => {
						if(res.error!=0) return
						//克隆一个节点，然后动态的去加入到购物车
						this.animate2Cart(index, function(){
							//获取购物车数量
							if(res.data.totalQuantity){
								self.quantity = res.data.totalQuantity
							}
						});
					});
				}
				return
			}
			wx.miniProgram.navigateTo({
				url: '/pages/web/web?url='+item.productDetail,
				fail: function(res){
					wx.miniProgram.navigateTo({
						url: '/pages/web/web?url='+item.productDetail,
						fail: function(res){
							window.location.href = item.productDetail;
						},
						complete: function(res){
							//self.isNavigateTo = true;
						}
					});
				},
				complete: function(res){
					//self.isNavigateTo = true;
				}
			})

		},

		// 下拉状态  status: pull 没达到阀值  drop 已达到阀值
		handleBottomChange(status) {
			this.bottomStatus = status;
		},
		// 下拉触发
		loadBottom(){
			this.getMore()
			this.$refs.loadmore.onBottomLoaded();
		},
		// 分页加载
		getMore(){
			let self = this, list=[];
			this.noMore = false
			this.$ajax.get(this.$apiUrl.search, this.searchCondition).then(res => {
				this.loading=false;
				if(res.data.list && res.data.list.length == 0){
					this.noMore = true
					return
				}
				list = res.data.list
				this.list = this.list.concat(list)
				this.searchCondition.currentPage++; 
				this.updatePrice(list)
			});
		},
		getList(id){
			this.searchCondition.fCate = id || 0
			this.list= []
			this.loading = true
			this.noMore = false
			this.searchCondition.currentPage = 1
			this.$ajax.get(this.$apiUrl.search, this.searchCondition).then(res => {
				this.loading = false
				if(res.data.list && res.data.list.length == 0){
					this.noMore = true
					return
				}
				this.list = res.data.list
				this.searchCondition.currentPage++
				this.updatePrice(this.list)
			}).catch((err)=>{
				this.loading = false
			});;
		},

		isHaveMore(isHaveMore){
			// if(isHaveMore)
			// this.allLoaded = true; //true是禁止上拉加载 
		},

		tabChangeFirst(index, id){
			if(this.one==index) return
			this.one = index
			this.isUp = true
			this.getSecCateList(id)
		},

		// 获取二级分类列表
		getSecCateList(id){
			let obj = {}, arr = []
			this.loading = true
			this.$ajax.get(this.$apiUrl.frontCate,{parentId:id}).then(res => {
				this.loading = false
				obj = {
					catId:id,
					catName:'全部'
				}
				arr = res.data
				arr.unshift(obj)
				this.secondClassifyList = arr
				this.getList(this.secondClassifyList[0].catId)
				this.two = 0
			});
		},

		// 获取一级分类列表
		getCateList(){
			this.$ajax.get(this.$apiUrl.frontCate,{parentId:0}).then(res => {
				this.firstClassifyList = res.data
				if(this.firstClassifyList && this.firstClassifyList[0].catId){
					let id = this.firstClassifyList[0].catId
					this.getSecCateList(id)
				}
			});
		},

		tabChangeSec(index, id, bool){
			if(this.two==index) return
			this.two = index
			if(bool){
				this.isUp = true
			}else{
				this.isUp = !this.isUp
			}
			this.searchCondition.fCate = id
			this.searchCondition.currentPage = 1
			this.loading = true
			this.list = []
			this.noMore = false
			this.$ajax.get(this.$apiUrl.search, this.searchCondition).then(res => {
				this.loading = false
				if(!res.data) return
				if(res.data.list && res.data.list.length == 0){
					this.noMore = true
					return
				}
				
				this.list = res.data.list
				this.searchCondition.currentPage++
				this.updatePrice(this.list)
			}).catch((err)=>{
				this.loading = false
			});
		},

		updatePrice(arr){
			let productIds = []
			let list = JSON.parse(JSON.stringify(arr));
			list.forEach((v,i)=>{
				productIds.push(v.productId)
			})
			this.$ajax.get(this.$apiUrl.updatePrice, {productIds:JSON.stringify(productIds)}).then(res => {
				if(!res.data) return
				if(res.data.list && res.data.list.length == 0){
					return
				}
				res.data.list.forEach((v,i)=>{
					this.list.forEach((item, index)=>{
						if(v.productId==item.productId){
							item.activityText = v.activityText
							item.addCart = v.addCart
							item.salePrice = v.salePrice
							item.hasAvailableStore = v.hasAvailableStore
							item.marketable = v.marketable
						}
					})
				})
				for (var index = 0; index < this.list.length; index++) {
					this.$set(this.list, index, this.list[index]);
				}
			}).catch((err)=>{
				
			});

		},

		toggle(){
			this.isUp = !this.isUp
		},

		//获取购物车数量
		getShopping(){
			let params = {}, self = this, timerId;
			params.source = 'wap'
			timerId=setTimeout(function(){
				clearTimeout(timerId)
				self.$ajax.get(self.$apiUrl.getSimple, params).then(res => {
					if(res.data && res.data.totalQuantity){
						self.quantity = res.data.totalQuantity
					}
				});
			},600)
			
		},
        getSlideAngle(dx,dy) {
		  //返回角度
          return Math.atan2(dy,dx) * 180 / Math.PI;
        },
		getSlideDirection(startX,startY, endX, endY) {
		  //根据起点和终点返回方向 1：向上，2：向下，3：向左，4：向右,0：未滑动
          var dy = startY - endY;
          var dx = endX - startX;
          var result = 0;
          //如果滑动距离太短
          if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
             return result;

          }
          var angle = this.getSlideAngle(dx, dy);
          if (angle >= -45 && angle < 45) {
             result = 4;
          }else if (angle >= 45 && angle < 135) {
             result = 1;
          }else if (angle >= -135 && angle < -45) {
             result = 2;
          }else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
             result = 3;
          }

          return result;

        },
		scrollLoadDataPagination(){
			document.querySelector('#product-wrap').addEventListener('touchstart',(e)=>{
		
				startX=e.changedTouches[0].pageX;
				startY=e.changedTouches[0].pageY;
			})
			document.querySelector('#product-wrap').addEventListener('touchmove', (e)=>{ 

				//判断是否是向上滑动
				endX=e.changedTouches[0].pageX;
				endY=e.changedTouches[0].pageY;
				
				var direction = this.getSlideDirection(startX, startY, endX, endY);
				if(direction==1){
					timer&&clearTimeout(timer);
					// e.preventDefault(); 
					var liArr=document.querySelector("#product-wrap ul").childNodes;
					if(liArr.length==0){//判断是否有数据列表
						timer=setTimeout(()=>{
							this.getMore();
						},300)
						
					}else{
						var top=liArr[liArr.length-1].getBoundingClientRect().bottom;

						//获取可视区域的高度
						var pageHeight=document.documentElement.clientHeight;
						//如果最后一个li元素在可视区域内，就加载下一页数据
						if(top<=pageHeight){
							//加载下一页
							this.loading=true;
							timer=setTimeout(()=>{
								this.getMore();
							},300)
						}
					}
					
				
				}else{
					return;
				}
				
			}, false);
		}

	},
	mounted(){
		document.title = '到家';
		this.getCateList();

		//scroll加载商品类别事件
		this.scrollLoadDataPagination();
	}
}
</script>

<style scoped lang="scss">
$gapHeight:rem(122)+rem(90);
body{
	overflow-x: hidden;
}
.add2cart{
	transition:all 1s cubic-bezier(.44,.13,.16,.77);
	border-radius: 50%;
	border: 2px solid #f96563;
}
.contains{
	width: 100%;
	height: 100vh;
	background: #fff;
	overflow: hidden;
	position: relative;
	.mod-header{
		padding:rem(10) 0 rem(24);
	}
	.mod-shadow{
		width: 100%;
		height: rem(2);
		background: #eaebee;
		box-shadow: 0 rem(8) rem(10) #eaebee;
		position: relative;
		z-index: 10;
	}
	.mod-ctn{
		width:100%;
		top:rem(122);
		position: absolute;
		@include flexbox((display: box));
		.left-ctn{
			width:rem(188);
			height: 100vh;
			.first-classify{
				width:rem(188);
				height: 90vh;
				overflow-y: scroll;
				-webkit-overflow-scrolling: touch;
				li{
					box-sizing: border-box;
					width: 100%;
					height: rem(90);
					line-height: rem(90);
					text-align: center;
					background: #f2f3f7;
					color: #333;
					font-size: rem(28);
					border-bottom: rem(1) solid #ececec;
					overflow: hidden;/*超出部分隐藏*/
					white-space: nowrap;/*不换行*/
					text-overflow:ellipsis;/*超出部分文字以...显示*/
					padding: 0 rem(20);
					box-sizing: border-box;
					&.current{
						color: #f96563;
						border-left:rem(3) solid #f96563;
						background:#fff;
						border-top: rem(1) solid #ececec;
						border-bottom: rem(1) solid #ececec;
					}
					&:first-child{
						border-top:none
					}
				}
			}
		}
		
		.right-ctn{
			@include flexbox((box-flex: 1));
			max-height: rem(1100);
			overflow: hidden;
			position: relative;
			i{
				position: absolute;
				right: 0;
				width: rem(90);
				height: rem(90);
				line-height: rem(90);
				background: #fff;
				text-align: center;
				overflow: hidden;
				-webkit-transform-origin: center bottom;
				transform-origin: center center;
				transition: all 0.2s linear;
				color:#ccc;
				font-size: rem(28);
				border-radius: 50%;
				z-index: 1;
			}
			.hideRight{
				width: rem(20);
				height: rem(90);
				position: absolute;
				right: 0;
				background: #fff;
				z-index: 1;
			}
			.second-classify{
				width: 100%;
				height: rem(90);
				line-height: rem(90);
				white-space:nowrap;
				overflow-x:scroll;
				overflow-y: hidden;
				-webkit-overflow-scrolling: touch;
				font-size: rem(28);
				padding: 0 rem(70) 0 0;
				box-sizing: border-box;
				span{
					display: inline-block;
					margin:0 rem(30);
					position: relative;
					&.current{
						color: #f96563;
						&:after{
							background:#f96563;
						}
					}
					&:after{
						content:"";
						position: absolute;
						bottom: rem(18);
						left: 0;
						width: 100%;
						height: rem(4);
					}

				}
			}
			.unfold{
				position: absolute;
				top:rem(90);
				padding: rem(20) rem(10) rem(10) rem(30);
				box-sizing: border-box;
				width: 100%;
				background: #fff;
				overflow: hidden;
				box-shadow: 0 rem(8) rem(10) #f0f0f0;
				z-index: 9;
				span{
					float: left;
					box-sizing: border-box;
					width: rem(150);
					height: rem(50);
					line-height: rem(50);
					background: #f2f3f7;
					color: #333;
					font-size: rem(28);
					text-align: center;
					border-radius: rem(40);
					margin:0 rem(20) rem(40) 0;
					text-overflow:ellipsis;
					white-space:nowrap;
					overflow:hidden;
					padding: 0 rem(10);
					&.current{
						color: #f96563;
						background: #fff;
						border: rem(2) solid #f96563;
					}
				}
			}
			.content{
				//-webkit-transform:translate3d(0,0,0);
				overflow-y: scroll;
				height:calc(100vh - #{$gapHeight});
				position:absolute;
				top:rem(90);
				left:0px;
				right:0px;
				&::-webkit-scrollbar{
					display:none;
				}
				.loading{
					width: 100%;
					text-align: center;
					padding-top: rem(60)
				}
				.no-more{
					width: 100%;
					text-align: center;
					padding: rem(50) 0;
				}
				ul{
					width:100%;
					li{
						width:100%;
						box-sizing: border-box;
						@include flexbox((display: box));

						.pic{
							position:relative;
							width: rem(195);
							height: rem(195);
							padding: rem(17);
							box-sizing: border-box;
							img{
								position: absolute;
								top: 50%;
								left: 50%;
								transform: translate(-50%, -50%);
								max-width: rem(160);
								max-height: rem(160);
								//background-image: url("../../../assets/images/default.png");
								background-position: center center;
								display: block;
								&[lazy="error"]{
									min-width: 100%;
									background-image: url("../../../assets/images/default.png");
									background-repeat: no-repeat;
									background-position: center;
									background-size: 50%;
								}
								&[lazy="loading"]{
									min-width: 100%;
									background-image: url("../../../assets/images/default.png");
									background-repeat: no-repeat;
									background-position: center;
									background-size: 50%;
								}
							}
						}
						.details{
							@include flexbox((box-flex: 1));
							box-sizing: border-box;
							padding: rem(30) rem(30) rem(24) 0;
							border-bottom: rem(1) solid #e5e5e5;
							height:rem(195);
							box-sizing: border-box;
							position: relative;
							.title{
								width: 100%;
								color: #333;
								font-size: rem(26);
								overflow : hidden;
								text-overflow: ellipsis;
								display: -webkit-box;
								-webkit-line-clamp: 2;
								-webkit-box-orient: vertical;
							}
							.promote{
								width: 100%;
								height: rem(30);
								margin: rem(10) 0 0;
								span{
									// display: inline-block;
									color: #f96563;
									font-size: rem(20);
									padding: 0 rem(8);
									border: rem(2) solid #f96563;
									border-radius: rem(5)
								}
							}
							.info{
								width: 100%;
								position: absolute;
								bottom:rem(0);
								&.clearfix:after{
									content:".";
									display:block;
									height:0;
									clear:both;
									visibility:hidden
								}
								.price{
									float: left;
									color: #666;
									font-size: rem(30);
									font-weight: 400;
									padding-top: rem(14);
									height: rem(62);
									box-sizing: border-box;
									.unit{
										font-size: rem(24);
										font-family: 200;
									}
								}
								.enlarge{
									position: absolute;
									width: rem(100);
									height: rem(100);
									right: 0;
									top:rem(-40);
									.addCard{
										position: absolute;
										top:rem(40);
										width: rem(100);
										height: rem(62);
										background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGcAAABCCAYAAABKIMh8AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyppVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTMyIDc5LjE1OTI4NCwgMjAxNi8wNC8xOS0xMzoxMzo0MCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUuNSAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpEQTBERTg0NTIxQjQxMUU4OEUxNUJFMkFCQTJDM0NFQSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpEQTBERTg0NjIxQjQxMUU4OEUxNUJFMkFCQTJDM0NFQSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkRBMERFODQzMjFCNDExRTg4RTE1QkUyQUJBMkMzQ0VBIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkRBMERFODQ0MjFCNDExRTg4RTE1QkUyQUJBMkMzQ0VBIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+1Z3v7AAACCZJREFU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");
										background-position: center center;
										background-size: 100% 100%;
										&.disable{
											background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGkAAABCCAYAAABU6fjPAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyppVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTMyIDc5LjE1OTI4NCwgMjAxNi8wNC8xOS0xMzoxMzo0MCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUuNSAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpEQTBERTg0OTIxQjQxMUU4OEUxNUJFMkFCQTJDM0NFQSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpEQTBERTg0QTIxQjQxMUU4OEUxNUJFMkFCQTJDM0NFQSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkRBMERFODQ3MjFCNDExRTg4RTE1QkUyQUJBMkMzQ0VBIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkRBMERFODQ4MjFCNDExRTg4RTE1QkUyQUJBMkMzQ0VBIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+mzEN9AAAB2ZJREFU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");
										}
									}
								}
								
							}
						}
						
					}	
				}
			}
			
		}
	}
	.footer{
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100%;
		height: rem(100);
		background: #fff;
		box-shadow: 0 rem(8) rem(10) #f0f0f0;
	}	
}
.up{
	transform:rotate(0deg);
	-ms-transform:rotate(0deg); /* IE 9 */
	-moz-transform:rotate(0deg); /* Firefox */
	-webkit-transform:rotate(0deg); /* Safari 和 Chrome */
	-o-transform:rotate(0deg); /* Opera */
}
.down{
	transform:rotate(180deg);
	-ms-transform:rotate(180deg); /* IE 9 */
	-moz-transform:rotate(180deg); /* Firefox */
	-webkit-transform:rotate(180deg); /* Safari 和 Chrome */
	-o-transform:rotate(180deg); /* Opera */
}
.mint-loadmore-bottom{
	img{
		position: relative;
		top: rem(40)
	}
}
</style>
