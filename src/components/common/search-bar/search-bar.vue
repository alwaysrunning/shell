<template>
    <div :class="['container',isSearchHistory?'container-shadow':'']">
        <div class="mod-search-bar">
            <i class="icon iconfontcom" @click="inputArea">&#xe625;</i>
            <input type="text" placeholder="搜索你想要的商品" :autofocus="autofocus" v-model='keyWords' @click="inputArea" readonly="readonly"/>
            <i class="del icon iconfontcom" @click="delKeyWords" v-if="keyWords">&#xe609;</i>
        </div>
    </div>
</template>

<script>
export default {
    props: ['message'],
	data(){
		return {
            keyWords:"",
            autofocus:false,
            searchCompentShow:false,
            disabled:true,
            isSearchHistory:false,
            isNavigateTo:false,
            // options:{
            //     isShow:false, //whether show search for the first time.
            //     showAlways:false, //show always.
            //     url:this.$apiUrl.search, //search url,
            //     emptyMsg: '', // message for empty data.
            //     title: '搜索你想要的商品', // placeholder value
            //     delay: 500, //delay time
            //     ajaxData: {}, //ajax param
            //     // showClose: false, //show or hide 'close' button
            //     listConfig:{
            //         id:'productId', // map 'id' to 'textId'
            //         name:'text' // map 'name' to 'text'
            //     },
            // }
		}
    },
    // watch: {
    //     "$route": "routeChange"
    // },
    mounted(){
        if (this.$route.name == "分类") {
            sessionStorage.removeItem('keyWords');
        }
        if (!sessionStorage.getItem('keyWords')) {
            this.keyWords = ""
        }else{
            this.keyWords = sessionStorage.getItem('keyWords');
        }
        if (window.location.search) {
			this.keyWords = this.getQueryString("keyWords");
            sessionStorage.setItem('keyWords',this.keyWords);
		}
        
    },
	methods:{
        isMiniProgram(){
			if(navigator.userAgent.indexOf('miniprogram')!=-1){
				return true
			}else{
				return false
			}
		},
        getQueryString(name) {   
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");   
			var r = window.location.search.substr(1).match(reg);
			console.log(r);   
			if (r != null) return decodeURI(r[2]); return null;   
		}, 
        // onSelect(obj){
        //     console.log(obj)
        // },
        // routeChange(){
        //     console.log("chege")
        //     if(this.$route.name == "搜索历史"){
        //         this.autofocus = true
        //         this.isSearchHistory = true
        //     }else{
        //         this.autofocus = false
        //         this.isSearchHistory = false
        //     }
        //     if (this.$route.name == "分类") {
        //         sessionStorage.removeItem('keyWords');
        //     }
        //     if (sessionStorage.getItem('keyWords') === null) {
        //         this.keyWords = ""
        //     }else{
        //         this.keyWords = sessionStorage.getItem('keyWords');
        //     }
        // },
        // beforeRouteLeave (to, from, next) {
        //     console.log(111)
        //     if(to.path.indexOf('searchHistory')!=-1){//去搜索页
        //     console.log(222)
        //         //wx.miniProgram.navigateTo({url: '/pages/web/web?url=https://wx.yunhou.com/super/mall/searchHistory'})
        //     }
        //     //next();
        // },
        delKeyWords(){
            this.keyWords = "";
            sessionStorage.setItem('keyWords',this.keyWords);
            this.$router.push({path:'searchHistory'});
        },
        inputArea(){
            sessionStorage.setItem('keyWords',this.keyWords);
            if(!this.keyWords){
                this.keyWords = ''
            }
            if(this.message){

                if(this.isNavigateTo){
                    return false;
                }
                // wx.ready(function(){
                    wx.miniProgram.navigateTo({
                        url: '/pages/web/web?url='+"https://wx.yunhou.com/super/mall/searchHistory",
                        fail: function(res){
                            wx.miniProgram.navigateTo({
                                url: '/pages/web/web?url='+"https://wx.yunhou.com/super/mall/searchHistory",
                                fail: function(res){
                                    window.location.href = "https://wx.yunhou.com/super/mall/searchHistory";
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
                //     wx.miniProgram.navigateTo({url: '/pages/web/web?url=https://wx.yunhou.com/super/mall/searchHistory'})
                //     return
                // }
            }else{
                this.$router.push({path:'searchHistory'});
            }
        },
        search(){
            sessionStorage.setItem('keyWords',this.keyWords);
            this.$router.push({path:'good-list'});
        },
        // searchInput(){
        //     if (this.$route.path == '/searchHistory' && !this.searchCompentShow) {
        //         console.log("搜索组件")
        //         this.options.isShow =true,
        //         this.searchCompentShow = true;
        //     }
        //     console.log(this.keyWords)
        // }
	}
}
</script>

<style lang="scss" scoped>
.container{
    position: fixed;
    width: 100%;
    height: rem(122);
    z-index: 13;
    padding:rem(24) rem(34);
    background-color: #f96563;
    box-shadow: 0 0 rem(14) 0 rgba(249,101,99,0.8);
    box-sizing: border-box;
}
.container-shadow{
    box-shadow: 0 0 rem(10) 0 rgba(0,0,0,0.1);
}
.mod-search-bar{
    background-color: #fff;
    display: block;
    width: 100%;
    height: rem(74);
    border-radius: rem(37);
    // margin:rem(10) rem(34) rem(24);
    // margin:rem(24) rem(34);
    i{
        color:#ccc;
        font-size: rem(42);
        margin-left:rem(24);
    }
    input{
        // height: rem(74);
        background-color: #fff;
        width: rem(550);
        border: none;
        line-height: rem(74);
        font-size: rem(28);
        color:#333;
        margin-left:rem(10)
        // width: 
    }
    input::-webkit-input-placeholder { /* WebKit browsers */ 
        color:#ccc;
    } 
    input:-moz-placeholder { /* Mozilla Firefox 4 to 18 */ 
        color:#ccc;
    } 
    input::-moz-placeholder { /* Mozilla Firefox 19+ */ 
        color:#ccc;
    } 
    input:-ms-input-placeholder { /* Internet Explorer 10+ */ 
        color:#ccc;
    }
    .del{
        position: absolute;
        display: inline-block;
        right:rem(62);
        margin-top: rem(22);
        width: rem(32);
        height: rem(32);
        text-align: center;
        border-radius: 50%;
    } 
}
</style>
