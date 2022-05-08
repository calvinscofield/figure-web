<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { computed } from '@vue/reactivity'
import { useMediaQuery } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import store from '@/store'

const router = useRouter();
const user = computed(() => store.state.user)
const xs = useMediaQuery('(max-width: 768px)')
const isEditPassword = ref(false)
const form = reactive({})
function logout() {
  axios.post('/api/users/logout')
    .then(response => {
      ElMessage.success("退出成功")
      store.commit("setUser", response.data.data)
      store.commit("setData", null)
      store.commit("setParams", null)
      router.back()
    })
    .catch(error => {
      ElMessage.error(error.response ? error.response.data.error : error.message)
    })
}

function editPassword() {
  axios.patch('/api/users/me', { "password": form.password }, { headers: { "Password": form.checkPassword }, })
    .then(response => {
      ElMessage.success("修改成功")
      isEditPassword.value = false
    })
    .catch(error => {
      ElMessage.error(error.response ? error.response.data.error : error.message)
    })
}

</script>
<template>
  <el-dialog custom-class="cal-edit-password" v-model="isEditPassword" title="修改密码">
    <el-form :model="form" :label-position="xs ? 'top' : 'left'" label-width="auto">
      <el-form-item label="新密码" prop="password">
        <el-input v-model="form.password" type="password" show-password />
      </el-form-item>
      <el-form-item label="验证密码" prop="checkPassword">
        <el-input v-model="form.checkPassword" type="password" show-password />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="editPassword">修改</el-button>
        <el-button @click="isEditPassword = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
  {{ user.name }} {{ user.username }}
  <el-button type="primary" @click="isEditPassword = true">修改密码</el-button>
  <el-button @click="logout">退出</el-button>
</template>
<style>
.cal-edit-password {
  width: 100%;
  max-width: 600px;
}
</style>
