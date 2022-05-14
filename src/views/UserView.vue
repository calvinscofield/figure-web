<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock } from '@element-plus/icons-vue'
import axios from 'axios'
import store from '@/store'
import { useMediaQuery } from '@vueuse/core'
import { check as c, isDisabled as v } from '../util'

const router = useRouter();
const props = defineProps(["id", "isEdit"]);
const form = reactive({})
const checked = reactive({})
const roles = ref([])
const selectedRoles = ref([])
const xxs = useMediaQuery('(max-width: 528px)')

const cancel = () => {
  router.back();
}

const add = () => {
  form.role = selectedRoles.value.map(el => ({ id: el }))
  axios.post('/api/users', form)
    .then(request => {
      ElMessage.success("新增成功")
      store.commit("addData", { "user": [request.data.data] })
    })
    .catch(error => ElMessage.error(error.response ? error.response.data.error : error.message))
}

const edit = () => {
  form.role = selectedRoles.value.map(el => { return { id: el } })
  const form1 = {}
  for (let key in form) {
    if (checked[key]) form1[key] = form[key]
  }
  axios.patch('/api/users/' + props.id, form1)
    .then(request => {
      ElMessage.success('修改成功')
      store.commit('updateData', { "user": request.data.data })
    })
    .catch(error => {
      ElMessage.error(error.response ? error.response.data.error : error.message)
    })
}

onMounted(() => {
  if (props.isEdit) {
    Promise.all([axios.get('/api/users/' + props.id), axios.get('/api/roles')])
      .then(response => {
        Object.assign(form, response[0].data.data)
        store.commit('updateData', { "user": form })
        selectedRoles.value = form.role.map(el => el.id)
        roles.value = response[1].data.data
      })
      .catch(error => {
        ElMessage.error(error.response ? error.response.data.error : error.message)
      })
  } else {
    axios.get('/api/roles')
      .then(response => {
        roles.value = response.data.data
      })
      .catch(error => ElMessage.error(error.response ? error.response.data.error : error.message))
  }
})
</script>

<template>
  <el-form :model="form" label-width="auto" :label-position="xxs ? 'top' : 'left'">
    <el-form-item label="用户名">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.username" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('user:username:w')" content="需要【user:username:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-input :disabled="v(isEdit, checked.username, 'user:username:w')" v-model="form.username" />
    </el-form-item>
    <el-form-item label="密码">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.password" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('user:password:w')" content="需要【user:password:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-input :disabled="v(isEdit, checked.password, 'user:password:w')" type="password" show-password
        v-model="form.password" />
    </el-form-item>
    <el-form-item label="昵称">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.name" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('user:name:w')" content="需要【user:name:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-input :disabled="v(isEdit, checked.name, 'user:name:w')" v-model="form.name" />
    </el-form-item>
    <el-form-item label="邮箱">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.email" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('user:email:w')" content="需要【user:email:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-input :disabled="v(isEdit, checked.email, 'user:email:w')" v-model="form.email" />
    </el-form-item>
    <el-form-item label="手机号">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.phone" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('user:phone:w')" content="需要【user:phone:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-input :disabled="v(isEdit, checked.phone, 'user:phone:w')" v-model="form.phone" />
    </el-form-item>
    <el-form-item label="有效期">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.expiryTime" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('user:expiryTime:w')" content="需要【user:expiryTime:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-date-picker :disabled="v(isEdit, checked.expiryTime, 'user:expiryTime:w')" v-model="form.expiryTime"
        type="datetime" style="width: 100%;" />
    </el-form-item>
    <el-form-item label="锁定">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.locked" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('user:locked:w')" content="需要【user:locked:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-switch :disabled="v(isEdit, checked.locked, 'user:locked:w')" v-model="form.locked" />
    </el-form-item>
    <el-form-item label="凭证有效期">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.credentialsExpiryTime" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('user:credentialsExpiryTime:w')" content="需要【user:credentialsExpiryTime:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-date-picker :disabled="v(isEdit, checked.credentialsExpiryTime, 'user:credentialsExpiryTime:w')"
        v-model="form.credentialsExpiryTime" type="datetime" style="width: 100%;" />
    </el-form-item>
    <el-form-item label="禁用">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.disabled" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('user:disabled:w')" content="需要【user:disabled:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-switch :disabled="v(isEdit, checked.disabled, 'user:disabled:w')" v-model="form.disabled" />
    </el-form-item>
    <el-form-item label="角色">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.role" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('user:role:w')" content="需要【user:role:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-select :disabled="v(isEdit, checked.role, 'user:role:w')" v-model="selectedRoles" multiple
        style="width: 100%;">
        <el-option v-for="item in roles" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
    </el-form-item>
    <el-form-item label="备注">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.remark" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('user:remark:w')" content="需要【user:remark:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-input :disabled="v(isEdit, checked.remark, 'user:remark:w')" v-model="form.remark" type="textarea" />
    </el-form-item>
    <el-form-item>
      <el-button v-if="isEdit" type="primary" @click="edit">修改</el-button>
      <el-button v-else type="primary" @click="add">新增</el-button>
      <el-button @click="cancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>
