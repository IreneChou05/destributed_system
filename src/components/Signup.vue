<template>
  <div id="signup" class="main">
    <img class="back_img" src="@/assets/background/login.png" />
    <div class="signup_view">
      <div class="signup_blank">
        <h1>Sign Up</h1>
        <el-alert
          v-if="isError"
          class="loginAlert"
          title="Invalid ID or password."
          type="error"
          effect="dark"
          :closable="false"
        ></el-alert>
        <el-form
          ref="form"
          :model="signupForm"
          label-width="140px"
          :rules="rules"
        >
          <el-form-item label="Name" prop="userName">
            <el-input
              v-model="signupForm.userName"
              placeholder="Name"
            ></el-input>
          </el-form-item>
          <el-form-item label="Email" prop="userEmail">
            <el-input
              v-model="signupForm.userEmail"
              placeholder="Email"
            ></el-input>
          </el-form-item>
          <el-form-item label="Password" prop="userPassword">
            <el-input
              v-model="signupForm.userPassword"
              placeholder="Password"
              type="password"
            ></el-input>
          </el-form-item>
          <el-form-item label="Check Password" prop="userPasswordCheck">
            <el-input
              v-model="signupForm.userPasswordCheck"
              placeholder="Check Password"
              type="password"
            ></el-input>
          </el-form-item>
        </el-form>
        <el-button class="signup_btn" type="primary" @click="signup"
          >Sign up</el-button
        >
      </div>
    </div>
  </div>
</template>


<script>
import { user_signup_url } from "@/config/api.js";
// import { post } from "@/utils/requests/post.js";
export default {
  name: "signup",
  data: function () {
    var validatePass = (rule, value, callback) => {
      if (value !== this.signupForm.userPassword) {
        callback(new Error("Password is different"));
      } else {
        callback();
      }
    };
    return {
      isError: false,
      signupForm: {
        userName: "",
        userEmail: "",
        userPassword: "",
        userPasswordCheck: "",
      },
      rules: {
        userName: [
          { required: true, message: "Please input name", trigger: "blur" },
        ],
        userEmail: [
          { required: true, message: "Please input email", trigger: "blur" },
        ],
        userPassword: [
          { required: true, message: "Please input password", trigger: "blur" },
        ],
        userPasswordCheck: [
          {
            required: true,
            message: "Please input password again",
            trigger: "blur",
          },
          { validator: validatePass, trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    signup() {
      // console.log(user_signup_url);
      let userForm = {
        name: this.signupForm.userName,
        email: this.signupForm.userEmail,
        password: this.signupForm.userPassword,
      };
      this.$refs["form"].validate((valid) => {
        if (valid) {
          fetch(user_signup_url, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userForm),
          })
            .then(async (resp) => {
              const a = await resp.json();
              console.log(a);
              if (a.status == 201) {
                this.$router.push("/login");
              } else {
                this.isError = true;
              }
            })
            .catch((error) => {
              this.$message.error("Incorrect account or password");
              console.warn("error", error);
            });
          // post(user_signup_url, userForm).then((response) => {
          //     if(response.data.message == 'success') {
          //         this.$message({
          //             message: 'success',
          //             showClose: true,
          //             duration: 0
          //         })
          //         this.$router.push('/login');
          //     } else {
          //         this.isError = true;
          //     }
          // });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
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

.signup_view {
  position: relative;
  width: 90vw;
  height: 90vh;
  left: 5%;
  top: 5%;
  overflow: auto;
  z-index: -100;
}
.signup_view::-webkit-scrollbar {
  display: none;
}
.signup_blank {
  position: absolute;
  width: 30%;
  height: 80%;
  top: 50%; /* ★ */
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #ffffff;
  box-shadow: 0px 0px 10px gray;
  border-radius: 20px;
  min-height: 550px;
  min-width: 400px;
  padding: 30px 50px;
  z-index: 100;
}
.signup_btn {
  width: 80%;
  margin: 20px auto;
  padding: 5px 20px;
  background-color: #ffcccc;
  box-shadow: 0px 0px 5px gray;
  border: none;
  font-size: 30px;
  color: #000000;
  position: absolute;
  bottom: 5%;
  transform: translateX(-50%);
}
.signup_btn:hover {
  color: #ffffff;
  background-color: lightpink;
}
.signupAlert {
  margin: 10px 0;
}
h1 {
  font-size: 80px;
  color: #000000;
  margin: 10px auto 30px auto;
}
/*覆蓋區*/
.el-input {
  font-size: 16px;
  margin: 0px auto;
}

div >>> .el-input__inner {
  border: 0;
  border-radius: 0px;
  border-bottom: 3px solid #afabab;
}

div >>> .el-form-item label {
  margin-bottom: 0px;
  font-size: 15px;
}
</style>
