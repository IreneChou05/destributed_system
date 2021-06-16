<template>
  <div id="login" class="main">
    <img class="back_img" src="@/assets/background/login.png" />
    <div class="login_view">
      <div class="login_blank">
        <h1>Login</h1>
        <el-alert
          v-if="isError"
          class="loginAlert"
          title="Invalid ID or password."
          type="error"
          effect="dark"
          :closable="false"
        ></el-alert>
        <el-input v-model="userEmail" placeholder="Account"></el-input>
        <el-input
          v-model="userPassward"
          placeholder="Password"
          type="password"
        ></el-input>
        <el-link class="forgot_link" @click="isShowPopup = true">
          Forgot password?
        </el-link>
        <el-button class="login_btn" @click="login"> Login </el-button>
        <el-button class="signup_btn" type="info" @click="jumpPage('signup')">
          Sign Up
        </el-button>
      </div>
    </div>

    <!-- forgot password popup-->
    <el-dialog
      :title="'Forgot password'"
      :visible.sync="isShowPopup"
      :before-close="onForgetPasswordCancel"
      width="40%"
      append-to-body
    >
      <el-form :model="form" :rules="formRule" ref="form">
        <el-form-item label="Account" prop="account">
          <el-input v-model="form.account" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="onForgetPasswordCancel">Cancel</el-button>
        <el-button type="primary" @click="onForgetPasswordConfirm">
          Confirm
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { user_login_url } from "@/config/api.js";
import { signupTime } from "@/config/env.js";
// import { post } from '@/utils/requests/post.js';
export default {
  name: "login",
  data: function () {
    return {
      signupTime: signupTime,
      userEmail: "",
      userPassward: "",
      isError: false,
      isShowPopup: false,
      form: {
        account: "",
      },
      formRule: {
        account: [
          {
            required: true,
            message: "Please input user account",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    login() {
      let userForm = {
        email: this.userEmail,
        password: this.userPassward,
      };
      fetch(user_login_url, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userForm),
      })
        .then(async (resp) => {
          const a = await resp.json();
          console.log(a);
          if (a.status == 200) {
            window.localStorage.setItem("isLogin", true);
            window.localStorage.setItem("token", a.data.token);
            this.$router.push("/home"); //change to '/home' after finish
          } else {
            this.isError = true;
          }
        })
        .catch((error) => {
          this.$message.error("Incorrect account or password");
          console.warn("error", error);
        });
      // post(user_login_url, userForm).then((resp) => {
      //     if(resp.data.message == 'success') {
      //         window.localStorage.setItem('isLogin', true)
      //         window.localStorage.setItem('token', resp.data.data.token)
      //         this.$router.push('/');//change to '/home' after finish
      //     } else {
      //         this.isError = true;
      //     }
      // }).catch((error) => {
      //     this.$message.error('Incorrect account or password')
      //     console.warn('error', error);
      // })
    },
    signup() {
      this.$router.push("/signup");
    },
    onForgetPasswordCancel() {
      this.isShowPopup = false;
      this.form = {
        account: "",
      };
    },
    onForgetPasswordConfirm() {
      console.log(this.form.account);
      // let form = {
      //     account: this.form.account
      // }
      // post(user_forgetPassword_url, form).then((resp) => {
      //     if(resp.data.status == 'success') {
      //         this.$message({
      //             message: 'Please go to your email to verify your identity in 10 minutes',
      //             showClose: true,
      //             duration: 0
      //         })
      //         this.$router.push('/');
      //         this.isShowPopup = false;
      //     }
      // }).catch((error) => {
      //     console.error('Forgot password error', error);
      // })
    },
    jumpPage(String) {
      this.$router.push({ path: `/${String}` });
    },
  },
  components: {},
  computed: {
    // defaultActive: function() {
    //     return this.$route.path.replace('/', '');
    // }
  },
};
</script>

<style scoped>
.main {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0%;
  left: 0%;
  padding: 0px;
  z-index: -1000;
  text-align: center;
}
.back_img {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: -1000;
  top: 0%;
  left: 0%;
  padding: 0px;
}

.login_view {
  position: relative;
  width: 90vw;
  height: 90vh;
  left: 5%;
  top: 5%;
  overflow: auto;
  z-index: -100;
}
.login_view::-webkit-scrollbar {
  display: none;
}
.login_blank {
  position: absolute;
  width: 30%;
  height: 70%;
  top: 50%; /* ★ */
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #ffffff;
  box-shadow: 0px 0px 10px gray;
  border-radius: 20px;
  min-height: 500px;
  min-width: 400px;
  padding: 30px 50px;
  z-index: 100;
}
.forgot_link {
  display: block;
  float: right;
  color: #2f5597;
  text-align: right;
  margin: 10px auto;
  font-size: 25px;
}
.signup_btn {
  color: #2f5597;
  background-color: #ffffff;
  border: none;
  text-align: center;
  margin-top: 20px;
  font-size: 25px;
}
.signup_btn:hover {
  color: deepskyblue;
}

.login_btn {
  width: 80%;
  margin: 20px auto;
  padding: 5px 20px;
  background-color: #ffcccc;
  box-shadow: 0px 0px 5px gray;
  border: none;
  text-align: center;
  font-size: 30px;
  color: #000000;
}
.login_btn:hover {
  color: #ffffff;
  background-color: lightpink;
}

.loginAlert {
  margin: 10px 0;
}
h1 {
  font-size: 80px;
  color: #000000;
  margin: 10px auto 30px auto;
}
/*覆蓋區*/
.el-input {
  font-size: 30px;
  margin: 20px auto;
}
div >>> .el-input__inner {
  border: 0;
  border-radius: 0px;
  border-bottom: 3px solid #afabab;
}
</style>
