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
const lg = useMediaQuery('(min-width: 1200px)')

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
  <el-table :data="data">
    <template v-if="!lg">
      <el-table-column>
        <template #header="scope">
          <div class="cal-table-header">
            <div>肖像</div>
            <div>名字</div>
          </div>
          <div class="cal-table-header">
            <div>全名</div>
          </div>
          <div class="cal-table-header">
            <div>生辰</div>
            <div>忌辰</div>
          </div>
          <div class="cal-table-header">
            <div>备注</div>
            <div>创建时间</div>
          </div>
          <div class="cal-table-header">
            <div>更新时间</div>
            <div>操作</div>
          </div>
        </template>
        <template #default="scope">
          <div class="cal-table-header">
            <div>
              <template v-if="c('figure:portrait:r')">
                <img class="cal-img" v-if="scope.row.portrait" @click="viewFile(scope.row)"
                  :src="src(scope.row.portrait.id)" :alt="scope.row.name" height="60" />
              </template>
              <el-tooltip v-else content="需要【figure:portrait:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
            <div>
              <span v-if="c('figure:name:r')">{{ scope.row.name }}</span>
              <el-tooltip v-else content="需要【figure:name:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
          </div>
          <div class="cal-table-header">
            <div>
              <span v-if="c('figure:fullname:r')">{{ scope.row.fullname }}</span>
              <el-tooltip v-else content="需要【figure:fullname:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
          </div>
          <div class="cal-table-header">
            <div>
              <span v-if="c('figure:birthday:r')">{{ solarText(scope.row.birthday) }}</span>
              <el-tooltip v-else content="需要【figure:birthday:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
            <div>
              <span v-if="c('figure:deathday:r')">{{ solarText(scope.row.deathday) }}</span>
              <el-tooltip v-else content="需要【figure:deathday:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
          </div>
          <div class="cal-table-header">
            <div>
              <span v-if="c('figure:remark:r')">{{ scope.row.remark }}</span>
              <el-tooltip v-else content="需要【figure:remark:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
            <div>
              <span v-if="c('figure:createTime:r')">{{ formatDate(scope.row.createTime) }}</span>
              <el-tooltip v-else content="需要【figure:createTime:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
          </div>
          <div class="cal-table-header">
            <div>
              <span v-if="c('figure:updateTime:r')">{{ formatDate(scope.row.updateTime) }}</span>
              <el-tooltip v-else content="需要【figure:updateTime:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
            <div>
              <el-button size="small" type="primary" @click="edit(scope.row)">编辑</el-button>
              <el-popconfirm confirm-button-text="没错" cancel-button-text="斟酌一下" title="确定要删除？"
                @confirm="del(scope.row)">
                <template #reference>
                  <el-button size="small" type="danger">删除</el-button>
                </template>
              </el-popconfirm>
            </div>
          </div>
        </template>
      </el-table-column>
    </template>
    <template v-else>
      <el-table-column prop="portrait" label="肖像">
        <template #default="scope">
          <template v-if="c('figure:portrait:r')">
            <img class="cal-img" v-if="scope.row.portrait" @click="viewFile(scope.row)"
              :src="src(scope.row.portrait.id)" :alt="scope.row.name" height="60" />
          </template>
          <el-tooltip v-else content="需要【figure:portrait:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名字">
        <template #default="scope">
          <span v-if="c('figure:name:r')">{{ scope.row.name }}</span>
          <el-tooltip v-else content="需要【figure:name:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="fullname" label="全名">
        <template #default="scope">
          <span v-if="c('figure:fullname:r')">{{ scope.row.fullname }}</span>
          <el-tooltip v-else content="需要【figure:fullname:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="birthday" label="生辰">
        <template #default="scope">
          <span v-if="c('figure:birthday:r')">{{ solarText(scope.row.birthday) }}</span>
          <el-tooltip v-else content="需要【figure:birthday:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="deathday" label="忌辰">
        <template #default="scope">
          <span v-if="c('figure:deathday:r')">{{ solarText(scope.row.deathday) }}</span>
          <el-tooltip v-else content="需要【figure:deathday:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注">
        <template #default="scope">
          <span v-if="c('figure:remark:r')">{{ scope.row.remark }}</span>
          <el-tooltip v-else content="需要【figure:remark:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间">
        <template #default="scope">
          <span v-if="c('figure:createTime:r')">{{ formatDate(scope.row.createTime) }}</span>
          <el-tooltip v-else content="需要【figure:createTime:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="更新时间">
        <template #default="scope">
          <span v-if="c('figure:updateTime:r')">{{ formatDate(scope.row.updateTime) }}</span>
          <el-tooltip v-else content="需要【figure:updateTime:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" type="primary" @click="edit(scope.row)">编辑</el-button>
          <el-popconfirm confirm-button-text="没错" cancel-button-text="斟酌一下" title="确定要删除？" @confirm="del(scope.row)">
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </template>

    <template #append>
      <el-button class="cal-load-btn" :disabled="loading" :loading="loading" type="primary" text @click="load">加载更多
      </el-button>
    </template>
  </el-table>
</template>
