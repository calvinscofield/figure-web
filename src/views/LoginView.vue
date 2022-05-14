<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useMediaQuery } from '@vueuse/core'
import axios from 'axios'
import store from '@/store'

const router = useRouter()
const isUsernameExist = async (rule, value, callback) => {
  try {
    let response = await axios.get("/api/users/exist", { params: { username: value, email: value, phone: value, matchMode: "any" } })
    if (!response.data.data) callback(new Error("用户名/邮箱/手机号不存在"))
    else callback()
  } catch (error) {
    callback(new Error(error.response ? error.response.data.error : error.message))
  }
}
const isEmailExist = async (rule, value, callback) => {
  try {
    let response = await axios.get("/api/users/exist", { params: { email: value } })
    if (!response.data.data) callback(new Error("邮箱不存在"))
    else callback()
  } catch (error) {
    callback(new Error(error.response ? error.response.data.error : error.message))
  }
}
const formRef = ref()
const form = reactive({})
const rules = reactive({
  username: [
    { required: true, message: '请输入用户名/邮箱/手机号', trigger: 'blur' },
    { validator: isUsernameExist, trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { validator: isEmailExist, trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
})
const xxs = useMediaQuery('(max-width: 528px)')
const loginMode = ref("account") // account, email
const emailCode = reactive({
  sended: false,
  count: 0
})

function login() {
  if (!formRef.value) return
  formRef.value.validate((valid) => {
    if (valid) {
      let url
      const params = new URLSearchParams();
      params.append('version', store.state.version)
      switch (loginMode.value) {
        case "account":
          url = "/api/users/login"
          params.append('username', form.username);
          params.append('password', form.password);
          break;
        case "email":
          url = "/api/users/emailLogin"
          params.append('email', form.email);
          params.append('code', form.code);
          break;
      }
      axios.post(url, params)
        .then(response => {
          ElMessage.success("登录成功")
          store.commit("setUser", response.data.data)
          router.back()
        })
        .catch(error => {
          window.navigator.vibrate(200); // 震动 200ms
          ElMessage.error(error.response ? error.response.data.error : error.message)
        })
    }
  })
}

function sendCode() {
  formRef.value.validateField("email", (valid) => {
    if (valid) {
      const params = new URLSearchParams();
      params.append('email', form.email);
      axios.post('/api/users/emailLoginCode', params)
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
    :label-position="xxs ? 'top' : 'left'" @keydown.native.enter="login">
    <template v-if="loginMode == 'account'">
      <el-form-item label="账号" prop="username">
        <el-input v-model="form.username" placeholder="用户名/邮箱/手机号" clearable />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" placeholder="密码" type="password" show-password clearable />
      </el-form-item>
    </template>
    <template v-if="loginMode == 'email'">
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="邮箱" clearable />
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
    </template>
    <el-form-item>
      <el-button type="primary" @click="login">登录</el-button>
      <el-button v-if="loginMode != 'account'" type="primary" text @click="loginMode = 'account'">账号登录</el-button>
      <el-button v-if="loginMode != 'email'" type="primary" text @click="loginMode = 'email'">邮箱登录</el-button>
    </el-form-item>
  </el-form>
  <router-link to="/register">创建账户</router-link>
</template>
