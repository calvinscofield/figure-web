<script setup>
import { useRouter } from 'vue-router'
import { reactive, ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter();
const xxs = useMediaQuery('(max-width: 528px)')
const isEmailExist = async (rule, value, callback) => {
  try {
    let response = await axios.get("/api/users/exist", { params: { email: value } })
    if (response.data.data) callback(new Error("邮箱已注册"))
    else callback()
  } catch (error) {
    callback(new Error(error.response ? error.response.data.error : error.message))
  }
}
const formRef = ref();
const form = reactive({})
const rules = reactive({
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { validator: isEmailExist, trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
})
const emailCode = reactive({
  sended: false,
  count: 0
})
const submitForm = (formEl) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      const params = new URLSearchParams();
      params.append('email', form.email);
      params.append('password', form.password);
      params.append('code', form.code);
      axios.post('/api/users/register', params)
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

function sendCode() {
  formRef.value.validateField("email", (valid) => {
    if (valid) {
      const params = new URLSearchParams();
      params.append('email', form.email);
      axios.post('/api/users/emailRegisterCode', params)
        .then(response => {
          ElMessage.success("发送成功")
        })
        .catch(error => {
          ElMessage.error(error.response ? error.response.data.error : error.message)
        })
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
    }
  })
}
</script>

<template>
  <el-form ref="formRef" :model="form" :rules="rules" status-icon label-width="auto"
    :label-position="xxs ? 'top' : 'left'">
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="form.email" placeholder="邮箱" clearable />
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input v-model="form.password" placeholder="密码" type="password" show-password clearable />
    </el-form-item>
    <el-form-item label="验证码" prop="code">
      <el-input v-model="form.code" placeholder="验证码" clearable>
        <template #append>
          <el-button v-if="emailCode.count <= 0" @click="sendCode">{{ emailCode.sended ? "重新发送" : "发送验证码" }}
          </el-button>
          <span v-else>{{ emailCode.count }}秒</span>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm(formRef)">注册</el-button>
      <el-button @click="resetForm(formRef)">重置</el-button>
    </el-form-item>
  </el-form>
</template>
