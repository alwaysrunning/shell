import Vue from 'vue'
import _ from 'lodash'
import App from './App'
import ajax from './assets/js/ajax'
import apiUrl from './assets/js/api-url'
import router from './router'
import store from './store'
import MintUi from 'mint-ui'
import 'mint-ui/lib/style.css'
import './assets/sass/reset/_reset.scss';
import './assets/sass/http:wx.yunhou.com/http:wx.yunhou.com/fonts/images/images/common/1.0.0/_common.scss';
import './assets/sass/common.scss';
import FastClick from 'fastclick';

Vue.prototype._ = _;
Vue.use(MintUi);
FastClick.attach(document.body);

new Vue({
    el: '#app',
    store,
    router,
    template: '<App/>',
    components: { App }
})