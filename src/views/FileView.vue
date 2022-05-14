<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UploadFilled, Lock } from '@element-plus/icons-vue'
import axios from 'axios'
import store from '@/store'
import { useMediaQuery } from '@vueuse/core'
import { check as c, isDisabled as v } from '../util'

const router = useRouter();
const props = defineProps(["id", "isEdit"]);
const form = reactive({})
const checked = reactive({})
const xxs = useMediaQuery('(max-width: 528px)')
const files = ref([])
const loading = ref(false)

const cancel = () => {
  router.back();
}

const change = (file, fileList) => {
  files.value = fileList;
}

const add = () => {
  loading.value = true
  let data = new FormData()
  files.value.forEach(value => data.append("file", value.raw))
  for (let key in form) {
    data.append(key, form[key])
  }
  axios.post('/api/files', data)
    .then(request => {
      loading.value = false
      ElMessage.success("新增成功")
      store.commit("addData", { "file": request.data.data })
    })
    .catch(error => {
      loading.value = false
      ElMessage.error(error.response ? error.response.data.error : error.message)
    })
}

const edit = () => {
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
  <el-form :model="form" label-width="auto" :label-position="xxs ? 'top' : 'left'">
    <el-form-item v-if="!isEdit" label="文件" prop="url">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.url" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('file:url:w')" content="需要【file:url:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-upload :auto-upload="false" :disabled="v(isEdit, checked.url, 'file:url:w')" action :on-change="change"
        :on-remove="change" multiple>
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
      <el-input :disabled="v(isEdit, checked.name, 'file:name:w')" v-model="form.name" />
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
      <el-input :disabled="v(isEdit, checked.remark, 'file:remark:w')" v-model="form.remark" type="textarea" />
    </el-form-item>
    <el-form-item>
      <el-button v-if="isEdit" :loading="loading" :disabled="loading" type="primary" @click="edit">修改</el-button>
      <el-button v-else :loading="loading" :disabled="loading" type="primary" @click="add">新增</el-button>
      <el-button @click="cancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>
