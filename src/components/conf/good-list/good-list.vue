<template>
	<div>
		<searchBar></searchBar>
		<div class="detail-content">
			<div class="content"
				v-infinite-scroll="loadMore"
				infinite-scroll-disabled="loading"
				infinite-scroll-distance="0">
				<div class="product-des-bd product-detail" 
				v-for="(item,index) in list"
				:key="index"
				>
					<!-- <div class="gd-title"> -->
						<!-- <span class="tag-yushou">预售</span> -->
						<!-- <span class="tag-tuangou">团购</span> -->
					<!-- </div> -->
					<a href="javascript:;" @click="linkToDetail(item)">
						<div class="img">
							<img v-lazy="item.goodsImageUrl+'!m2'"/>
						</div>
						<div class="inf">
							<!-- 商品名称 -->
							<span class="description jDescription">{{item.goodsName}}</span>
							<!-- 商品说明 -->
							<!-- <span class="category">{{item.goodsExplain}}</span> -->
							<!-- 活动标签 -->
							<span class="tag-activity" v-if="item.activityText">{{item.activityText}}</span>
							<!-- 价格 -->
							<span class="price">
								<em>￥</em><span class="jPrice">{{item.salePrice}}</span>
								<!-- 划线价格 -->
								<!-- <span v-if="item.unit" class="original-price">{{item.mktPrice}}</span> -->
								<!-- 规格 -->
								<span v-if="item.unit" class="specification">/{{item.unit}}</span>
							</span>
						</div>
					</a>
					<!-- <i class="count" v-if="item.addCart" @click="addCart(item)"></i> -->
					<i v-if="item.addCart" :class="['count',!item.hasAvailableStore || !item.marketable?'disable':'']" @click="addCart(item)"></i>
				</div>
			</div>
			<div class="loading" v-show="loading"><img src="../../../assets/images/loading.gif">加载中...</div>
			<div class="no-more" v-show="noMore && !empty">没有更多商品啦~</div>
			<div class="empty" v-show="empty"><img src="../../../assets/images/empty.png">没有搜索到您想要的商品呢~</div>
		</div>
		<!-- 底部统计结算栏 -->
		<div class="account">
			<span>已添加商品<b>{{totalQuantity}}</b>件</span>
			<button @click="toCart">去结算</button>
		</div>
	</div>
</template>

<script>
import searchBar from '@/components/common/search-bar/search-bar.vue'
import Vue from 'vue'
export default {
	components:{searchBar},
	data(){
		return {
			list:[],
			newList:[],
			loading:false,	
			noMore:false,
			empty:false,
			keywords:"",
			currentPage:0,
			//购物车商品数量
			totalQuantity:0,
			isNavigateTo:false,
		}
	},
	mounted(){
		document.title = '商品列表';
		if (sessionStorage.getItem('keyWords')) {
			this.keywords = sessionStorage.getItem('keyWords')
		}
		this.$ajax.get(this.$apiUrl.getSimple).then(res => {
			//获取购物车数量
			this.totalQuantity = res.data.totalQuantity
		});
		window.addEventListener("popstate", ()=> {
			// this.$router.push({path:'classify'});
			if(window.__wxjs_environment === 'miniprogram'|| this.isMiniProgram()){
				wx.miniProgram.switchTab({url: '/pages/find/find'})
				return
			}else{
				return
			}
      	})
	},
	methods:{
		isMiniProgram(){
			if(navigator.userAgent.indexOf('miniprogram')>-1){
				return true
			}else{
				return false
			}
		},
		linkToDetail(item){

			if(this.isNavigateTo){
				return false;
			}
			// wx.ready(function(){
				wx.miniProgram.navigateTo({
					url: '/pages/web/web?url='+item.productDetail,
					fail: function(res){
						wx.miniProgram.navigateTo({
							url: '/pages/web/web?url='+item.productDetail,
							fail: function(res){
								window.location.href = item.productDetail;
							},
							complete: function(res){
								self.isNavigateTo = true;
							}
						});
					},
					complete: function(res){
						self.isNavigateTo = true;
					}
				})
			// });




			// if(window.__wxjs_environment === 'miniprogram'|| this.isMiniProgram()){
			// 	wx.miniProgram.navigateTo({url: '/pages/web/web?url='+item.productDetail})
			// 	return
			// }
			// window.location.href = item.productDetail;
		},
		loadMore() {
			if (this.noMore) {
				return false;
			}
			this.currentPage++;
			this.loading = true;
			this.$ajax.get(this.$apiUrl.search,{keywords:this.keywords,currentPage:this.currentPage,pageSize:10,marketable:1}).then(res => {
				this.list = this.list.concat(res.data.list)
				this.uploadPrice(res.data.list);
				this.loading = false;
				if (!this.list.length) {
					this.empty = true;
				}
				if (!res.data.hasNext) {
					this.noMore = true;
				}				
			});
		},
		//更新价格
		uploadPrice(list){
			var productIds = [];
			for (var key = 0; key < list.length; key++) {
				productIds = productIds.concat(list[key].productId);
			}
			this.$ajax.get(this.$apiUrl.updatePrice,{"productIds":JSON.stringify(productIds)}).then(res => {
				if(!res.data) return
				if(res.data.list && res.data.list.length == 0){
					return
				}
				this.newList = res.data.list;
				for (var index = 0; index < this.newList.length; index++) {
					for (var key = 0; key < this.list.length; key++) {
						if (this.list[key].productId == this.newList[index].productId) {
							console.log(this.list[key].productId);
							this.list[key].addCart = this.newList[index].addCart;
							this.list[key].activityText = this.newList[index].activityText;
							this.list[key].salePrice = this.newList[index].salePrice;
							this.list[key].hasAvailableStore = this.newList[index].hasAvailableStore;
							this.list[key].marketable = this.newList[index].marketable;
							// this.$set(this.list.addCart, key, this.newList[index].addCart);
							// this.$set(this.list.activityText, key, this.newList[index].activityText);
							// this.$set(this.list.salePrice, key, this.newList[index].salePrice);
							// this.$set(this.list.hasAvailableStore, key, this.newList[index].hasAvailableStore);
							// this.$set(this.list.marketable, key, this.newList[index].marketable);
						}
					}
				}
				for (var index = 0; index < this.list.length; index++) {
					this.$set(this.list, index, this.list[index]);
				}
				console.log(this.list)
			});

		},
		//加入购物车
		addCart(item){
			if (!item.addCart) {
				return false;
			}
			let params = {}
			params.productId = item.productId;
			params.quantity = 1;
			params.source = 'wap';
			this.$ajax.get(this.$apiUrl.addCart,params).then(res => {
				if (res.error !== 0) {
					this.$toast({
						message: res.msg,
						duration: 1500,
					});
				}
				//获取购物车数量
				this.totalQuantity = res.data.totalQuantity
				this.$toast({
					message: '添加成功！',
					duration: 1500,
				});
			});
		},
		//去结算
		toCart(){
			if (!this.totalQuantity) {
				this.$toast('您还没有添加任何商品呢~');
				return false;
			}
			window.location.href = this.$apiUrl.cart
		}
	}
}
</script>

<style scoped lang="scss">
.page-view{
	height: 100%;
}
.detail-content{
	padding-bottom: rem(122);
}
.content{
	padding-top:rem(122);
	// padding-bottom: rem(122);
}
.mod-index {
	color:red;	
}
.search-bar{
	padding:rem(10) 0 rem(24);
	border-bottom: 1px solid #e5e5e5;
}
.product-des-bd {
	position: relative;
	padding: rem(20) rem(20);
	background-color: #fff;
	border-top: rem(1) solid #e5e5e5;
	a{
		@include flexbox((display: box));
		width: 100%;
	}
	.img {
		height: rem(240);
		width: rem(240);
	}
	img {
		max-width: 100%;
		// height: rem(240);
		margin: 0 auto;
		&[lazy=error]{
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
	.count {
		position: absolute;
		right:rem(20);
		bottom: rem(15);
		width: rem(100);
		height: rem(62);
		border-radius: rem(22);
		// background:-webkit-gradient(linear, left top, right bottom, from(#f85e5b), to(rgba(255,136,135, .9)));  
		// box-shadow: rem(0) rem(5) rem(15) #FFB6C1;
		// color: #fff;
		// bottom: rem(34);
		// right: rem(20);
		// text-align: center;
		// line-height: rem(44);
		background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGcAAABCCAYAAABKIMh8AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyppVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTMyIDc5LjE1OTI4NCwgMjAxNi8wNC8xOS0xMzoxMzo0MCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUuNSAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpEQTBERTg0NTIxQjQxMUU4OEUxNUJFMkFCQTJDM0NFQSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpEQTBERTg0NjIxQjQxMUU4OEUxNUJFMkFCQTJDM0NFQSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkRBMERFODQzMjFCNDExRTg4RTE1QkUyQUJBMkMzQ0VBIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkRBMERFODQ0MjFCNDExRTg4RTE1QkUyQUJBMkMzQ0VBIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+1Z3v7AAACCZJREFU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");
		background-position: center center;
		background-size: 100% 100%;
		.iconfontmod {
			font-size: rem(35);
			color: #f85e5b;
		}
	}
	.gd-title {
		position: absolute;
		font-size: rem(24);
		color: #fff;
		span {
			display: inline-block;
			border-radius: rem(4);
			width: rem(64);
			height: rem(38);
			line-height: rem(38);
			text-align: center;
		}
		.tag-yushou {
			background-color: #50c385;
		}
		.tag-tuangou {
			background-color: #f85e5b;
		}
	}
	.inf {
		@include flexbox((box-flex:1));
		-webkit-box-flex:1; 
		position: relative;
		height: rem(240);
		.description {
			line-height: rem(35);
			display: block;
			font-size: rem(28);
			color: #333;
			margin-left: rem(20);
			word-break: break-all;
			text-overflow: ellipsis;
			// width:rem(200);
			display: -webkit-box;
			/** 对象作为伸缩盒子模型显示 **/
			-webkit-box-orient: vertical;
			/** 设置或检索伸缩盒对象的子元素的排列方式 **/
			-webkit-line-clamp: 2;
			/** 显示的行数 **/
			overflow: hidden;
			/** 隐藏超出的内容 **/
		}
		.category {
			display: block;
			line-height: rem(30);
			font-size: rem(24);
			color: #999;
			margin-left: rem(20);
			word-break: break-all;
			text-overflow: ellipsis;
			display: -webkit-box;
			/** 对象作为伸缩盒子模型显示 **/
			-webkit-box-orient: vertical;
			/** 设置或检索伸缩盒对象的子元素的排列方式 **/
			-webkit-line-clamp: 2;
			/** 显示的行数 **/
			overflow: hidden;
			/** 隐藏超出的内容 **/
		}
		.tag-activity{
			display: inline-block;
			border-radius: rem(4);
			// width: rem(64);
			padding: rem(8);
			// height: rem(38);
			line-height: rem(24);
			text-align: center;
			border:1px solid #f85e5b;
			color: #f85e5b;
			font-size: rem(24);
			margin:rem(20) 0 0 rem(20);
		}
		.price {
			position: absolute;
			display: block;
			font-size: rem(28);
			line-height: rem(28);
			color: #f85e5b;
			margin-left: rem(20);
			bottom: rem(10);
			.jPrice{
				font-size:rem(32)
			}
			em{
				font-style: normal;
				font-weight: normal;
			}
		}
		.original-price {
			font-size: rem(18);
			color: #b5b5b5;
			// margin-left: rem(10);
			text-decoration: line-through;
		}
		.specification{
			font-size: rem(28);
			color: #b5b5b5;
			// margin-left: rem(10);
		}
	}
}
.product-des-bd:last-child {
	border-bottom: none;
}
.account{
	position: fixed;
	bottom: 0;
	height: rem(122);
	width: 100%;
	// opacity: 0;
	background-color: rgba(255,255,255, .8);
	border-top:1px solid #e5e5e5;
	line-height: rem(122);
	span{
		font-size: rem(28);
		margin-left:rem(30);
		color:#333;
		b{
			// font-weight: normal;
			color:#f85e5b;
		}
	}
	button{
		width: rem(182);
		height: rem(90);
		line-height: rem(90);
		border-radius: rem(10);
		float: right;
		margin:rem(18) rem(30) rem(18) 0;
		background-color:#f85e5b; 
		border:none;
		font-size: rem(28);
		color:#fff;  
	}
	button:active, button:hover {
		background-color: #fb7674;
		border-color: #fb7674;
	}
}
.disable{
	// background:#e4e4e4!important; 
	background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGkAAABCCAYAAABU6fjPAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyppVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTMyIDc5LjE1OTI4NCwgMjAxNi8wNC8xOS0xMzoxMzo0MCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUuNSAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpEQTBERTg0OTIxQjQxMUU4OEUxNUJFMkFCQTJDM0NFQSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpEQTBERTg0QTIxQjQxMUU4OEUxNUJFMkFCQTJDM0NFQSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkRBMERFODQ3MjFCNDExRTg4RTE1QkUyQUJBMkMzQ0VBIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkRBMERFODQ4MjFCNDExRTg4RTE1QkUyQUJBMkMzQ0VBIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+mzEN9AAAB2ZJREFU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")!important;
	// box-shadow: rem(0) rem(5) rem(15) #e4e4e4!important;
}
/* 加载中... */
.loading,.no-more {
	text-align: center;
	font-size: rem(28);
	color:#bcbcbc;
	vertical-align: middle;
	padding: rem(20) 0;
	img{
		position: absolute;
		width: rem(32);
		margin-left:rem(-46);
	}
}
.empty{
	text-align: center;
	font-size: rem(28);
	color:#bcbcbc;
	vertical-align: middle;
	margin: rem(20) 0;
	img{
		width: 50%;
		display: block;
		padding-bottom:rem(20);
		margin:0 auto;
	}
}
</style>
