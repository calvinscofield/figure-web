<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock } from '@element-plus/icons-vue'
import axios from 'axios'
import store from '@/store'
import { useMediaQuery } from '@vueuse/core'
import { check as c, isDisabled as v, fieldToJson } from '../util'

const router = useRouter();
const props = defineProps(["id", "isEdit"]);
const metaFields = ref([])
const metaTables = ref([])
const form = reactive({
  metaTable: { id: '' },
  field: '*'
})
const checked = reactive({})
const roles = ref([])
const selectedRoles = ref([])
const xs = useMediaQuery('(max-width: 768px)')
const isAll = ref(true)

const cancel = () => {
  router.back();
}

const change = val => {
  metaFields.value = metaTables.value.find(el => el.id == val).metaField
}

const add = () => {
  form.field = fieldToJson(isAll.value, metaFields.value)
  form.role = selectedRoles.value.map(el => ({ id: el }))
  console.log(form)
  axios.post('/api/permissions', form)
    .then(request => {
      ElMessage.success("新增成功")
      store.commit("addData", { "permission": [request.data.data] })
    })
    .catch(error => ElMessage.error(error.response ? error.response.data.error : error.message))
}

const edit = () => {
  form.field = fieldToJson(isAll.value, metaFields.value)
  form.role = selectedRoles.value.map(el => ({ id: el }))
  const form1 = {}
  for (let key in form) {
    if (checked[key]) form1[key] = form[key]
  }
  axios.patch('/api/permissions/' + props.id, form1)
    .then(request => {
      ElMessage.success('修改成功')
      store.commit('updateData', { "permission": request.data.data })
    })
    .catch(error => {
      ElMessage.error(error.response ? error.response.data.error : error.message)
    })
}

onMounted(() => {
  if (props.isEdit) {
    Promise.all([axios.get('/api/permissions/' + props.id), axios.get('/api/metaTables'), axios.get('/api/roles')])
      .then(response => {
        Object.assign(form, response[0].data.data)
        store.commit('updateData', { "permission": form })
        metaTables.value = response[1].data.data
        if (form.field == "*") {
          isAll.value = true
          metaTables.value.forEach(el => el.metaField.forEach(el => el.r = el.w = false))
        } else {
          isAll.value = false
          metaTables.value.forEach(el => {
            if (el.id == form.metaTable.id) {
              metaFields.value = el.metaField
              el.metaField.forEach(el => {
                const rw = form.field[el.name]
                if (rw) {
                  el.r = (rw & 0b01) == 0b01
                  el.w = (rw & 0b10) == 0b10
                } else {
                  el.r = el.w = false
                }
              })
            } else {
              el.metaField.forEach(el => el.r = el.w = false)
            }
          })
        }
        selectedRoles.value = form.role.map(el => el.id)
        roles.value = response[2].data.data
      })
      .catch(error => {
        ElMessage.error(error.response ? error.response.data.error : error.message)
      })
  } else {
    Promise.all([axios.get('/api/metaTables'), axios.get("/api/roles")])
      .then(response => {
        metaTables.value = response[0].data.data
        metaTables.value.forEach(el => el.metaField.forEach(el => el.r = el.w = false))
        roles.value = response[1].data.data
      })
      .catch(error => ElMessage.error(error.response ? error.response.data.error : error.message))
  }
})
</script>

<template>
  <el-form :model="form" label-width="auto" :label-position="xs ? 'top' : 'left'">
    <el-form-item label="名称">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.name" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('permission:name:w')" content="需要【permission:name:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-input :disabled="v(isEdit, checked.name, 'permission:name:w')" v-model="form.name" />
    </el-form-item>
    <el-form-item label="数据表">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.metaTable" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('permission:metaTable:w')" content="需要【permission:metaTable:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-select :disabled="v(isEdit, checked.metaTable, 'permission:metaTable:w')" v-model="form.metaTable.id"
        @change="change" style="width: 100%;">
        <el-option v-for="item in metaTables" :key="item.id" :label="item.displayName" :value="item.id" />
      </el-select>
    </el-form-item>
    <el-form-item label="字段权限">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.field" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('permission:field:w')" content="需要【permission:field:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-switch :disabled="v(isEdit, checked.field, 'permission:field:w')" v-model="isAll" active-text="全部"
        inactive-text="定制" />
      <el-table v-show="!isAll" :data="metaFields" style="width: 100%">
        <el-table-column prop="displayName" label="字段" />
        <el-table-column prop="r" label="只读">
          <template #default="scope">
            <el-checkbox :disabled="v(isEdit, checked.field, 'permission:field:w')" v-model="scope.row.r" />
          </template>
        </el-table-column>
        <el-table-column prop="w" label="可写">
          <template #default="scope">
            <el-checkbox :disabled="v(isEdit, checked.field, 'permission:field:w')" v-model="scope.row.w" />
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>
    <el-form-item label="角色">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.role" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('permission:role:w')" content="需要【permission:role:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-select :disabled="v(isEdit, checked.role, 'permission:role:w')" v-model="selectedRoles" multiple
        style="width: 100%;">
        <el-option v-for="item in roles" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
    </el-form-item>
    <el-form-item label="备注">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.remark" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('permission:remark:w')" content="需要【permission:remark:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-input :disabled="v(isEdit, checked.remark, 'permission:remark:w')" v-model="form.remark" type="textarea" />
    </el-form-item>
    <el-form-item>
      <el-button v-if="isEdit" type="primary" @click="edit">修改</el-button>
      <el-button v-else type="primary" @click="add">新增</el-button>
      <el-button @click="cancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>
