
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
      <template v-for="(card, i) in serviceList">
        <el-card
          shadow="hover"
          id="model_blank"
          class="model_blank"
          :index="i"
          :key="i"
          @click.native="showDetail(i)"
        >
        <h1>{{card.name}}</h1>
        <p class="model_date">{{card.createdAt}}</p>
        </el-card>
      </template>
    </div>
    <el-button class="add_btn" circle @click="addPopup = true"
      ><i class="el-icon-plus" style="font-size: 25px"
    /></el-button>

    <!-- add service popup -->
    <el-dialog
      custom-class="model_blank"
      title="Create Service"
      :visible.sync="addPopup"
      width="60%"
      append-to-body
      center
      @closed="resetForm('form')"
    >
      <el-form :model="form" :rules="rules" ref="form" label-width="auto">
        <el-form-item prop="service_title">
          <el-input
            class="title_input"
            type="text"
            v-model="form.service_title"
            placeholder="TITLE"
            suffix-icon="el-icon-edit"
          />
        </el-form-item>
        <hr />
        <el-form-item prop="upload_model">
          <label>Model:</label>
          <el-select
            v-model="form.upload_model"
            filterable
            clearable
            placeholder="Choose Model"
            loading-text="Loading"
            no-match-text="No Match Data"
            no-data-text="No Data"
          >
            <el-option
              v-for="(model, i) in modelFilter"
              :index="i"
              :key="i"
              :label="model.name"
              :value="model.id"
            >
              <span style="float: left; font-size: 20px">{{ model.name }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="text-align: right; margin-top: 50px">
          <el-button type="primary" @click="submitService">ADD</el-button>
          <el-button @click="resetForm('form')">RESET</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- set service data -->
    <el-dialog
      custom-class="model_blank"
      title="Set Service"
      :visible.sync="setPopup"
      width="60%"
      append-to-body
      center
      @closed="resetForm('form')"
    >
      <el-form :model="form" :rules="rules" ref="form" label-width="auto">
        <el-form-item prop="dataUrl">
          <label>Add Data:</label>
          <el-select
            v-model="form.dataUrl"
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
              v-for="(dataset, i) in datasetFilter"
              :index="i"
              :key="i"
              :label="dataset.name"
              :value="dataset.fileUrl"
            >
              <span style="font-size: 20px">{{ dataset.name }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <!-- upload popup -->
        <!-- <el-card
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
          <el-button
                type="warning"
                icon="el-icon-check"
                circle
                style="float:right"
                @click="batchUpload()"
              ></el-button> -->
        <!-- </el-card> -->
        <!-- fillup popup -->
        <!-- <el-card
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
        </el-card> -->
        <el-form-item style="text-align: right; margin-top: 50px">
          <el-tooltip class="item" effect="dark" content="Delete Service" placement="bottom">
          <el-popconfirm
            placement="bottom"
            confirm-button-text="YES"
            confirm-button-type="warning"
            cancel-button-text="CANCEL"
            title="Delete this training ?"
            @confirm="stopService(detail.id)"
          >
            <el-button
              slot="reference"
              type="danger"
              icon="el-icon-delete"
              round
              style="float:left"
            ></el-button>
          </el-popconfirm>
        </el-tooltip>
          <el-button type="primary" @click="batchUpload">
            Start
          </el-button>
        </el-form-item>
        <!-- result popUp -->
        <el-card shadow="never"  class="result_blank">
          <h1>RESULT</h1>
          <hr />
          <template v-if="result==''">
            <i class="el-icon-loading" style="font-size:20px;margin:20px;" />
          </template>
          <template v-else>
            <label><el-link :href="result"  style="font-size:20px;margin:20px;" target="primary">{{ result }}</el-link></label>
          </template>
        </el-card>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import { datasets_url } from "@/config/api.js";
import { prediction_stop_url } from "@/config/api.js";
import { prediction_start_url } from "@/config/api.js";
import { prediction_service_url } from "@/config/api.js";
import { training_list_url } from "@/config/api.js";
export default {
  data() {
    return {
      search: "",
      message: "PREDICT",
      result: "",
      file: "",
      file_size: "",
      show: true,
      addPopup: false,
      setPopup: false,
      uploadShow: false,
      fillShow: false,
      resultShow: false,
      activeIndex: "1",
      detail: [
      ],
      model:[],
      datasets:[],
      items: [
        {
          icon: require("@/assets/icon/home.png"),
          index: "1",
          title: "HOME",
          path: "home",
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
        upload_model: "",
        inputs: [{ col: "", val: "" }],
        file_name: "",
        model_id: "",
        dataUrl: "",
      },
      rules: {
        service_title: [
          {
            required: true,
            message: "please enter the title ",
            trigger: "blur",
          },
        ],
        upload_model: [
          {
            required: true,
            message: "please choose a model ",
            trigger: "change",
          },
        ],
        dataUrl: [
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
      serviceList: {},
      setForm: {},
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
    },
    batchUpload(){
      let submitForm = {
        dataUrl: this.form.dataUrl
      }
      let reqUrl = "http://"+ this.detail.serviceEndpoint + "/predictBatch";
      console.info("submit", submitForm, reqUrl,this.detail.token);
      fetch(reqUrl, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "token": this.detail.token,
        },
        body: JSON.stringify(submitForm),
      })
        .then(async (resp) => {
          const a = await resp.json();
          console.log(a);
          if (a.status == 200) {
            this.result = a.data.resultUrl;
            // this.setPopup = false
            console.log("success");
          } else {
            this.isError = true;
          }
        })
        .catch((error) => {
          console.warn("error", error);
        });
    },
    setModel(index) {
      this.form.model_id = this.model[index].id;
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
    submitService() {
      let submitForm = {
        name: this.form.service_title,
        tjId: this.form.upload_model,
      };
      console.log("submit", submitForm);
      fetch(prediction_start_url, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": "Bearer " + window.localStorage.getItem("token"),
        },
        body: JSON.stringify(submitForm),
      })
        .then(async (resp) => {
          const a = await resp.json();
          console.log(a);
          if (a.status == 201) {
            this.getService();
            // window.localStorage.setItem("url", null);
            console.log("success");
            this.addPopup = false;
          } else {
            this.isError = true;
          }
        })
        .catch((error) => {
          console.warn("error", error);
        });
    },
    stopService(id) {
      fetch(prediction_stop_url + `/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + window.localStorage.getItem("token"),
        },
      })
        .then(async (resp) => {
          const a = await resp.json();
          console.info(a);
          if (a.status == 200) {
            this.getService();
            console.log("success");
            this.setPopup = false;
          } else {
            this.isError = true;
          }
        })
        .catch((error) => {
          console.warn("error", error);
        });
      this.detailPopup = false;
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    jumpPage(String) {
      this.$router.push({ path: `/${String}` });
    },
    showDetail(i) {
      this.setPopup = true;
      this.detail = this.serviceList[i];
      return this.detail;
    },
    getModel() {
      fetch(training_list_url, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + window.localStorage.getItem("token"),
        },
      })
        .then(async (resp) => {
          const a = await resp.json();
          console.log("getModel", a);
          if (a.status == 200) {
            this.model = a.data;
          } else {
            this.isError = true;
          }
        })
        .catch((error) => {
          console.warn("error", error);
        });
    },
    getService() {
      fetch(prediction_service_url, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + window.localStorage.getItem("token"),
        },
      })
        .then(async (resp) => {
          const a = await resp.json();
          console.log("getService", a);
          if (a.status == 200) {
            this.serviceList = a.data;
          } else {
            this.isError = true;
          }
        })
        .catch((error) => {
          console.warn("error", error);
        });
    },
    getDataset(){
      fetch(datasets_url, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + window.localStorage.getItem("token"),
      },
    })
      .then(async (resp) => {
        const a = await resp.json();
        console.log("getDataset", a);
        if (a.status == 200) {
          this.datasets = a.data;
        } else {
          this.isError = true;
        }
      })
      .catch((error) => {
        console.warn("error", error);
      });
    }
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
    modelFilter() {
      let result = this.model;
      const filter = (item) => {
        item = item.state.includes("Finished"); //之後要改成Finished
        return item;
      };
      return result.filter(filter);
    },
    datasetFilter(){
      let result = this.datasets;
      const filter = (item) => {
        if(item.target == ""||item.target == null){
          return item;
        }
      };
      return result.filter(filter);
    }
  },
  created() {
    this.getModel();
    this.getDataset();
    this.getService();
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
  height: 150px;
  width: 750px;
  z-index: -1;
  overflow-x: hidden;
  border-bottom: 1px #000000;
  position: relative;
  font: inherit;
  background-color: #ffffff;
  /* box-shadow: 0px 0px 5px gray; */
  text-align: left;
  margin: 20px auto;
  /*以下四種為各種瀏覽器禁止反白 */
  -webkit-user-select: none;
  -moz-user-select: none;
  -o-user-select: none;
  user-select: none;
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
.model_date {
  width: auto;
  height: auto;
  font-size: 18px;
  font-weight: normal;
  margin: 5px 20px;
  padding: 0px;
  line-height: 40px;
  position: relative;
  float: right;
  right: 10px;
  color: #7f7f7f;
}
.add_btn {
  position: absolute;
  background-color: lightgreen;
  border: none;
  margin: 0px;
  bottom: 40px;
  right: 40px;
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
  width: auto;
  top: 10%;
  z-index: 100;
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
div >>> .el-dialog__title {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
  font-size: 40px;
  line-height: 40px;
}
.el-dialog__wrapper::-webkit-scrollbar {
  display: none;
}
</style>

