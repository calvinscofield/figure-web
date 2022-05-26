<script setup>
import { useRouter } from 'vue-router'
import { reactive, ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import _ from 'lodash'

const router = useRouter();
const xxs = useMediaQuery('(max-width: 528px)')
const emailValidator = _.debounce((rule, value, callback) => {
  axios.get("/api/users/exist", { params: { email: value } })
    .then(response => {
      if (response.data.data) callback(new Error("邮箱已注册"))
      else callback()
    }).catch(error => callback(new Error(error.response ? error.response.data.error : error.message)))
}, 500)
const formRef = ref();
const form = reactive({})
const rules = reactive({
  email: [
    { required: true, message: '请输入邮箱' },
    { validator: emailValidator }
  ],
  password: [
    { required: true, message: '请输入密码' }
  ],
  code: [
    { required: true, message: '请输入验证码' }
  ]
})
const emailCode = reactive({
  sended: false,
  count: 0
})
const loading = ref(false)
const loading1 = ref(false)

const submitForm = () => {
  if (!formRef.value) return
  formRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      const params = new URLSearchParams();
      params.append('email', form.email);
      params.append('password', form.password);
      params.append('code', form.code);
      axios.post('/api/users/register', params)
        .then(response => {
          loading.value = false
          ElMessage.success("注册成功")
          router.back()
        })
        .catch(error => {
          loading.value = false
          ElMessage.error(error.response ? error.response.data.error : error.message)
        })
    } else {
      return false
    }
  })
  emailValidator.flush()
}

const resetForm = (formRef) => {
  if (!formRef.value) return
  formRef.value.resetFields()
}

function sendCode() {
  if (!formRef.value) return
  formRef.value.validateField("email", (valid) => {
    if (valid) {
      loading1.value = true
      const params = new URLSearchParams();
      params.append('email', form.email);
      axios.post('/api/users/emailRegisterCode', params)
        .then(response => {
          loading1.value = false
          ElMessage.success("发送成功")
          emailCode.sended = true
          emailCode.count = 59
          let id
          function count() {
            if (--emailCode.count <= 0) {
              clearInterval(id)
              id = null
            }
          }
          id = setInterval(count, 1000)
        })
        .catch(error => {
          loading1.value = false
          ElMessage.error(error.response ? error.response.data.error : error.message)
        })
    }
  })
  emailValidator.flush()
}
</script>

<template>
  <el-form ref="formRef" :model="form" :rules="rules" status-icon label-width="auto"
    :label-position="xxs ? 'top' : 'left'">
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="form.email" placeholder="邮箱" clearable />
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input v-model="form.password" type="password" show-password placeholder="密码" clearable />
    </el-form-item>
    <el-form-item label="验证码" prop="code">
      <el-input v-model="form.code" placeholder="验证码" clearable>
        <template #append>
          <el-button v-if="emailCode.count <= 0" :loading="loading1" :disabled="loading1" @click="sendCode">{{
              emailCode.sended ? "重新发送" : "发送验证码"
          }}
          </el-button>
          <span v-else>{{ emailCode.count }}秒</span>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item>
      <el-button :loading="loading" :disabled="loading" type="primary" @click="submitForm">注册</el-button>
      <el-button @click="resetForm">重置</el-button>
    </el-form-item>
  </el-form>
</template>
