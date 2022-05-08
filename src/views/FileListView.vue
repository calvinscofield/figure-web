<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock } from '@element-plus/icons-vue'
import { useMediaQuery } from '@vueuse/core'
import axios from 'axios'
import store from '@/store'
import { check as c, formatDate } from '@/util'

const router = useRouter();
const data = ref(store.getters.data("file"))
const params = reactive(store.getters.params("file"))
const loading = ref(false)
const xs = useMediaQuery('(max-width: 768px)')
const lg = useMediaQuery('(min-width: 1200px)')

const get = () => {
  loading.value = true
  params.offset = 0
  params.limit = 10
  axios.get('/api/files', { params: params })
    .then(response => {
      loading.value = false
      data.value = response.data.data
      params.offset = response.data.offset
      params.limit = response.data.limit
      store.commit("setData", { "file": data.value })
      store.commit("setParams", { "file": params })
    })
    .catch(error => {
      loading.value = false
      ElMessage.error(error.response ? error.response.data.error : error.message)
    })
}

const add = () => {
  router.push('/file/add')
}

const edit = row => {
  router.push('/file/edit/' + row.id)
}

const del = row => {
  axios.delete('/api/files/' + row.id)
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
  axios.get('/api/files', { params: params })
    .then(response => {
      loading.value = false
      if (response.data.data.length > 0) {
        params.offset = response.data.offset
        params.limit = response.data.limit
        store.commit('addData', { "file": response.data.data })
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
</script>

<template>
  <el-button type="primary" @click="add">新增</el-button>
  <el-input v-model="params.keyword" placeholder="关键字" clearable @change="get" />
  <el-table :data="data">
    <template v-if="!lg">
      <el-table-column>
        <template #header="scope">
          <div class="cal-table-header">
            <div>网址</div>
            <div>名称</div>
          </div>
          <div class="cal-table-header">
            <div>文件名称</div>
            <div>类型</div>
            <div>大小</div>
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
              <span v-if="c('file:url:r')">{{ scope.row.url }}</span>
              <el-tooltip v-else content="需要【file:url:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
            <div>
              <span v-if="c('file:name:r')">{{ scope.row.name }}</span>
              <el-tooltip v-else content="需要【file:name:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
          </div>
          <div class="cal-table-header">
            <div>
              <span v-if="c('file:filename:r')">{{ scope.row.filename }}</span>
              <el-tooltip v-else content="需要【file:filename:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
            <div>
              <span v-if="c('file:contentType:r')">{{ scope.row.contentType }}</span>
              <el-tooltip v-else content="需要【file:contentType:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
            <div>
              <span v-if="c('file:size:r')">{{ scope.row.size }}</span>
              <el-tooltip v-else content="需要【file:size:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
          </div>
          <div class="cal-table-header">
            <div>
              <span v-if="c('file:remark:r')">{{ scope.row.remark }}</span>
              <el-tooltip v-else content="需要【file:remark:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
          </div>
          <div class="cal-table-header">
            <div>
              <span v-if="c('file:createTime:r')">{{ formatDate(scope.row.createTime) }}</span>
              <el-tooltip v-else content="需要【file:createTime:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
          </div>
          <div class="cal-table-header">
            <div>
              <span v-if="c('file:updateTime:r')">{{ formatDate(scope.row.updateTime) }}</span>
              <el-tooltip v-else content="需要【file:updateTime:r】权限">
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
      <el-table-column prop="url" label="网址">
        <template #default="scope">
          <span v-if="c('file:url:r')">{{ scope.row.url }}</span>
          <el-tooltip v-else content="需要【file:url:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称">
        <template #default="scope">
          <span v-if="c('file:name:r')">{{ scope.row.name }}</span>
          <el-tooltip v-else content="需要【file:name:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="filename" label="文件名称">
        <template #default="scope">
          <span v-if="c('file:filename:r')">{{ scope.row.filename }}</span>
          <el-tooltip v-else content="需要【file:filename:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="contentType" label="类型">
        <template #default="scope">
          <span v-if="c('file:contentType:r')">{{ scope.row.contentType }}</span>
          <el-tooltip v-else content="需要【file:contentType:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="size" label="大小">
        <template #default="scope">
          <span v-if="c('file:size:r')">{{ scope.row.size }}</span>
          <el-tooltip v-else content="需要【file:size:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注">
        <template #default="scope">
          <span v-if="c('file:remark:r')">{{ scope.row.remark }}</span>
          <el-tooltip v-else content="需要【file:remark:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间">
        <template #default="scope">
          <span v-if="c('file:createTime:r')">{{ formatDate(scope.row.createTime) }}</span>
          <el-tooltip v-else content="需要【file:createTime:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="更新时间">
        <template #default="scope">
          <span v-if="c('file:updateTime:r')">{{ formatDate(scope.row.updateTime) }}</span>
          <el-tooltip v-else content="需要【file:updateTime:r】权限">
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
      <el-button class="cal-load-btn" :disabled="loading" :loading="loading" type="text" @click="load">加载更多
      </el-button>
    </template>
  </el-table>
</template>
