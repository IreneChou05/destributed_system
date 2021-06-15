<template>
  <div id="app">
    <router-link to="/"></router-link>
    <router-view />
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: "app",
  created: function () {
      axios.interceptors.request.use(
      (config) => {
        if (window.localStorage.getItem("token")) {
          config.headers.Authorization = `${window.localStorage.getItem(
            "token"
          )}`;
        }
        return config;
      },
      (err) => {
        return Promise.reject(err);
      }
    );
    
  },
  data() {
    return {
      currentTime: new Date().getTime(),
    };
  },
  methods: {
    OperatingWebsite() {
      let lastTime = this.currentTime;
      let currentTime = new Date().getTime();
      let timeOut = 30 * 60 * 1000; //設定時間 30分鐘
      if (currentTime - lastTime > timeOut) {
        console.warn("timeOut");
        // 未操作頁面，跳轉登入頁面
        this.currentTime = new Date().getTime();
        localStorage.setItem("isLogin", false);
        this.$router.push("/");
      } else {
        this.currentTime = new Date().getTime();
      }
    },
  },
};
</script>