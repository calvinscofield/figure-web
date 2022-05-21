<script setup>
import { ref, reactive, onMounted, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock } from '@element-plus/icons-vue'
import { useMediaQuery } from '@vueuse/core'
import axios from 'axios'
import store from '@/store'
import { check as c, formatDate, viewUrl } from '@/util'

const router = useRouter()
const data = ref(store.getters.data("user"))
const params = reactive(store.getters.params("user"))
const loading = ref(false)
const lg = useMediaQuery('(min-width: 1200px)')

const get = () => {
  loading.value = true
  params.offset = 0
  params.limit = 10
  axios.get('/api/users', { params: params })
    .then(response => {
      loading.value = false
      data.value = response.data.data
      params.offset = response.data.offset
      params.limit = response.data.limit
      store.commit("setData", { "user": data.value })
      store.commit("setParams", { "user": params })
    })
    .catch(error => {
      loading.value = false
      ElMessage.error(error.response ? error.response.data.error : error.message)
    })
}

const add = () => {
  router.push('/user/add')
}

const edit = row => {
  router.push('/user/edit/' + row.id)
}

const del = row => {
  axios.delete('/api/users/' + row.id)
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
  axios.get('/api/users', { params: params })
    .then(response => {
      loading.value = false
      if (response.data.data.length > 0) {
        params.offset = response.data.offset
        params.limit = response.data.limit
        store.commit('addData', { "user": response.data.data })
      } else {
        ElMessage.success("没有更多数据")
      }
    })
    .catch(error => {
      loading.value = false
      ElMessage.error(error.response ? error.response.data.error : error.message)
    })
}

onBeforeMount(() => {
  console.log("onBeforeMount-User", new Date().getMilliseconds())
})

onMounted(() => {
  console.log("onMounted-User", new Date().getMilliseconds())
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
            <div>头像</div>
            <div>用户名</div>
            <div>密码</div>
            <div>昵称</div>
          </div>
          <div class="cal-table-header">
            <div>邮箱</div>
            <div>手机号</div>
          </div>
          <div class="cal-table-header">
            <div>有效期</div>
            <div>锁定</div>
            <div>凭证有效期</div>
            <div>禁用</div>
          </div>
          <div class="cal-table-header">
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
              <template v-if="c('user:avatar:r')">
                <img class="cal-img" v-if="scope.row.avatar" @click="viewFile(scope.row)"
                  :src="viewUrl(scope.row.avatar.id, 100)" :alt="scope.row.name" height="60" />
              </template>
              <el-tooltip v-else content="需要【user:avatar:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
            <div>
              <span v-if="c('user:username:r')">{{ scope.row.username }}</span>
              <el-tooltip v-else content="需要【user:username:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
            <div>
              <span v-if="c('user:password:r')">{{ scope.row.password }}</span>
              <el-tooltip v-else content="需要【user:password:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
            <div>
              <span v-if="c('user:name:r')">{{ scope.row.name }}</span>
              <el-tooltip v-else content="需要【user:name:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
          </div>
          <div class="cal-table-header">
            <div>
              <span v-if="c('user:email:r')">{{ scope.row.email }}</span>
              <el-tooltip v-else content="需要【user:email:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
            <div>
              <span v-if="c('user:phone:r')">{{ scope.row.phone }}</span>
              <el-tooltip v-else content="需要【user:phone:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
          </div>
          <div class="cal-table-header">
            <div>
              <span v-if="c('user:expiryTime:r')">{{ formatDate(scope.row.expiryTime) }}</span>
              <el-tooltip v-else content="需要【user:expiryTime:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
            <div>
              <span v-if="c('user:locked:r')">{{ scope.row.locked ? "是" : "否" }}</span>
              <el-tooltip v-else content="需要【user:locked:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
            <div>
              <span v-if="c('user:credentialsExpiryTime:r')">{{ formatDate(scope.row.credentialsExpiryTime) }}</span>
              <el-tooltip v-else content="需要【user:credentialsExpiryTime:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
            <div>
              <span v-if="c('user:disabled:r')">{{ scope.row.disabled ? "是" : "否" }}</span>
              <el-tooltip v-else content="需要【user:disabled:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
          </div>
          <div class="cal-table-header">
            <div>
              <span v-if="c('user:role:r')">
                <el-tag v-for="item in scope.row.role">{{ item.name }}</el-tag>
              </span>
              <el-tooltip v-else content="需要【user:role:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
          </div>
          <div class="cal-table-header">
            <div>
              <span v-if="c('user:remark:r')">{{ scope.row.remark }}</span>
              <el-tooltip v-else content="需要【user:remark:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
            <div>
              <span v-if="c('user:createTime:r')">{{ formatDate(scope.row.createTime) }}</span>
              <el-tooltip v-else content="需要【user:createTime:r】权限">
                <el-icon>
                  <lock />
                </el-icon>
              </el-tooltip>
            </div>
          </div>
          <div class="cal-table-header">
            <div>
              <span v-if="c('user:updateTime:r')">{{ formatDate(scope.row.updateTime) }}</span>
              <el-tooltip v-else content="需要【user:updateTime:r】权限">
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
      <el-table-column prop="avatar" label="头像">
        <template #default="scope">
          <template v-if="c('user:avatar:r')">
            <img class="cal-img" v-if="scope.row.avatar" @click="viewFile(scope.row)"
              :src="viewUrl(scope.row.avatar.id, 100)" :alt="scope.row.name" height="60" />
          </template>
          <el-tooltip v-else content="需要【user:avatar:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="username" label="用户名">
        <template #default="scope">
          <span v-if="c('user:username:r')">{{ scope.row.username }}</span>
          <el-tooltip v-else content="需要【user:username:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="password" label="密码">
        <template #default="scope">
          <span v-if="c('user:password:r')">{{ scope.row.password }}</span>
          <el-tooltip v-else content="需要【user:password:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="昵称">
        <template #default="scope">
          <span v-if="c('user:name:r')">{{ scope.row.name }}</span>
          <el-tooltip v-else content="需要【user:name:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="email" label="邮箱">
        <template #default="scope">
          <span v-if="c('user:email:r')">{{ scope.row.email }}</span>
          <el-tooltip v-else content="需要【user:email:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号">
        <template #default="scope">
          <span v-if="c('user:phone:r')">{{ scope.row.phone }}</span>
          <el-tooltip v-else content="需要【user:phone:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="expiryTime" label="有效期">
        <template #default="scope">
          <span v-if="c('user:expiryTime:r')">{{ formatDate(scope.row.expiryTime) }}</span>
          <el-tooltip v-else content="需要【user:expiryTime:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="locked" label="锁定" width="60">
        <template #default="scope">
          <span v-if="c('user:locked:r')">{{ scope.row.locked ? "是" : "否" }}</span>
          <el-tooltip v-else content="需要【user:locked:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="credentialsExpiryTime" label="凭证有效期">
        <template #default="scope">
          <span v-if="c('user:credentialsExpiryTime:r')">{{ formatDate(scope.row.credentialsExpiryTime) }}</span>
          <el-tooltip v-else content="需要【user:credentialsExpiryTime:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="disabled" label="禁用" width="60">
        <template #default="scope">
          <span v-if="c('user:disabled:r')">{{ scope.row.disabled ? "是" : "否" }}</span>
          <el-tooltip v-else content="需要【user:disabled:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="role" label="角色">
        <template #default="scope">
          <span v-if="c('user:role:r')">
            <el-tag v-for="item in scope.row.role">{{ item.name }}</el-tag>
          </span>
          <el-tooltip v-else content="需要【user:role:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注">
        <template #default="scope">
          <span v-if="c('user:remark:r')">{{ scope.row.remark }}</span>
          <el-tooltip v-else content="需要【user:remark:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间">
        <template #default="scope">
          <span v-if="c('user:createTime:r')">{{ formatDate(scope.row.createTime) }}</span>
          <el-tooltip v-else content="需要【user:createTime:r】权限">
            <el-icon>
              <lock />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="更新时间">
        <template #default="scope">
          <span v-if="c('user:updateTime:r')">{{ formatDate(scope.row.updateTime) }}</span>
          <el-tooltip v-else content="需要【user:updateTime:r】权限">
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
