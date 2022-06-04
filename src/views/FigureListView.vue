<script setup>
import { ref, reactive, onMounted, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock } from '@element-plus/icons-vue'
import { useMediaQuery } from '@vueuse/core'
import axios from 'axios'
import store from '@/store'
import { check as c, formatDate, solarText, solarDate, viewUrl } from '@/util'

const router = useRouter()
const data = ref(store.getters.data("figure"))
const params = reactive(store.getters.params("figure"))
const loading = ref(false)
const selection = reactive([])

const get = () => {
  loading.value = true
  params.offset = 0
  params.limit = 10
  axios.get('/api/figures', { params: params })
    .then(response => {
      loading.value = false
      data.value = response.data.data
      params.offset = response.data.offset
      params.limit = response.data.limit
      store.commit("setData", { "figure": data.value })
      store.commit("setParams", { "figure": params })
    })
    .catch(error => {
      loading.value = false
      ElMessage.error(error.response ? error.response.data.error : error.message)
    })
}

const add = () => {
  router.push('/figure/add')
}

const show = () => {
  router.push('/figure/show')
}

const edit = row => {
  router.push('/figure/edit/' + row.id)
}

const del = row => {
  axios.delete('/api/figures/' + row.id)
    .then(() => {
      ElMessage.success("删除成功")
      const el1 = data.value.findIndex(el => el.id == row.id)
      if (el1 > -1) data.value.splice(el1, 1)
    })
    .catch(error => {
      ElMessage.error(error.response ? error.response.data.error : error.message)
    })
}

const load = () => {
  loading.value = true
  axios.get('/api/figures', { params: params })
    .then(response => {
      loading.value = false
      if (response.data.data.length > 0) {
        params.offset = response.data.offset
        params.limit = response.data.limit
        store.commit('addData', { "figure": response.data.data })
      } else {
        ElMessage.success("没有更多数据")
      }
    })
    .catch(error => {
      loading.value = false
      ElMessage.error(error.response ? error.response.data.error : error.message)
    })
}

onMounted(() => {
  if (data.value.length == 0) get();
})

function src(id) {
  return viewUrl(id, "figure", "portrait", 100)
}

</script>

<template>
  <el-button type="primary" @click="add">新增</el-button>
  <el-button @click="show">展示</el-button>
  <el-input v-model="params.keyword" placeholder="关键字" clearable @change="get" />
  <div class="cal-table-figure-list">
    <div class="cal-col1">
      <div prop="portrait">肖像</div>
      <div class="cal-col11">
        <div prop="name">名字</div>
        <div prop="birthday">生辰 - 忌辰</div>
        <div prop="fullname">全名</div>
      </div>
    </div>
    <div class="cal-col2">
      <div class="cal-col11">
        <div prop="remark">备注</div>
        <div prop="createTime">创建时间</div>
        <div prop="updateTime">更新时间</div>
        <div prop="action">操作 </div>
      </div>
      <div prop="select">
        <el-checkbox />
      </div>
    </div>
  </div>

  <div v-for="v in data" class="cal-table-figure-list">
    <div class="cal-divider"></div>
    <div class="cal-col1">
      <div prop="portrait">
        <template v-if="c('figure:portrait:r')">
          <img class="cal-img" v-if="v.portrait" :src="src(v.portrait.id)" :alt="v.name" width="80" height="80" />
        </template>
        <el-tooltip v-else content="需要【figure:portrait:r】权限">
          <el-icon>
            <lock />
          </el-icon>
        </el-tooltip>
      </div>
      <div class="cal-col11">
        <div prop="name">
          <span v-if="c('figure:name:r')">{{ v.name }}</span>
          <el-tooltip v-else content="需要【figure:name:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </div>
        <div prop="birthday">
          <span v-if="c('figure:birthday:r')">{{ solarText(v.birthday) }}</span>
          <el-tooltip v-else content="需要【figure:birthday:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
          -
          <span v-if="c('figure:deathday:r')">{{ solarText(v.deathday) }}</span>
          <el-tooltip v-else content="需要【figure:deathday:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </div>
        <div prop="fullname">
          <span v-if="c('figure:fullname:r')">{{ v.fullname }}</span>
          <el-tooltip v-else content="需要【figure:fullname:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </div>
      </div>
    </div>
    <div class="cal-col2">
      <div class="cal-col11">
        <div prop="remark">
          <span v-if="c('figure:remark:r')">{{ v.remark }}</span>
          <el-tooltip v-else content="需要【figure:remark:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </div>
        <div prop="createTime">
          <span v-if="c('figure:createTime:r')">{{ formatDate(v.createTime) }}</span>
          <el-tooltip v-else content="需要【figure:createTime:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </div>
        <div prop="updateTime">
          <span v-if="c('figure:updateTime:r')">{{ formatDate(v.updateTime) }}</span>
          <el-tooltip v-else content="需要【figure:updateTime:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </div>
        <div prop="action">
          <el-button size="small" type="primary" @click="edit(v)">编辑</el-button>
          <el-popconfirm confirm-button-text="没错" cancel-button-text="斟酌一下" title="确定要删除？" @confirm="del(v)">
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </div>
      </div>
      <div prop="select">
        <el-checkbox />
      </div>
    </div>
  </div>
  <el-button class="cal-load-btn" :disabled="loading" :loading="loading" type="primary" text @click="load">加载更多
  </el-button>
</template>

<style>
.cal-table-figure-list {
  display: flex;
  flex-wrap: wrap;
}

.cal-col11 {
  flex-grow: 1;
  display: flex;
  flex-wrap: wrap;
}

.cal-table-select {
  align-items: center;
}

.cal-table-data {
  display: flex;
}

.cal-table-figure-list div[prop="portrait"] {
  flex-basis: 80px;
  flex-shrink: 0;
  margin-right: .5rem;
}

.cal-table-figure-list div[prop="name"] {
  flex-grow: 1;
  flex-basis: 100px;
}

.cal-table-figure-list div[prop="birthday"] {
  flex-grow: 1;
  flex-basis: 200px;
}

.cal-table-figure-list div[prop="fullname"] {
  flex-basis: 100%;
}

.cal-table-figure-list div[prop="remark"] {
  flex-basis: 100%;
}

.cal-table-figure-list div[prop="createTime"] {
  flex-basis: 130px;
  flex-grow: 1;
}

.cal-table-figure-list div[prop="updateTime"] {
  flex-basis: 130px;
  flex-grow: 1;
}

.cal-table-figure-list div[prop="action"] {
  flex-basis: 110px;
  flex-grow: 1;
}

.cal-table-figure-list div[prop="select"] {
  align-self: center;
}

.cal-table-figure-list .cal-col1 {
  display: flex;
}

.cal-table-figure-list .cal-col2 {
  display: flex;
}

@media screen and (max-width: 528px) {

  .cal-table-figure-list .cal-col1 {
    flex-basis: 100%;
  }

  .cal-table-figure-list .cal-col2 {
    flex-basis: 100%;
  }
}

@media screen and (min-width: 528px) {
  .cal-table-figure-list .cal-col1 {
    flex-basis: 50%;
  }

  .cal-table-figure-list .cal-col2 {
    flex-basis: 50%;
  }
}
</style>
