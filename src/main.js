import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios';
import VueAxios from 'vue-axios'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import AWS from 'aws-sdk';

axios.interceptors.request.use(
  config => {
    if (window.localStorage.getItem('token')) { 
      config.headers.Authorization = `token ${window.localStorage.getItem('token')}`;
    }
    return config;
  },
  err => {
    return Promise.reject(err);
  });

Vue.config.productionTip = false
Vue.use(ElementUI);
Vue.use(VueAxios,axios);
Vue.use(AWS);

Vue.directive('draggable', {
  bind: function (el) {
    el.style.position = 'absolute';
    var startX, startY, initialMouseX, initialMouseY;

    function mousemove(e) {
      var dx = e.clientX - initialMouseX;
      var dy = e.clientY - initialMouseY;
      el.style.top = startY + dy + 'px';
      el.style.left = startX + dx + 'px';
      return false;
    }

    function mouseup() {
      document.removeEventListener('mousemove', mousemove);
      document.removeEventListener('mouseup', mouseup);
    }

    el.addEventListener('mousedown', function(e) {
      startX = el.offsetLeft;
      startY = el.offsetTop;
      initialMouseX = e.clientX;
      initialMouseY = e.clientY;
      document.addEventListener('mousemove', mousemove);
      document.addEventListener('mouseup', mouseup);
      return false;
    });
  }
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

