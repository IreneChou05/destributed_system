
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
                v-for="(subItem, i) in item.subs"
                :key="i"
                :index="subItem.index"
              >
                <img v-bind:src="subItem.icon" />
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
    <div class="dataset_view" :class="{ dataset_view2: !show }">
      <template v-for="(dataset, i) in filteredList">
        <el-card
          shadow="hover"
          id="dataset_blank"
          class="dataset_blank"
          :index="dataset.index"
          :key="dataset.index"
          @click.native="showDetail(i)"
        >
          <h1>{{ dataset.name }}</h1>
          <label>{{ dataset.description }}</label
          ><br />
          <p class="dataset_target">Target: {{ dataset.target }}</p>
          <p class="dataset_tasks">Task Type: {{ dataset.taskType }}</p>
          <p class="dataset_url">File URL: {{ dataset.fileUrl }}</p>
          <p class="dataset_date">{{ dataset.createdAt }}</p>
        </el-card>
      </template>
    </div>
    <el-button class="add_btn" type="primary" circle @click="uploadPopup = true"
      ><i class="el-icon-plus" style="font-size: 25px"
    /></el-button>
    <!-- upload dialog -->
    <el-dialog
      class="upload_blank"
      title="Upload File"
      :visible.sync="uploadPopup"
      width="40%"
      append-to-body
    >
      <el-button size="small" type="primary" @click="$refs.file.click()">
        <input
          type="file"
          ref="file"
          @change="fileUpload"
          style="display: none"
          accept=".csv"
        />
        Select File
      </el-button>
      <el-button
        style="margin-left: 10px"
        size="small"
        type="success"
        @click="submitUpload"
        >Upload</el-button
      >
      <label> File Name: {{ file.name }}</label>
    </el-dialog>
    <!-- show add popUp -->
    <el-dialog
      title="Create Dataset"
      :visible.sync="addPopup"
      width="60%"
      append-to-body
      @closed="resetForm('addForm')"
    >
      <el-form :model="addForm" :rules="rules" ref="addForm" label-width="auto">
        <el-form-item label="Dataset Name" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
        <el-form-item label="Description" prop="description">
          <el-input
            type="textarea"
            v-model="addForm.description"
            :autosize="{ minRows: 1, maxRows: 4 }"
            placeholder="Please Enter Description"
          ></el-input>
        </el-form-item>
        <el-form-item label="Test" prop="test">
          <el-switch v-model="addForm.test"></el-switch>
        </el-form-item>
        <el-form-item label="Task Type" prop="taskType">
          <el-radio-group v-model="addForm.taskType" required>
            <el-radio label="regression"></el-radio>
            <el-radio label="classification"></el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Target" prop="target">
          <el-input v-model="addForm.target"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm">ADD</el-button>
          <el-button @click="resetForm('addForm')">RESET</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- show dataset detail -->
    <el-dialog
      :visible.sync="detailPopup"
      append-to-body
      width="50%"
      style="min-width: 500px"
      @closed="page = 1"
    >
      <h1>{{ detail.name }}</h1>
      <p class="detail_blank">Description: {{ detail.description }}</p>
      <p class="detail_blank">Tasks: {{ detail.taskType }}</p>
      <p class="detail_blank">Files: {{ detail.fileUrl }}</p>
      <p class="detail_blank">Test: {{ detail.test }}</p>
      <p class="detail_blank">Date: {{ detail.createdAt }}</p>
      <div style="text-align: right">
        <el-tooltip class="item" effect="dark" content="Delete" placement="top">
          <el-popconfirm
            confirm-button-text="YES"
            confirm-button-type="warning"
            cancel-button-text="CANCEL"
            title="Delete this training ?"
            @confirm="deleteDataset(detail.id)"
          >
            <el-button
              slot="reference"
              type="danger"
              icon="el-icon-delete"
              round
              style="margin: 10px"
            ></el-button>
          </el-popconfirm>
        </el-tooltip>
      </div>
      <!-- <el-table
        :data="pageList"
        class="table"
        empty-text="No Data"
        highlight-current-row
      >
        <el-table-column
          v-for="{ prop, label } in detail.target"
          :key="prop"
          :prop="prop"
          :label="label"
        >
        </el-table-column>
      </el-table>
      <el-pagination
        background
        @current-change="handleCurrentChange"
        :page-size="pageSize"
        layout="prev, pager, next"
        :total="total"
        hide-on-single-page
      >
      </el-pagination> -->
    </el-dialog>
  </div>
</template>
<script>
import { file_upload_url } from "@/config/api.js";
import { datasets_url } from "@/config/api.js";
export default {
  data() {
    return {
      uploadPopup: false,
      addPopup: false,
      detailPopup: false,
      page: 1, //初始頁
      pageSize: 100,
      total: 0,
      search: "",
      message: "DATASET",
      show: true,
      activeIndex: "1",
      uploadFiles: [],
      file: "",
      uploadUrl: file_upload_url,
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
          // subs: [
          //   {
          //     index: "2-1",
          //     title: "From Local",
          //     icon: require("@/assets/icon/local.png"),
          //   },
          // ],
        },
      ],
      datasets: [],
      detail: [
        {
        id: 'id',
        name: 'name1',
        description: 'descript1',
        taskType: 'regression'/'classification',
        test: false,
        target: 'columnId',
        fileUrl: 'url',
        featureNum: 6,
        level: 3,
        createdAt: '2021-06-12 09:09:09',
        userId: 'id',
        statistics: {
          featureName: 'name',
            mean: 1.1,
            variance: 2.2
        },
        rowData: []
    }
      ],
      addForm: {
        name: "",
        description: "",
        test: false,
        taskType: "",
        target: "",
        fileUrl: "",
      },
      rules: {
        name: [
          { required: true, message: "Please enter the name", trigger: "blur" },
        ],
        taskType: [
          {
            required: true,
            message: "Please choose a task type",
            trigger: "change",
          },
        ],
        target: [
          {
            required: true,
            message: "Please enter the target columnId",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },
    handleExceed() {
      this.$message.warning(`It can only upload 1 files once`);
    },
    beforeRemove(file) {
      const h = this.$createElement;
      return this.$msgbox({
        message: h("p", { style: "font-size: 20px" }, `Delete ${file.name}？`),
        showCancelButton: true,
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
      });
    },
    fileUpload() {
      let file = this.$refs.file.files[0];
      this.file = file;
    },
    submitUpload() {
      let fileForm = new FormData();
      fileForm.append("file", this.file);
      fetch(file_upload_url, {
        method: "POST",
        body: fileForm,
      })
        .then(async (resp) => {
          const a = await resp.json();
          console.log(a);
          if (a.status == 201) {
            window.localStorage.setItem("url", a.data.url);
            console.log("success");
            this.uploadPopup = false;
            this.addPopup = true;
            this.file = "";
          } else {
            this.isError = true;
          }
        })
        .catch((error) => {
          console.warn("error", error);
        });
    },
    doSomething(index) {
      if (index == 0) {
        this.uploadPopup = true;
      }
    },
    showDetail(i) {
      // let detail = this.detail;
      this.detailPopup = true;
      this.detail = this.datasets[i]
      // this.detail[0].rowData = this.datasets[i].data;
      // this.total = this.detail.rowData.length;
      return this.detail;
    },
    handleCurrentChange(val) {
      this.page = val;
    },
    deleteDataset(id) {
      fetch(datasets_url+`/${id}`, {
        method: "DELETE",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": "Bearer " + window.localStorage.getItem("token"),
        },
      })
        .then(async (resp) => {
          const a = await resp.json();
          console.log(a);
          if (a.status == 200) {
            this.createList();
            console.log("success",datasets_url+`/${id}`);
            this.addPopup = false;
          } else {
            this.isError = true;
          }
        })
        .catch((error) => {
          console.warn("error", error);
        });
      this.detailPopup = false;
    },
    submitForm() {
      let addForm = {
        name: this.addForm.name,
        description: this.addForm.description,
        test: this.addForm.test,
        taskType: this.addForm.taskType,
        target: this.addForm.target,
        fileUrl: window.localStorage.getItem("url"),
      };
      fetch(datasets_url, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": "Bearer " + window.localStorage.getItem("token"),
        },
        body: JSON.stringify(addForm),
      })
        .then(async (resp) => {
          const a = await resp.json();
          console.log(a);
          if (a.status == 201) {
            this.createList();
            window.localStorage.setItem("url", null);
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
    jumpPage(String) {
      this.$router.push({ path: `/${String}` });
    },
    createList(){
      fetch(datasets_url, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + window.localStorage.getItem("token"),
      },
    })
      .then(async (resp) => {
        const a = await resp.json();
        console.log("get", a);
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
  },
  computed: {
    pageList() {
      let arr = null;
      let pageData = this.detail[0].rowData;
      if (pageData) {
        arr = pageData.slice(
          this.pageSize * this.page - this.pageSize,
          this.pageSize * this.page
        );
      }
      return arr;
    },
    // onRoutes() {
    //   return this.$route.path.replace("/", "");
    // },

    filteredList() {
      let result = this.datasets;
      const reset = result.map((o) => ({ ...o })); // var reset = JSON.parse( JSON.stringify(result) );
      if (!this.search) {
        return result;
      }
      const search = this.search.toLowerCase();
      const filter = (dataset) => {
        dataset = dataset.name.toLowerCase().includes(search);
        return dataset;
      };
      return reset.filter(filter);
    },
  },
  created() {
    this.createList();
  },
};
</script>

<!-- Use preprocessors via the lang attribute! e.g. <style lang="scss"> -->



<style scoped>
.main {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0%;
  left: 0%;
  z-index: -200;
  text-align: center;
}

.header {
  position: absolute;
  border: none;
  font: inherit;
  height: 75px;
  width: 100%;
  background-color: #bdd7ee;
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
  overflow: hidden;
  z-index: -1000;
}
.el-menu-sideBar {
  height: 88vh;
  width: 22vw;
  min-width: 350px;
  z-index: 1;
  top: 75px;
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
} */

/* .title {
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

/* .el-menu-sideBar label {
  font-size: 35px;
  margin-top: 20px;
} */

.el-menu-item.item_label {
  font-size: 35px;
  width: 350px;
  margin: 20px 0px 10px 0px;
  text-align: left;
  padding-left: 0px;
  color: #000000;
}

.dataset_view {
  position: absolute;
  width: 65vw;
  height: 88vh;
  left: 30%;
  top: 75px;
  overflow: auto;
  z-index: -100;
  transition: 1s;
}
.dataset_view2 {
  position: absolute;
  width: 85vw;
  height: 88vh;
  left: 10%;
  top: 75px;
  overflow: auto;
  z-index: -100;
  transition: 1s;
}
.dataset_view::-webkit-scrollbar {
  display: none;
}
.dataset_blank {
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
}
.dataset_blank h1 {
  width: 150px;
  height: 30px;
  font-size: 20px;
  font-weight: normal;
  margin: 5px 20px;
  line-height: 40px;
  display: inline-block;
  text-align: inherit;
}
.dataset_blank label {
  width: auto;
  height: auto;
  margin: 5px 20px;
  padding: 0px 10px;
  font-size: 20px;
  color: #5b9bd5;
  left: 100px;
}
.dataset_target {
  width: auto;
  height: 30px;
  font-size: 18px;
  font-weight: normal;
  margin: 5px 20px;
  padding: 0px;
  line-height: 40px;
  display: block;
  position: relative;
  left: 200px;
  color: #7f7f7f;
}
.dataset_tasks {
  width: auto;
  height: 30px;
  font-size: 18px;
  font-weight: normal;
  margin: 5px 20px;
  padding: 0px;
  line-height: 40px;
  display: block;
  position: relative;
  left: 200px;
  color: #7f7f7f;
}
.dataset_url {
  width: auto;
  max-width: 400px;
  overflow-y: scroll;
  height: 30px;
  font-size: 18px;
  font-weight: normal;
  margin: 5px 20px;
  padding: 0px;
  line-height: 40px;
  display: block;
  position: relative;
  left: 200px;
  color: #7f7f7f;
}
.dataset_date {
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
.detail_blank {
  font-size: 20px;
  text-align: left;
  margin: 10px;
  display: block;
}
.add_btn {
  position: absolute;
  background-color: #5b9bd5;
  border: none;
  margin: 0px;
  bottom: 40px;
  right: 40px;
}
.table {
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  text-align: center;
}
/*覆蓋區*/
div >>> .el-submenu__title {
  font-size: 35px;
  margin: 20px 0px 10px 0px;
  text-align: left;
  padding-left: 0px;
}

.el-menu-item {
  font-size: 25px;
  margin: 20px 0px;
  min-width: 300px;
  background-color: #ffffff;
  color: #d0cece;
  text-align: left;
  width: 350px;
}
div >>> .el-upload-list__item-name {
  font-size: 20px;
}
div >>> .el-dialog__title {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
  font-size: 50px;
}
div >>> .sideBar_input input {
  padding-left: 50px;
  border: 2px solid black;
}
.el-dialog__wrapper::-webkit-scrollbar {
  display: none;
}
</style>
