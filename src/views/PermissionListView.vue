<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock } from '@element-plus/icons-vue'
import { useMediaQuery } from '@vueuse/core'
import axios from 'axios'
import store from '@/store'
import { check as c, formatDate } from '@/util'

const router = useRouter()
const data = ref(store.getters.data("permission"))
const params = reactive(store.getters.params("permission"))
const loading = ref(false)
const lg = useMediaQuery('(min-width: 1200px)')

const get = () => {
  loading.value = true
  params.offset = 0
  params.limit = 10
  axios.get('/api/permissions', { params: params })
    .then(response => {
      loading.value = false
      data.value = response.data.data
      params.offset = response.data.offset
      params.limit = response.data.limit
      store.commit("setData", { "permission": data.value })
      store.commit("setParams", { "permission": params })
    })
    .catch(error => {
      loading.value = false
      ElMessage.error(error.response ? error.response.data.error : error.message)
    })
}

const add = () => {
  router.push('/permission/add')
}

const edit = row => {
  router.push('/permission/edit/' + row.id)
}

const del = row => {
  axios.delete('/api/permissions/' + row.id)
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
  axios.get('/api/permissions', { params: params })
    .then(response => {
      loading.value = false
      if (response.data.data.length > 0) {
        params.offset = response.data.offset
        params.limit = response.data.limit
        store.commit('addData', { "permission": response.data.data })
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

const parseField = (field, metaFields) => {
  if (field == "*") {
    return "全部"
  } else {
    let strs = []
    for (let key in field) {
      const found = metaFields.find(el => el.name == key)
      if (found) {
        let rw = field[key]
        let r = (0b01 & rw) == 0b01
        let w = (0b10 & rw) == 0b10
        if (r || w) {
          let str = found.displayName + "："
          if (r) str += "读"
          if (w) str += "写"
          strs.push(str)
        }
      }
    }
    return strs.join('，')
  }
}
</script>

<template>
  <el-button type="primary" @click="add">新增</el-button>
  <el-input v-model="params.keyword" placeholder="关键字" clearable @change="get" />
  <el-table :data="data">
    <template v-if="!lg">
      <el-table-column>
        <template #header="scope">
          <div class="cal-table-header">
            <div>名称</div>
            <div>数据表</div>
          </div>
          <div class="cal-table-header">
            <div>字段权限</div>
            <div>角色</div>
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
              <span v-if="c('permission:name:r')">{{ scope.row.name }}</span>
              <el-tooltip v-else content="需要【permission:name:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
            <div>
              <span v-if="c('permission:metaTable:r')">{{ scope.row.metaTable.displayName }}</span>
              <el-tooltip v-else content="需要【permission:metaTable:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
          </div>
          <div class="cal-table-header">
            <div>
              <span v-if="c('permission:field:r')">
                {{ parseField(scope.row.field, scope.row.metaTable.metaField) }}
              </span>
              <el-tooltip v-else content="需要【permission:field:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
            <div>
              <span v-if="c('permission:role:r')">{{ scope.row.role.map(el => el.name).join("，") }}</span>
              <el-tooltip v-else content="需要【permission:role:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
          </div>
          <div class="cal-table-header">
            <div>
              <span v-if="c('permission:remark:r')">{{ scope.row.remark }}</span>
              <el-tooltip v-else content="需要【permission:remark:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
            <div>
              <span v-if="c('permission:createTime:r')">{{ formatDate(scope.row.createTime) }}</span>
              <el-tooltip v-else content="需要【permission:createTime:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
          </div>
          <div class="cal-table-header">
            <div>
              <span v-if="c('permission:updateTime:r')">{{ formatDate(scope.row.updateTime) }}</span>
              <el-tooltip v-else content="需要【permission:updateTime:r】权限">
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
      <el-table-column prop="name" label="名称">
        <template #default="scope">
          <span v-if="c('permission:name:r')">{{ scope.row.name }}</span>
          <el-tooltip v-else content="需要【permission:name:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="metaTable" label="数据表">
        <template #default="scope">
          <span v-if="c('permission:metaTable:r')">{{ scope.row.metaTable.displayName }}</span>
          <el-tooltip v-else content="需要【permission:metaTable:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="field" label="字段权限">
        <template #default="scope">
          <span v-if="c('permission:field:r')">
            {{ parseField(scope.row.field, scope.row.metaTable.metaField) }}
          </span>
          <el-tooltip v-else content="需要【permission:field:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="role" label="角色">
        <template #default="scope">
          <span v-if="c('permission:role:r')">{{ scope.row.role.map(el => el.name).join("，") }}</span>
          <el-tooltip v-else content="需要【permission:role:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注">
        <template #default="scope">
          <span v-if="c('permission:remark:r')">{{ scope.row.remark }}</span>
          <el-tooltip v-else content="需要【permission:remark:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间">
        <template #default="scope">
          <span v-if="c('permission:createTime:r')">{{ formatDate(scope.row.createTime) }}</span>
          <el-tooltip v-else content="需要【permission:createTime:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="更新时间">
        <template #default="scope">
          <span v-if="c('permission:updateTime:r')">{{ formatDate(scope.row.updateTime) }}</span>
          <el-tooltip v-else content="需要【permission:updateTime:r】权限">
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
