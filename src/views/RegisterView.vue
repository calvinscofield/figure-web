<script setup>
import { useRouter } from 'vue-router'
import { reactive, ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter();
const xs = useMediaQuery('(max-width: 768px)')
const formRef = ref();
const form = reactive({})

const submitForm = (formEl) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      axios.post('/api/users/register', form)
        .then(response => {
          ElMessage.success("注册成功")
          router.back()
        })
        .catch(error => {
          ElMessage.error(error.response ? error.response.data.error : error.message)
        })
    } else {
      return false
    }
  })
}

const resetForm = (formRef) => {
  if (!formRef) return
  formRef.resetFields()
}
</script>

<template>
  <el-form ref="formRef" :model="form" :rules="rules" :label-position="xs ? 'top' : 'left'"
    label-width="auto">
    <el-form-item label="邮箱" prop="email">
      <el-input v-model.number="form.email" />
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input v-model="form.password" type="password" show-password />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm(formRef)">注册</el-button>
      <el-button @click="resetForm(formRef)">重置</el-button>
    </el-form-item>
  </el-form>
</template>
