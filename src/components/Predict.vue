
<template>
  <div id="predict" class="main">
    <div id="header" class="header">
      <h1>{{ message }}</h1>
      <span class="menu_btn" @click="show = !show">&#9776;</span>
    </div>
    <div>
      <el-menu
        :class="{ openSideBar: show }"
        class="el-menu-sideBar"
        mode="vertical"
        @open="handleOpen"
        @close="handleClose"
        active-text-color="#ffd04b"
        :unique-opened="true"
        default-active=""
      >
        <el-input
          class="sideBar_input"
          type="text"
          v-model="search"
          placeholder="Search title.."
          prefix-icon="el-icon-search"
        />
        <template v-for="item in filteredList">
          <template v-if="item.subs">
            <el-submenu :index="item.index" :key="item.index">
              <template slot="title">
                <img v-bind:src="item.icon" />
                {{ item.title }}
              </template>
              <hr />
              <el-menu-item
                v-for="subItem in item.subs"
                :key="subItem.index"
                :index="subItem.index"
                @click="setTitle(subItem.title)"
              >
                {{ subItem.title }}
              </el-menu-item>
            </el-submenu>
          </template>
          <template v-else>
            <el-menu-item
              class="item_label"
              v-bind:key="item.index"
              :index="item.index"
              @click="jumpPage(item.path)"
            >
              <img v-bind:src="item.icon" />
              {{ item.title }}
            </el-menu-item>
          </template>
        </template>
      </el-menu>
    </div>
    <div id="canvas" class="canvas"></div>
    <div class="model_view" :class="{ model_view2: !show }">
      <el-form :model="form" ref="form">
        <el-card id="model_blank" class="model_blank">
          <el-form-item>
            <el-input
              class="title_input"
              type="text"
              prop="service_title"
              v-model="form.service_title"
              placeholder="TITLE"
              suffix-icon="el-icon-edit"
            />
          </el-form-item>
          <hr />
          <el-form-item>
            <label>Model:</label>
            <el-select
              v-model="form.model_name"
              prop="model_name"
              filterable
              clearable
              placeholder="Choose Model"
              @change="setModel"
              loading-text="Loading"
              no-match-text="No Match Data"
              no-data-text="No Data"
            >
              <el-option
                v-for="(model, i) in model"
                :index="i"
                :key="i"
                :label="model.name"
                :value="i"
              >
                <span style="float: left; font-size: 20px">{{
                  model.name
                }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <label>Add Data:</label>
            <el-select
              v-model="form.data_label"
              prop="data_label"
              filterable
              clearable
              placeholder="Choose"
              @change="setData"
              @clear="
                fillShow = false;
                uploadShow = false;
              "
              loading-text="Loading"
              no-match-text="No Match Data"
              no-data-text="No Data"
            >
              <el-option
                v-for="(method, i) in upload_method"
                :index="i"
                :key="i"
                :label="method.label"
                :value="method.value"
              >
                <i
                  style="font-size: 16px; margin-right: 10px"
                  :class="method.icon"
                ></i>
                <span style="font-size: 20px">{{ method.label }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <!-- upload popup -->
          <el-card
            shadow="never"
            class="card_close"
            :class="{ cardUpload_open: uploadShow }"
          >
            <div class="upload_btn" @click="$refs.file.click()">
              <input
                type="file"
                ref="file"
                @change="fileUpload()"
                style="display: none"
                accept=".csv"
              />
              <img class="upload_img" src="@/assets/icon/upload.png" />UPLOAD
            </div>
            <el-form-item style="display: inline-block" prop="file_name">
              <label> File Name: {{ form.file_name }}</label>
            </el-form-item>
          </el-card>
          <!-- fillup popup -->
          <el-card
            shadow="never"
            class="card_close"
            :class="{ cardFill_open: fillShow }"
          >
            <div class="add_column">
              <el-form-item
                v-for="(input, i) in form.inputs"
                :key="i"
                :props="'input.' + i"
              >
                <el-input
                  placeholder="Column"
                  prefix-icon="el-icon-files"
                  v-model="input.col"
                  clearable
                  class="add_input"
                >
                </el-input>

                <el-input
                  placeholder="Value"
                  prefix-icon="el-icon-edit"
                  v-model="input.val"
                  class="add_input"
                >
                </el-input>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  circle
                  @click="removeInput(input)"
                ></el-button>
                <el-button
                  type="warning"
                  icon="el-icon-plus"
                  circle
                  @click="addInput"
                ></el-button>
              </el-form-item>
            </div>
          </el-card>
        </el-card>
        <div id="send_btn" class="send_btn" @click="submitInput()">OK</div>
      </el-form>
      <el-card id="result_blank" class="result_blank">
        <h1>RESULT</h1>
        <hr />
        <label>{{ result }}</label>
      </el-card>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      search: "",
      message: "PREDICT",
      file: "",
      file_size: "",
      result: "Predict Result...",
      show: true,
      uploadShow: false,
      fillShow: false,
      activeIndex: "1",
      items: [
        {
          icon: require("@/assets/icon/home.png"),
          index: "1",
          title: "HOME",
          path: "",
        },
        {
          icon: require("@/assets/icon/spyglass (1).png"),
          index: "2",
          title: "PREDICT",
          path: "predict",
        },
        {
          icon: require("@/assets/icon/dumbbell.png"),
          index: "3",
          title: "TRAINING",
          path: "training",
        },
        {
          icon: require("@/assets/icon/server.png"),
          index: "4",
          title: "DATASET",
          path: "dataset",
        },
        { 
          icon: require("@/assets/icon/magic-wand.png"),
          index: "5",
          title: "SERVICE",
          subs: [
            {
              index: "5-1",
              title: "one",
             
            },
            {
              index: "5-2",
              title: "two",
              
            },
            {
              index: "5-3",
              title: "three",
              
            },
          ],
        },
      ],
      model: [
        {
          name: "one",
          url: "",
          token: "",
          models: ["1", "2"],
        },
        {
          name: "two",
          url: "",
          token: "",
          models: [],
        },
        {
          name: "three",
          url: "",
          token: "",
          models: [],
        },
        {
          name: "four",
          url: "",
          token: "",
          models: [],
        },
        {
          name: "five",
          url: "",
          token: "",
          models: [],
        },
      ],
      upload_method: [
        {
          label: "Upload File",
          value: "upload",
          icon: "el-icon-upload2",
        },
        {
          label: "Fill in Data",
          value: "fill",
          icon: "el-icon-edit-outline",
        },
      ],
      form: {
        service_title: "",
        upload_model: [],
        inputs: [{ col: "", val: "" }],
        file_name: "",
        model_name: "",
        data_label: "",
      },
      rules: {
        service_title: [
          {
            required: true,
            message: "please enter the title ",
            trigger: "blur",
          },
        ],
        model_name: [
          {
            required: true,
            message: "please choose a model ",
            trigger: "change",
          },
        ],
        data_label: [
          {
            required: true,
            message: "please choose a method to upload data ",
            trigger: "change",
          },
        ],
        file_name: [{ message: "please upload a file ", trigger: "change" }],
        inputs: [
          { message: "please fill at least one data ", trigger: "change" },
        ],
      },
      submit: [],
    };
  },
  methods: {
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },
    setTitle(title) {
      this.form.service_title = title;
    },
    fileUpload() {
      let file = this.$refs.file.files[0];
      this.file = file;
      this.form.file_name = file.name;
      this.file_size = file.size + "  bytes";
      this.form.inputs = file;
    },
    setModel(index) {
      this.form.upload_model = this.model[index].models;
    },
    setData(command) {
      if (command == "upload") {
        this.uploadShow = !this.uploadShow;
        this.fillShow = false;
        this.Data_title = "Upload File";
      }
      if (command == "fill") {
        this.fillShow = !this.fillShow;
        this.uploadShow = false;
        this.Data_title = "Fill in Data";
      }
    },
    removeInput(item) {
      var index = this.form.inputs.indexOf(item);
      if (index !== 0) {
        this.form.inputs.splice(index, 1);
      }
    },
    addInput() {
      this.form.inputs.push({
        col: "",
        val: "",
      });
    },
    submitInput() {
      this.submit.title = this.form.service_title;
      this.submit.model = this.form.upload_model;
      this.submit.input = this.form.inputs;
      console.log("input", this.submit);
      this.resetForm();
    },
    resetForm() {
      //reset 要想更好的方式
      this.uploadShow = false;
      this.fillShow = false;
      this.form.service_title = "";
      this.form.inputs = [{ col: "", val: "" }];
      this.form.upload_model = [];
      this.model_name = "";
      this.data_label = "";
    },
    jumpPage(String) {
      this.$router.push({ path: `/${String}` });
    },
  },
  computed: {
    onRoutes() {
      return this.$route.path.replace("/", "");
    },

    filteredList() {
      let result = this.items;
      const reset = result.map((o) => ({ ...o })); // var reset = JSON.parse( JSON.stringify(result) );
      if (!this.search) {
        return result;
      }
      const search = this.search.toLowerCase();
      const filter1 = (item) => {
        if (item.subs) {
          item.subs = item.subs.filter((sub) =>
            sub.title.toLowerCase().includes(search)
          );
        }
        return item;
      };

      const filter2 = (item) => {
        if (item.subs) {
          item =
            item.title.toLowerCase().includes(search) || item.subs.length !== 0;
        } else {
          item = item.title.toLowerCase().includes(search);
        }
        return item;
      };
      return reset.map(filter1).filter(filter2);
    },
    // startPredict(){//TODO
    //   this.file.submit()
    // }
  },
};
</script>

<!-- Use preprocessors via the lang attribute! e.g. <style lang="scss"> -->



<style scoped>
.main {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
  overflow: hidden;
  text-align: center;
}

.header {
  position: absolute;
  border: none;
  font: inherit;
  height: 75px;
  width: 100%;
  top: 0%;
  left: 0%;
  background-color: #c5e0b4;
}
.menu_btn {
  font-size: 50px;
  cursor: pointer;
  position: absolute;
  left: 40px;
  top: 5px;
  z-index: 100;
}

h1 {
  height: 75px;
  line-height: 75px;
  text-align: center;
  margin: auto;
  font-size: 50px;
}
.canvas {
  position: absolute;
  font: inherit;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  background-color: #f4f4f4;
  z-index: -1000;
}
.el-menu-sideBar {
  height: 88vh;
  width: 22vw;
  min-width: 350px;
  z-index: 1;
  top: 75px;
  padding-top: 0px;
  left: -450px;
  overflow-x: hidden;
  transition: left 1s;
  list-style: none;
  border-bottom: 1px #000000;
  position: absolute;
  font: inherit;
  background-color: #ffffff;
  box-shadow: 5px 5px 10px gray;
}
.el-menu-sideBar::-webkit-scrollbar {
  display: none;
}
.openSideBar {
  width: 22vw;
  left: 0 !important;
}
img {
  height: 40px;
  margin: 0px 10px 10px 0px;
  width: auto;
  line-height: 40px;
  padding: 0px;
  display: inline;
}
/* .headBar {
  width: 100%;
  height: 50px;
  display: flex;
  background-color: #000000;
}

.title {
  background-color: #ffdb15;
  color: #000;
  height: 100%;
  min-width: 200px;
  width: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  letter-spacing: 5px;
  font-size: 17px;
} */

.el-menu-sideBar hr {
  margin: 15px 15px;
  border: 1px solid #e3e3e3;
  background-color: #e3e3e3;
}

.sideBar_input {
  width: 300px;
  min-width: 300px;
  margin-top: 20px;
  font-size: 30px;
}

.el-menu-item.item_label {
  font-size: 35px;
  margin: 20px 0px 10px 0px;
  text-align: left;
  padding-left: 0px;
  color: #000000;
  background-color: #ffffff;
}
.model_view {
  position: absolute;
  width: 65vw;
  height: 88vh;
  left: 30%;
  top: 75px;
  overflow: auto;
  z-index: -100;
  transition: 1s;
}
.model_view2 {
  position: absolute;
  width: 85vw;
  height: 88vh;
  left: 10%;
  top: 75px;
  overflow: auto;
  z-index: -100;
  transition: 1s;
}
.model_view::-webkit-scrollbar {
  display: none;
}
.model_blank {
  height: auto;
  width: 700px;
  overflow: auto;
  border-bottom: 1px #000000;
  position: relative;
  font: inherit;
  background-color: #ffffff;
  border-radius: 15px;
  text-align: left;
  z-index: 100;
  margin: 30px auto 20px auto;
}
.model_blank h1,
.result_blank h1 {
  width: auto;
  height: 40px;
  font-size: 30px;
  font-weight: normal;
  margin: 5px 20px;
  padding: 0px 10px;
  line-height: 40px;
  display: inline-block;
}

.model_blank hr,
.result_blank hr {
  margin: 0px;
  border: 1px solid #e3e3e3;
  background-color: #e3e3e3;
}
.model_blank label,
.result_blank label {
  position: relative;
  margin: 10px 20px 0px 20px;
  padding: 10px;
  font-size: 20px;
  color: #7f7f7f;
  display: inline-block;
}

.add_input {
  width: 35%;
  height: 25px;
  font-size: 16px;
  margin: 0px 10px;
  display: inline-block;
}
.upload_btn {
  position: relative;
  border: none;
  border-radius: 50%;
  font: inherit;
  font-size: 12px;
  font-weight: bold;
  height: 70px;
  width: 70px;
  margin: 0px 50px 0px 0px;
  background-color: #c5e0b4;
  color: #548235;
  text-align: center;
  left: 40px;
  display: inline-block;
}
.upload_img {
  display: block;
  width: 20px;
  height: auto;
  margin: auto;
  padding-top: 12px;
  padding-bottom: 5px;
}
.card_close {
  display: none;
}
.cardUpload_open {
  display: unset;
}
.cardFill_open {
  display: unset;
  overflow-x: hidden;
}
.send_btn {
  height: 35px;
  width: 500px;
  z-index: 100;
  position: relative;
  font: inherit;
  background-color: #c5e0b4;
  box-shadow: 0px 0px 10px lightgray;
  border: none;
  border-radius: 10px;
  font-size: 20px;
  font-weight: bold;
  line-height: 35px;
  letter-spacing: 5px;
  margin: 20px auto 20px auto;
}

.result_blank {
  height: auto;
  width: 700px;
  top: 10%;
  z-index: -1;
  overflow-x: hidden;
  border-bottom: 1px #000000;
  position: relative;
  font: inherit;
  background-color: #ffffff;
  border-radius: 15px;
  text-align: left;
  margin: 20px auto 20px auto;
  overflow: auto;
}
.title_input {
  min-width: 300px;
  font-size: 30px;
}
/*覆蓋區*/
.el-menu-sideBar label {
  font-size: 50px;
  margin-top: 20px;
}

div >>> .el-submenu__title {
  font-size: 35px;
  margin: 20px 0px 10px 0px;
  text-align: left;
  padding-left: 0px;
}
div >>> .sideBar_input input {
  padding-left: 50px;
  border: 2px solid black;
}
div >>> .title_input input {
  border: none;
}
.el-menu-item {
  font-size: 30px;
  margin: 20px 30px;
  width: 300px;
  min-width: 300px;
  background-color: #e3e3e3;
  color: #000000;
}
.el-form-item {
  margin: 0px;
}
</style>

