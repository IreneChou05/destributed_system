
<template>
  <div id="app">
    <!-- change to 'logout' after finish -->
    <div id="login" class="login" @click="jumpPage('login')">Login</div>
    <div class="home">
      <h1>{{ message }}</h1>
      <div class="menu">
        <div id="circle" class="btn_predict" @click="jumpPage('predict')">
          <img src="@/assets/icon/spyglass (1).png" />PREDICT
        </div>
        <div id="circle" class="btn_training" @click="jumpPage('training')">
          <img src="@/assets/icon/dumbbell.png" />TRAINING
        </div>
        <div id="circle" class="btn_dataset" @click="jumpPage('dataset')">
          <img src="@/assets/icon/server.png" />DATASET
        </div>
      </div>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: "LOGO",
    };
  },
  methods: {
    jumpPage(String) {
      this.$router.push({ path: `/${String}` });
    },
    logout(){
      window.localStorage.setItem('isLogin', false);
      // window.localStorage.setItem('token', null);
      console.log(this.login)
      this.$router.push({ path: '/' });
    },
  },
};
</script>



<!-- Use preprocessors via the lang attribute! e.g. <style lang="scss"> -->
<style >
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  overflow: hidden;
  color: #2c3e50;
  /* 以下四種為各種瀏覽器禁止反白 */
  -webkit-user-select: none;
  -moz-user-select: none;
  -o-user-select: none;
  user-select: none;
}
.home {
  width: 90%;
  height: 90%;
  position: absolute; /* ★ */
  top: 50%; /* ★ */
  left: 50%;
  transform: translate(-50%, -50%);
}
.login {
  position: absolute;
  right: 80px;
  top: 30px;
  color: #2f5597;
  font-size: 30px;
  font-weight: bold;
  z-index: 100;
}
.login:hover {
  color: deepskyblue;
}
.menu {
  text-align: center;
  position: relative;
  margin-top: 20px;
}
#circle {
  position: relative;
  border: none;
  border-radius: 50%;
  font: inherit;
  font-size: 30px;
  height: 200px;
  width: 200px;
  display: inline-block;
  margin: 60px;
  text-align: center;
}
div.btn_predict {
  background-color: #c5e0b4;
}
div.btn_training {
  background-color: #ffe699;
}
div.btn_dataset {
  background-color: #bdd7ee;
}
img {
  display: block;
  width: 60px;
  height: auto;
  margin: auto;
  padding-top: 50px;
  padding-bottom: 10px;
}

h1 {
  font-size: 160px;
  margin: 80px 0px 0px 0px;
  text-align: center;
  position: relative;
}
</style>