<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock } from '@element-plus/icons-vue'
import axios from 'axios'
import store from '@/store'
import { useMediaQuery } from '@vueuse/core'
import { check as c, isDisabled as v } from '../util'
import { computed } from '@vue/reactivity'
import _ from 'lodash'

const router = useRouter();
const props = defineProps(["id", "isEdit"]);
const formRef = ref()
const form = reactive({})
const nameValidator = (rule, value, callback) => {
  if (!value || value.length == 0) return callback()
  const params = { name: value }
  if (props.isEdit) params.excludeId = props.id
  axios.get("/api/files/exist", { params }).then(response => {
    if (response.data.data) callback(new Error("名称已存在"))
    else callback()
  }).catch(error => callback(new Error(error.response ? error.response.data.error : error.message)))
}
const checked = reactive({})
const rules = computed(() => {
  for (let key in checked) {
    if (!checked[key]) formRef.value.clearValidate(key)
  }
  return {
    name: checked.name || !props.isEdit ? [
      { validator: _.debounce(nameValidator, 500, { 'leading': true }) }
    ] : [],
    filename: checked.name || !props.isEdit ? [
      { required: true, message: '请选择文件' }
    ] : []
  }
})
const xxs = useMediaQuery('(max-width: 528px)')
const files = reactive([])
const loading = ref(false)

const cancel = () => {
  router.back();
}

function changeFile(file) {
  files.splice(0)
  files.push(file)
  form.filename = file
  if (!formRef.value) return
  formRef.value.validateField("filename")
}

function removeFile() {
  files.splice(0)
  form.filename = null
  if (!formRef.value) return
  formRef.value.validateField("filename")
}

const add = () => {
  if (!formRef.value) return
  formRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      const data = new FormData()
      data.append("file", form.filename.raw)
      const form1 = {}
      Object.assign(form1, form)
      delete form1.filename
      const blob = new Blob([JSON.stringify(form1, null, 2)], { type: "application/json" });
      data.append("value", blob)
      axios.post('/api/files', data)
        .then(request => {
          loading.value = false
          ElMessage.success("新增成功")
          store.commit("addData", { "file": [request.data.data] })
        })
        .catch(error => {
          loading.value = false
          ElMessage.error(error.response ? error.response.data.error : error.message)
        })
    }
  })
}

const edit = () => {
  if (!formRef.value) return
  formRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      const form1 = {}
      for (let key in form) {
        if (checked[key]) form1[key] = form[key]
      }
      axios.patch('/api/files/' + props.id, form1)
        .then(request => {
          loading.value = false
          ElMessage.success('修改成功')
          store.commit('updateData', { "file": request.data.data })
        })
        .catch(error => {
          loading.value = false
          ElMessage.error(error.response ? error.response.data.error : error.message)
        })
    }
  })
}

onMounted(() => {
  if (props.isEdit) {
    axios.get('/api/files/' + props.id)
      .then(response => {
        Object.assign(form, response.data.data)
        store.commit('updateData', { "file": form })
      })
      .catch(error => {
        ElMessage.error(error.response ? error.response.data.error : error.message)
      })
  }
})
</script>

<template>
  <el-form ref="formRef" :model="form" :rules="rules" status-icon label-width="auto"
    :label-position="xxs ? 'top' : 'left'">
    <el-form-item v-if="!isEdit" label="文件" prop="filename">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.filename" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('file:filename:w')" content="需要【file:filename:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-upload class="cal-upload" :auto-upload="false" :disabled="v(isEdit, checked.filename, 'file:filename:w')"
        action :on-change="changeFile" :on-remove="removeFile" :file-list="files">
        <el-button type="primary">选择文件</el-button>
        <template #tip>
          <div class="el-upload__tip">
            选择要上传的文件
          </div>
        </template>
      </el-upload>
    </el-form-item>
    <el-form-item label="名称" prop="name">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.name" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('file:name:w')" content="需要【file:name:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-input :disabled="v(isEdit, checked.name, 'file:name:w')" v-model="form.name" placeholder="名称" clearable />
    </el-form-item>
    <el-form-item label="备注" prop="remark">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.remark" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('file:remark:w')" content="需要【file:remark:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-input :disabled="v(isEdit, checked.remark, 'file:remark:w')" v-model="form.remark" type="textarea"
        placeholder="备注" />
    </el-form-item>
    <el-form-item>
      <el-button v-if="isEdit" :loading="loading" :disabled="loading" type="primary" @click="edit">修改</el-button>
      <el-button v-else :loading="loading" :disabled="loading" type="primary" @click="add">新增</el-button>
      <el-button @click="cancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>
