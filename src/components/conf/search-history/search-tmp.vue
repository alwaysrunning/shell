<template>
  <div class="mod-search-history">
    <div class="history-title">
      <h3 v-show="style[state].clearBtn&&style[state].data">{{style[state].txt}}</h3>
      <span v-show="style[state].clearBtn&&style[state].data" @click="clearLocalHistory" class="clear-history">清空</span>
    </div>
    <ul class="search-box clearfix" @click="goList($event)">
        <li v-for="(item,index) in style[state].data" :key="index" :class="{active : clickTag == item}">{{item}}</li>
    </ul>
  </div>
</template>
<script>
import { MessageBox } from 'mint-ui';
let storageL = window.localStorage;
let storageS = window.sessionStorage;
export default {
  props: ["state","searchHistory"],
  data() {
    return {
      style: {
        local: {
          txt: "本地搜索历史",
          clearBtn: true,
          data: ""
        },
        hot: {
          txt: "热门搜索",
          clearBtn: false,
          data: ""
        }
      },
      clickTag: ""
    };
  },
  mounted() {
    this.clickTag = storageS.getItem('keyWords')?storageS.getItem('keyWords'):'';
    if(this.state == 'local') {this.getLocalHistory()}//本地搜索历史
    if(this.state == 'hot') {this.getHotHistory()}//热门搜索
  },
  methods: {
    getLocalHistory: function() {
      let localData = [...new Set(JSON.parse(storageL.getItem('searchHistory')))];
      this.style.local.data = localData;
      if(!storageL.getItem('searchHistory')){this.style.local.clearBtn = false}
    },
    getHotHistory: function() {
      this.$ajax.get('http://localhost:8080/api/hotSearch').then(res => {
        if (res.error == 0) {
          if (res.data.length > 0) {
            this.style.hot.data = res.data;
          } else {
            MessageBox('error', res.msg);
          }
        }
      });
    },
    goList: function(event) {
      if(event.target.nodeName!='LI') return;
      this.clickTag = event.target.innerText;
      storageS.setItem('keyWords',this.clickTag) 
      this.$router.push({path:'good-list'});
    },
    clearLocalHistory: function(){
      localStorage.removeItem('searchHistory');
      this.style.local.data = '';
      this.$emit('update:searchHistory',[]);
    }
  },
  computed: {}
};
</script>
<style scoped lang="scss">
.mod-search-history {
  font-family: noto sans s chinese light;
  margin: rem(24) rem(20) rem(5);
  .history-title {
    margin: 0 rem(10);
    line-height: rem(58);
    h3 {
      font-size: rem(30);
      display: inline-block;
      font-weight: 500;
    }
    .clear-history {
      font-size: rem(30);
      float: right;
      color: #f96563;
    }
  }

  .search-box {
    li {
      list-style: none;
      float: left;
      max-width: rem(190);
      min-width: rem(60);
      // height: rem(44);
      // line-height: rem(44);
      font-size: rem(28);
      text-align: center;
      padding: rem(14) rem(20);
      border: 1px solid #ccc;
      border-radius: rem(44);
      margin: rem(15) rem(10);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      &.active {
        color: #f96563;
        border: 1px solid #f96563;
      }
    }
  }
}
</style>