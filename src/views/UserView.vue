<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Delete, Lock } from '@element-plus/icons-vue'
import axios from 'axios'
import store from '@/store'
import { useMediaQuery } from '@vueuse/core'
import { check as c, isDisabled as v, viewUrl } from '@/util'
import { computed } from '@vue/reactivity'
import _ from 'lodash'

const router = useRouter();
const props = defineProps(["id", "isEdit"]);
const formRef = ref()
const form = reactive({})
const usernameValidator = _.debounce((rule, value, callback) => {
  if (!value || value.length == 0) return callback()
  const params = { username: value }
  if (props.isEdit) params.excludeId = props.id
  axios.get("/api/users/exist", { params }).then(response => {
    if (response.data.data) callback(new Error("用户名已存在"))
    else callback()
  }).catch(error => callback(new Error(error.response ? error.response.data.error : error.message)))
}, 500)
const nameValidator = _.debounce((rule, value, callback) => {
  if (!value || value.length == 0) return callback()
  const params = { name: value }
  if (props.isEdit) params.excludeId = props.id
  axios.get("/api/users/exist", { params }).then(response => {
    if (response.data.data) callback(new Error("昵称已存在"))
    else callback()
  }).catch(error => callback(new Error(error.response ? error.response.data.error : error.message)))
}, 500)
const emailValidator = _.debounce((rule, value, callback) => {
  if (!value || value.length == 0) return callback()
  const params = { email: value }
  if (props.isEdit) params.excludeId = props.id
  axios.get("/api/users/exist", { params }).then(response => {
    if (response.data.data) callback(new Error("邮箱已存在"))
    else callback()
  }).catch(error => callback(new Error(error.response ? error.response.data.error : error.message)))
}, 500)
const phoneValidator = _.debounce((rule, value, callback) => {
  if (!value || value.length == 0) return callback()
  const params = { phone: value }
  if (props.isEdit) params.excludeId = props.id
  axios.get("/api/users/exist", { params }).then(response => {
    if (response.data.data) callback(new Error("手机号已存在"))
    else callback()
  }).catch(error => callback(new Error(error.response ? error.response.data.error : error.message)))
}, 500)
const avatarValidator = (rule, value, callback) => {
  if (value == null || !value.raw) {
    callback()
  } else if (!value.raw.type.startsWith('image/')) {
    callback(new Error("头像必须是图片"))
  } else if (value.raw.size > 1048576) {
    callback(new Error("头像图片大小不能超过1MB"))
  } else {
    callback()
  }
}
const checked = reactive({})
const rules = computed(() => {
  for (let key in checked) {
    if (!checked[key]) formRef.value.clearValidate(key)
  }
  return {
    username: checked.username || !props.isEdit ? [
      { required: true, message: '请输入用户名' },
      { validator: usernameValidator }
    ] : [],
    password: checked.password || !props.isEdit ? [
      { required: true, message: '请输入密码' }
    ] : [],
    name: checked.name || !props.isEdit ? [
      { validator: nameValidator }
    ] : [],
    email: checked.email || !props.isEdit ? [
      { validator: emailValidator }
    ] : [],
    phone: checked.phone || !props.isEdit ? [
      { validator: phoneValidator }
    ] : [],
    avatar: checked.avatar || !props.isEdit ? [
      { validator: avatarValidator }
    ] : []
  }
})
const roles = ref([])
const selectedRoles = ref([])
const xxs = useMediaQuery('(max-width: 528px)')
const files = reactive([])
const loading = ref(false)

const cancel = () => {
  router.back();
}

const add = () => {
  if (!formRef.value) return
  formRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      form.role = selectedRoles.value.map(el => ({ id: el }))
      const form1 = {}
      Object.assign(form1, form)
      const data = new FormData()
      if (form1.avatar != null && form1.avatar.raw) {
        data.append("avatar", form1.avatar.raw)
        delete form1.avatar
      }
      const blob = new Blob([JSON.stringify(form1, null, 2)], { type: "application/json" });
      data.append("value", blob)
      axios.post("/api/users", data)
        .then(request => {
          loading.value = false
          ElMessage.success("新增成功")
          store.commit("addData", { "user": [request.data.data] })
        })
        .catch(error => {
          loading.value = false
          ElMessage.error(error.response ? error.response.data.error : error.message)
        })
    }
  })
  usernameValidator.flush()
  nameValidator.flush()
  emailValidator.flush()
  phoneValidator.flush()
}

const edit = () => {
  if (!formRef.value) return
  formRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      form.role = selectedRoles.value.map(el => ({ id: el }))
      const form1 = {}
      for (let key in form) {
        if (checked[key]) form1[key] = form[key]
      }
      const data = new FormData()
      if (form1.avatar != null) {
        if (form1.avatar.raw) {
          data.append("avatar", form1.avatar.raw)
          delete form1.avatar
        } else {
          form1.avatar = { id: form1.avatar.id }
        }
      }
      const blob = new Blob([JSON.stringify(form1, null, 2)], { type: "application/json" });
      data.append("json", blob)
      axios.patch('/api/users/' + props.id, data)
        .then(request => {
          loading.value = false
          ElMessage.success('修改成功')
          store.commit('updateData', { "user": request.data.data })
        })
        .catch(error => {
          loading.value = false
          ElMessage.error(error.response ? error.response.data.error : error.message)
        })
    }
  })
  usernameValidator.flush()
  nameValidator.flush()
  emailValidator.flush()
  phoneValidator.flush()
}

onMounted(() => {
  if (props.isEdit) {
    Promise.all([axios.get('/api/users/' + props.id), axios.get('/api/roles')])
      .then(response => {
        Object.assign(form, response[0].data.data)
        if (form.avatar != null) files.push({ url: viewUrl(form.avatar.id, "user", "avatar"), name: form.avatar.originalFilename })
        store.commit('updateData', { "user": form })
        selectedRoles.value = form.role.map(el => el.id)
        roles.value = response[1].data.data
      })
      .catch(error => {
        ElMessage.error(error.response ? error.response.data.error : error.message)
      })
  } else {
    axios.get('/api/roles')
      .then(response => {
        roles.value = response.data.data
      })
      .catch(error => ElMessage.error(error.response ? error.response.data.error : error.message))
  }
})

function changeAvatar(file) {
  files.splice(0)
  files.push(file)
  form.avatar = file
  if (!formRef.value) return
  formRef.value.validateField("avatar")
}

function removeAvatar() {
  files.splice(0)
  form.avatar = null
  if (!formRef.value) return
  formRef.value.validateField("avatar")
}

</script>

<template>
  <el-form ref="formRef" :model="form" :rules="rules" status-icon label-width="auto"
    :label-position="xxs ? 'top' : 'left'">
    <el-form-item label="用户名" prop="username">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.username" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('user:username:w')" content="需要【user:username:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-input :disabled="v(isEdit, checked.username, 'user:username:w')" v-model="form.username" placeholder="用户名"
        clearable />
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.password" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('user:password:w')" content="需要【user:password:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-input :disabled="v(isEdit, checked.password, 'user:password:w')" type="password" show-password
        v-model="form.password" placeholder="密码" clearable />
    </el-form-item>
    <el-form-item label="昵称" prop="name">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.name" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('user:name:w')" content="需要【user:name:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-input :disabled="v(isEdit, checked.name, 'user:name:w')" v-model="form.name" placeholder="昵称" clearable />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.email" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('user:email:w')" content="需要【user:email:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-input :disabled="v(isEdit, checked.email, 'user:email:w')" v-model="form.email" placeholder="邮箱" clearable />
    </el-form-item>
    <el-form-item label="手机号" prop="phone">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.phone" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('user:phone:w')" content="需要【user:phone:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-input :disabled="v(isEdit, checked.phone, 'user:phone:w')" v-model="form.phone" placeholder="手机号" clearable />
    </el-form-item>
    <el-form-item label="头像" prop="avatar">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.avatar" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('user:avatar:w')" content="需要【user:avatar:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-upload :disabled="v(isEdit, checked.avatar, 'user:avatar:w')" :file-list="files" :on-change="changeAvatar"
        action="#" list-type="picture-card" :auto-upload="false" accept="image/*">
        <el-icon>
          <Plus />
        </el-icon>
        <template #file="{ file }">
          <div>
            <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
            <span v-if="!v(isEdit, checked.avatar, 'user:avatar:w')" class="el-upload-list__item-actions">
              <span class="el-upload-list__item-delete" @click="removeAvatar">
                <el-icon>
                  <Delete />
                </el-icon>
              </span>
            </span>
          </div>
        </template>
      </el-upload>
    </el-form-item>
    <el-form-item label="有效期">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.expiryTime" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('user:expiryTime:w')" content="需要【user:expiryTime:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-date-picker :disabled="v(isEdit, checked.expiryTime, 'user:expiryTime:w')" v-model="form.expiryTime"
        type="datetime" style="width: 100%;" placeholder="有效期" clearable />
    </el-form-item>
    <el-form-item label="锁定">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.locked" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('user:locked:w')" content="需要【user:locked:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-switch :disabled="v(isEdit, checked.locked, 'user:locked:w')" v-model="form.locked" />
    </el-form-item>
    <el-form-item label="凭证有效期">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.credentialsExpiryTime" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('user:credentialsExpiryTime:w')" content="需要【user:credentialsExpiryTime:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-date-picker :disabled="v(isEdit, checked.credentialsExpiryTime, 'user:credentialsExpiryTime:w')"
        v-model="form.credentialsExpiryTime" type="datetime" style="width: 100%;" placeholder="凭证有效期" clearable />
    </el-form-item>
    <el-form-item label="禁用">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.disabled" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('user:disabled:w')" content="需要【user:disabled:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-switch :disabled="v(isEdit, checked.disabled, 'user:disabled:w')" v-model="form.disabled" />
    </el-form-item>
    <el-form-item label="角色">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.role" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('user:role:w')" content="需要【user:role:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-select :disabled="v(isEdit, checked.role, 'user:role:w')" v-model="selectedRoles" multiple class="cal-select"
        placeholder="角色" clearable>
        <el-option v-for="item in roles" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
    </el-form-item>
    <el-form-item label="备注">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.remark" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('user:remark:w')" content="需要【user:remark:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-input :disabled="v(isEdit, checked.remark, 'user:remark:w')" v-model="form.remark" type="textarea"
        placeholder="备注" />
    </el-form-item>
    <el-form-item>
      <el-button v-if="isEdit" :loading="loading" :disabled="loading" type="primary" @click="edit">修改</el-button>
      <el-button v-else :loading="loading" :disabled="loading" type="primary" @click="add">新增</el-button>
      <el-button @click="cancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>
