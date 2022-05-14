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
const permissions = ref([])
const selectedPermissions = ref([])
const xxs = useMediaQuery('(max-width: 528px)')

const cancel = () => {
  router.back();
}

const add = () => {
  form.permission = selectedPermissions.value.map(el => ({ id: el }))
  axios.post('/api/roles', form)
    .then(request => {
      ElMessage.success("新增成功")
      store.commit("addData", { "role": [request.data.data] })
    })
    .catch(error => ElMessage.error(error.response ? error.response.data.error : error.message))
}

const edit = () => {
  form.permission = selectedPermissions.value.map(el => ({ id: el }))
  const form1 = {}
  for (let key in form) {
    if (checked[key]) form1[key] = form[key]
  }
  axios.patch('/api/roles/' + props.id, form1)
    .then(request => {
      ElMessage.success('修改成功')
      store.commit('updateData', { "role": request.data.data })
    })
    .catch(error => {
      ElMessage.error(error.response ? error.response.data.error : error.message)
    })
}

onMounted(() => {
  if (props.isEdit) {
    Promise.all([axios.get('/api/roles/' + props.id), axios.get('/api/permissions')])
      .then(response => {
        Object.assign(form, response[0].data.data)
        store.commit('updateData', { "role": form })
        selectedPermissions.value = form.permission.map(el => el.id)
        permissions.value = response[1].data.data
      })
      .catch(error => {
        ElMessage.error(error.response ? error.response.data.error : error.message)
      })
  } else {
    axios.get('/api/permissions')
      .then(response => {
        permissions.value = response.data.data
      })
      .catch(error => ElMessage.error(error.response ? error.response.data.error : error.message))
  }
})
</script>

<template>
  <el-form :model="form" label-width="auto" :label-position="xxs ? 'top' : 'left'">
    <el-form-item label="名称">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.name" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('role:name:w')" content="需要【role:name:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-input :disabled="v(isEdit, checked.name, 'role:name:w')" v-model="form.name" />
    </el-form-item>
    <el-form-item label="权限">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.permission" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('role:permission:w')" content="需要【role:permission:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-select :disabled="v(isEdit, checked.permission, 'role:permission:w')" v-model="selectedPermissions" multiple
        style="width: 100%;">
        <el-option v-for="item in permissions" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
    </el-form-item>
    <el-form-item label="备注">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.remark" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('role:remark:w')" content="需要【role:remark:w】权限">
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
