<template>
  	<div id="app">
		<router-view></router-view>
  	</div>
</template>
<script >
export default {
	name: 'app',
	data () {
		return {
		}
	},

  	mounted(){
		this.isSmallProgram()
  	},
	methods:{
		getQueryObject(url){
			url = url == null ? window.location.href : url;
			var search = url.substring(url.lastIndexOf("?") + 1);
			var obj = {};
			var reg = /([^?&=]+)=([^?&=]*)/g;
			search.replace(reg, function (rs, $1, $2) {
				var name = decodeURIComponent($1);
				var val = decodeURIComponent($2);
				val = String(val);
				obj[name] = val;
				return rs;
			});
			return obj;
		},

		isSmallProgram(){
			let params={}, self = this;
			params = this.getQueryObject(window.location.href);
			params.miniprogram = 1 // 步步高+
			self.$ajax.get(self.$apiUrl.setMiniprogram, params).then(res => {  // 如果是小程序，服务器在cookie中设置miniprogram：1
			
			});
		}
    },
}
</script>
<style lang="scss" scoped>
</style>
