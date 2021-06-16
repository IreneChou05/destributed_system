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
        <template v-for="item in items">
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
                @click="add(subItem)"
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
    <div id="canvas" class="canvas">
      <div class="train_view" :class="{ train_view2: !show }">
        <template v-for="(card, i) in filteredList">
          <el-card
            shadow="hover"
            id="train_blank"
            class="train_blank"
            :index="i"
            :key="i"
            @click.native="showDetail(i)"
          >
            <h1>{{ card.name }}</h1>
            <label
              >State :
              <template v-if="card.state == 'Training'">
                <i class="el-icon-loading" />
              </template>
              <template v-else-if="card.state == 'Finished'">
                <i class="el-icon-circle-check" />
              </template>
              {{ "\xa0" + card.state.toUpperCase() }}</label
            >
            <p class="train_date">{{card.createdAt}}</p>
          </el-card>
        </template>
      </div>
    </div>
    <el-button class="add_btn" type="warning" circle @click="addPopup = true"
      ><i class="el-icon-plus" style="font-size: 25px"
    /></el-button>

    <!-- add new training dialog -->
    <el-dialog
      class="upload_blank"
      title="Add New Training"
      :visible.sync="addPopup"
      width="60%"
      append-to-body
      @closed="resetForm('addForm')"
    >
      <el-form
        :model="addForm"
        :rules="rules"
        ref="addForm"
        label-width="100px"
      >
        <el-form-item label="Model Name" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
        <el-form-item label="Dataset" prop="datasetUrl">
          <el-select v-model="addForm.datasetUrl" placeholder="Choose" loading-text="Loading"
              no-match-text="No Match Data"
              no-data-text="No Data">
            <el-option
              v-for="(dataset, i) in datasets"
              :index="i"
              :key="i"
              :label="dataset.name"
              :value="dataset.fileUrl"
            >
              <span style="float: left; font-size: 20px">{{
                dataset.name
              }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="pre-Process" prop="preConfig">
          <el-input
            v-model="addForm.preConfig"
            type="textarea"
            placeholder="cmds"
            autosize
          ></el-input>
        </el-form-item>
        <el-form-item label="Config Task" prop="mlConfig_task">
          <el-input v-model="addForm.mlConfig_task"></el-input>
        </el-form-item>
        <el-form-item label="ValidateRatio" prop="mlConfig_validateRatio">
          <el-input
            v-model="addForm.mlConfig_validateRatio"
            type="number"
          ></el-input>
        </el-form-item>
        <el-form-item label="Model Tag" prop="mlConfig_modelTag">
          <el-input v-model="addForm.mlConfig_modelTag"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">ADD</el-button>
          <el-button @click="resetForm('addForm')">RESET</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- show training detail -->
    <el-dialog
      :visible.sync="detailPopup"
      append-to-body
      width="50%"
      style="min-width: 500px"
    >
      <h1>{{ detail.name }}</h1>
      <p class="detail_blank">State: {{ detail.state }}</p>
      <p class="detail_blank">ModelUrl: {{ detail.modelUrl }}</p>
      <p class="detail_blank">DatasetUrl: {{ detail.datasetUrl }}</p>
      <p class="detail_blank">valLoss: {{ detail.valLoss }}</p>
      <p class="detail_blank">trainLoss: {{ detail.trainLoss }}</p>
      <p class="detail_blank">valAcc: {{ detail.valAcc }}</p>
      <p class="detail_blank">createdAt: {{ detail.createdAt }}</p>
      <!-- <p class="detail_blank">cmds: {{ detail.preConfig.cmds }}</p>
      <p class="detail_blank">Task: {{ detail.mlConfig.task }}</p>
      <p class="detail_blank">validateRatio: {{ detail.mlConfig.validateRatio }}</p>
      <p class="detail_blank">modelTag: {{ detail.mlConfig.modelTag }}</p> -->
      <template v-if="detail.state == 'Finished'">
        <el-popconfirm
          confirm-button-text="YES"
          confirm-button-type="warning"
          cancel-button-text="CANCEL"
          title="Save this training ?"
          @confirm="saveModel(detail.id)"
        >
          <el-button class="save_btn" slot="reference" type="success" circle
            ><i class="el-icon-check"
          /></el-button>
        </el-popconfirm>
      </template>

      <el-popconfirm
        confirm-button-text="YES"
        confirm-button-type="warning"
        cancel-button-text="CANCEL"
        title="Delete this training ?"
        @confirm="remove(detail.id)"
      >
        <el-button slot="reference" class="delete_btn" type="danger" circle
          ><i class="el-icon-delete"
        /></el-button>
      </el-popconfirm>
      <div style="text-align: right"></div>
    </el-dialog>
  </div>
</template>

<script>
import {training_job_url} from "@/config/api.js";
import { datasets_url } from "@/config/api.js";
export default {
  data() {
    return {
      search: "",
      message: "TRAINING",
      components: [],
      show: true,
      addPopup: false,
      detailPopup: false,
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
          // subs: [
          //   {
          //     index: "2-1",
          //     title: "From Local",
          //     icon: require("@/assets/icon/local.png"),
          //   },
          // ],
        },
      ],
      addForm: {
        name: "",
        datasetUrl: "",
        preConfig: "",
        mlConfig_task: "",
        mlConfig_validateRatio: "",
        mlConfig_modelTag: "",
      },
      submit: {
        name: "",
        datasetUrl: "",
        preConfig: {
          cmds: [],
        },
        mlConfig: {
          task: "",
          validateRatio: "",
          modelTag: "",
        },
      },
      datasets: [],
      rules: {
        name: [
          { required: true, message: "Please enter the name", trigger: "blur" },
        ],
        datasetUrl: [
          {
            required: true,
            message: "Please choose a dataset",
            trigger: "change",
          },
        ],
        preConfig: [
          { required: true, message: "Please enter cmds", trigger: "blur" },
        ],
        mlConfig_task: [
          { required: true, message: "Please enter the task", trigger: "blur" },
        ],
        mlConfig_validateRatio: [
          {
            required: true,
            message: "Please enter the float",
            trigger: "blur",
          },
        ],
        mlConfig_modelTag: [
          {
            required: true,
            message: "Please enter the modelTag",
            trigger: "blur",
          },
        ],
      },
      pretrainList: [
        {
          id: "",
          name: "name1",
          state: "Training",
          datasetUrl: "url",
          modelUrl: "url",
          valLoss: 1.1,
          trainLoss: 2.2,
          valAcc: 3.3,
          trainAcc: 4.4,
          createdAt: "2021-06-12 09:09:09",
          userId: "id",
          preConfig: {
            cmds: [""],
          },
          mlConfig: {
            task: "classification",
            validateRatio: 0.2,
            modelTag: "nn",
          },
        },
        {
          id: "",
          name: "name2",
          state: "Finished",
          datasetUrl: "url",
          modelUrl: "url",
          valLoss: 1.1,
          trainLoss: 2.2,
          valAcc: 3.3,
          trainAcc: 4.4,
          createdAt: "2021-06-12 09:09:09",
          userId: "id",
          preConfig: {
            cmds: [""],
          },
          mlConfig: {
            task: "classification",
            validateRatio: 0.2,
            modelTag: "nn",
          },
        },
        {
          id: "",
          name: "name3",
          state: "Finished",
          datasetUrl: "url",
          modelUrl: "url",
          valLoss: 1.1,
          trainLoss: 2.2,
          valAcc: 3.3,
          trainAcc: 4.4,
          createdAt: "2021-06-12 09:09:09",
          userId: "id",
          preConfig: {
            cmds: [""],
          },
          mlConfig: {
            task: "classification",
            validateRatio: 0.2,
            modelTag: "nn",
          },
        },
      ],
      detail: [
        {
          id: "",
          name: "",
          state: "",
          datasetUrl: "",
          modelUrl: "",
          valLoss: "",
          trainLoss: "",
          valAcc: "",
          trainAcc: "",
          createdAt: "",
          userId: "",
          preConfig: {
            cmds: [""],
          },
          mlConfig: {
            task: "",
            validateRatio: "",
            modelTag: "",
          },
        },
      ],
    };
  },
  methods: {
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },
    add(subItem) {
      this.components.push(subItem);
    },
    saveModel(id) {
      let saveForm = {
        userId: this.detail.userId,
        modelUrl: this.detail.modelUrl,
        report: {
          task: this.detail.mlConfig.task,
          trainLoss: this.detail.trainLoss,
          valLoss: this.detail.valLoss,
          trainLossVar: this.detail.trainLossVar, // regression only
          valLossVar: this.detail.valLossVar, // regression only
        },
      };
      // fetch(training_job_url+`/${id}`+"/report", {
      //   method: "PATCH",
      //   headers: {
      //     "Accept": "application/json",
      //     "Content-Type": "application/json",
      //     "Authorization": "Bearer " + window.localStorage.getItem("token"),
      //   },
      //   body: JSON.stringify(submitForm),
      // })
      //   .then(async (resp) => {
      //     const a = await resp.json();
      //     console.info(a);
      //     if (a.status == 201) {
      //       // this.createList();
      //       // window.localStorage.setItem("url", null);
      //       console.log("success");
      // this.addPopup = false;
      //     } else {
      //       this.isError = true;
      //     }
      //   })
      //   .catch((error) => {
      //     console.warn("error", error);
      //   });
      console.info("save", saveForm,training_job_url+`/${id}`+"/report");
    },
    remove(id) {
      console.info("id",training_job_url+`/${id}`)
      // fetch(training_job_url+`/${id}`, {
      //   method: "DELETE",
      //   headers: {
      //     "Accept": "application/json",
      //     "Content-Type": "application/json",
      //     "Authorization": "Bearer " + window.localStorage.getItem("token"),
      //   },
      // })
      //   .then(async (resp) => {
      //     const a = await resp.json();
      //     console.info(a);
      //     if (a.status == 200) {
      //       this.createList();
      //       console.log("success");
      //       this.detailPopup = false;
      //     } else {
      //       this.isError = true;
      //     }
      //   })
      //   .catch((error) => {
      //     console.warn("error", error);
      //   });
      this.detailPopup = false;
    },
    submitForm() {
      let submitForm = {
        name: this.addForm.name,
        datasetUrl: this.addForm.datasetUrl,
        preConfig: {
          cmds: [this.addForm.preConfig],
        },
        mlConfig: {
          task: this.addForm.mlConfig_task,
          validateRatio: this.addForm.mlConfig_validateRatio,
          modelTag: this.addForm.mlConfig_modelTag,
        },
      };
      console.info("submit", submitForm);
      fetch(training_job_url, {
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
          console.info(a);
          if (a.status == 201) {
            // this.createList();
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

    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    getCurrent() {
      const today = new Date();
      const date =
        today.getFullYear() +
        "." +
        (today.getMonth() + 1) +
        "." +
        today.getDate();
      return date;
    },
    showDetail(i) {
      this.detailPopup = true;
      this.detail = this.pretrainList[i];
      return this.detail;
    }, //DEBUG 存入storage 可解決
    jumpPage(String) {
      this.$router.push({ path: `/${String}` });
    },
    getDataset() {
      fetch(datasets_url, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + window.localStorage.getItem("token"),
        },
      })
        .then(async (resp) => {
          const a = await resp.json();
          console.info("getDataset", a);
          if (a.status == 200) {
            this.datasets = a.data;
          } else {
            this.isError = true;
          }
        })
        .catch((error) => {
          console.warn("error", error);
        });
    },
    getPreTrainList(){
      fetch(training_job_url, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + window.localStorage.getItem("token"),
        },
      })
        .then(async (resp) => {
          const a = await resp.json();
          console.info("getList", a);
          if (a.status == 200) {
            this.pretrainList = a.data;
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
      let result = this.pretrainList;
      const reset = result.map((o) => ({ ...o })); // var reset = JSON.parse( JSON.stringify(result) );
      if (!this.search) {
        return result;
      }
      const search = this.search.toLowerCase();
      const filter = (list) => {
        list = list.name.toLowerCase().includes(search);
        return list;
      };
      return reset.filter(filter);
    },
  },
  created() {
    this.getDataset();
    // this.getPreTrainList();
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
  background-color: #ffe699;
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
  background-color: #111;
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
.add_btn {
  position: absolute;
  background-color: gold;
  border: none;
  margin: 0px;
  bottom: 40px;
  right: 40px;
}
.train_view {
  position: absolute;
  width: 65vw;
  height: 88vh;
  left: 30%;
  top: 75px;
  overflow: auto;
  z-index: -100;
  transition: 1s;
}
.train_view2 {
  position: absolute;
  width: 85vw;
  height: 88vh;
  left: 10%;
  top: 75px;
  overflow: auto;
  z-index: -100;
  transition: 1s;
}
.train_view::-webkit-scrollbar {
  display: none;
}
.train_blank {
  height: auto;
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
.train_blank h1 {
  width: 150px;
  height: auto;
  font-size: 20px;
  font-weight: normal;
  margin: 5px 20px;
  display: inline-block;
  text-align: inherit;
}
.train_blank label {
  width: auto;
  margin: 5px 20px;
  padding: 0px 10px;
  font-size: 20px;
  color: #5b9bd5;
  left: 100px;
}

.train_date {
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
.save_btn {
  position: absolute;
  margin: 5px;
  bottom: 10px;
  right: 70px;
  z-index: 200;
}
.delete_btn {
  position: absolute;
  margin: 5px;
  bottom: 10px;
  right: 10px;
  z-index: 200;
}
.detail_blank {
  font-size: 20px;
  text-align: left;
  margin: 10px;
  display: block;
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
.el-menu-item {
  font-size: 30px;
  margin: 20px 30px;
  width: 300px;
  min-width: 300px;
  background-color: #e3e3e3;
  color: #000000;
  text-align: center;
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