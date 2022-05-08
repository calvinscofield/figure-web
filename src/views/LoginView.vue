<script setup>
import { reactive } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useMediaQuery } from '@vueuse/core'
import axios from 'axios'
import store from '@/store'

const router = useRouter();
const form = reactive({})
const xs = useMediaQuery('(max-width: 768px)')

function login() {
  const params = new URLSearchParams();
  params.append('username', form.username);
  params.append('password', form.password);
  params.append('version', store.state.version)
  axios.post('/api/users/login', params)
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
</script>

<template>
  <el-form :model="form" label-width="auto" :label-position="xs ? 'top' : 'left'" @keydown.native.enter="login">
    <el-form-item label="账号" prop="username">
      <el-input v-model="form.username" placeholder="用户名/邮箱/手机号" />
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input v-model="form.password" type="password" show-password />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="login">登录</el-button>
    </el-form-item>
  </el-form>
  <router-link to="/register">创建账户</router-link>
</template>
