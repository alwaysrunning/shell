<template>
	<div class="contains">
        <mk-search ref="search" @enter="enterSearch" @select="onSelect" @close="close" :options="option">
			<ul slot="list">
				<searchTmp state="local" :searchHistory.sync="searchHistory"></searchTmp>
			</ul>
		</mk-search>
	</div>
</template>

<script>
import Vue from "vue";
import searchTmp from "./search-tmp.vue";
import Search from "mk-vue-search";
Vue.use(Search);
let storageL = window.localStorage;
let storageS = window.sessionStorage;
export default {
  components: { searchTmp },
  data() {
    return {
	  bus: new Vue(),
	  searchHistory: [],
	  option: {
			autoFocus:false,
		  searchInput: storageS.getItem("keyWords")||'',
			showAlways: true, //show always.
			title: '搜索你想要的商品', // placeholder value
			url: this.$apiUrl.autocomplete, //search url,
			delay: 500, //delay time
			showClose: true, //show or hide 'close' button
			listConfig: {
			name: "keyword" // map 'name' to 'text'
			}
		}
    };
  },
	beforeRouteEnter (to, from, next) {
		if(from.path.indexOf('good-list')!=-1){//来自分类页面
			storageS.setItem('backTo','goodList');
		}else{
			storageS.setItem('backTo','classify');
		}
		next();
  },
  mounted() {
		document.title = '搜索';
	  if(storageL.getItem('searchHistory')){
		this.searchHistory = JSON.parse(storageL.getItem('searchHistory'));
	  }
  },
  methods: {
	close: function(){
		if(storageS.getItem('backTo') == 'goodList'){
			this.$router.back(-1);
			// wx.miniProgram.reLaunch({url: '/pages/web/web?url=https://wx.yunhou.com/super/mall/classify'})
			return;
		}else{
			wx.miniProgram.navigateBack();
		}
	},
	onSelect: function(obj) {
			this.searchHistory.push(obj.list.keyword)
			storageL.setItem('searchHistory',JSON.stringify(this.searchHistory));
		storageS.setItem('keyWords',obj.list.keyword);
		this.$router.push({path:'good-list'});
	},
    enterSearch: function(obj) {
			if(!obj.searchInput) { return false; }
			this.searchHistory.push(obj.searchInput)
     	storageL.setItem('searchHistory',JSON.stringify(this.searchHistory));
		storageS.setItem('keyWords',obj.searchInput);
		this.$router.push({path:'good-list'});
    }
  }
};
</script>
<style lang="scss">
.mod-search-pop {
	.mod-search{
		background-color: #f96563;
		box-shadow: 0 0 rem(14) 0 rgba(249,101,99,0.8)!important;
		padding-top:rem(24)!important;
		padding-bottom:rem(24)!important;
		.inner{
			padding: rem(16) rem(20) rem(16) 0!important;
			background: #fff!important;
		}
		.icon-close{
			color:#fff;
		}
	}
}
.mod-search-pop{
	.mod-box{
		top:rem(122)!important;
	}
}
.mod-search-list{
	top:rem(122)!important;
}
</style>
