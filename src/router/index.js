import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)
Router.prototype.goBack = function () { 
　　this.isBack = true
　　window.history.go(-1)
}
const router = new Router({
    mode: 'history',
    routes: [
    {   
        path: '/super/mall',
        redirect: '/super/mall/classify',
        component: resolve => require(['@/components/common/empty.vue'], resolve),
        children:[
        {
                path: 'classify',
                component: resolve => require(['@/components/conf/index/index.vue'], resolve),
                name: "分类",
                meta: { needSearchBar: true },
                hidden: true
            }, {
                path: 'searchHistory',
                component: resolve => require(['@/components/conf/search-history/search-history.vue'], resolve),
                meta: { needSearchBar: true },
                name: "搜索历史",
                hidden: true
            }, {
                path: 'good-list',
                component: resolve => require(['@/components/conf/good-list/good-list.vue'], resolve),
                meta: { needSearchBar: true },
                name: "商品列表",
                hidden: true
            }
        ]
    },
    {
        path: '/404',
        component: resolve => require(['@/components/common/404/404.vue'], resolve),
        hidden: true
    }]
})

export
default router