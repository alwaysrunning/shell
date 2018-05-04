///配置全局url
import Vue from 'vue'
let host = "https://wx.yunhou.com";
Vue.prototype.$apiUrl = {
    //分类
    frontCate: host + '/super/search/front_cate',
    //商品列表+搜索联想词
    search: host + '/super/search/search',
    //购物车内商品件数
    getSimple: host + "/super/cart/getSimple",
    //加入购物车
    addCart: host + "/super/cart/add",
    //购物车链接
    cart: host + "/super/html/cart/cart.html",

    autocomplete: host + '/super/search/autocomplete',

    setMiniprogram: host + '/super/api/setMiniprogram',

    updatePrice: host + '/super/search/promotion_status'
}