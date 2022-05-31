<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Delete, Lock } from '@element-plus/icons-vue'
import axios from 'axios'
import store from '@/store'
import { useMediaQuery } from '@vueuse/core'
import { check as c, isDisabled as v, viewUrl, re } from '@/util'
import { computed } from '@vue/reactivity'

const router = useRouter();
const props = defineProps(["id", "isEdit"]);
const formRef = ref()
const form = reactive({})
const portraitValidator = (rule, value, callback) => {
  if (value == null || !value.raw) {
    callback()
  } else if (!value.raw.type.startsWith('image/')) {
    callback(new Error("肖像必须是图片"))
  } else if (value.raw.size > 1048576) {
    callback(new Error("肖像图片大小不能超过1MB"))
  } else {
    callback()
  }
}
const birthdayValidator = (rule, value, callback) => {
  let arr
  if (arr = re.exec(value)) {
    let y = Number.parseInt(arr[2])
    if (y === 0 && arr[1] === '-') return callback(new Error("年份为0时不要加负号"))
    if (arr[3] !== undefined) {
      let m = Number.parseInt(arr[3])
      if (m < 1 || m > 12) return callback(new Error("月1-12"))
    }
    if (arr[4] !== undefined) {
      let d = Number.parseInt(arr[4])
      if (d < 1 || d > 31) return callback(new Error("日1-31"))
    }
    callback()
  }
  else callback(new Error("格式不对"))
}

const deathdayValidator = (rule, value, callback) => {
  if (!value || value.length == 0) return callback()
  else birthdayValidator(rule, value, callback)
}

const checked = reactive({})
const rules = computed(() => {
  for (let key in checked) {
    if (!checked[key]) formRef.value.clearValidate(key)
  }
  return {
    name: checked.name || !props.isEdit ? [
      { required: true, message: '请输入名字' }
    ] : [],
    birthday: checked.birthday || !props.isEdit ? [
      { required: true, message: '请输入生辰' },
      { validator: birthdayValidator }
    ] : [],
    deathday: checked.deathday || !props.isEdit ? [
      { validator: deathdayValidator }
    ] : [],
    portrait: checked.portrait || !props.isEdit ? [
      { validator: portraitValidator }
    ] : []
  }
})
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
      const form1 = {}
      Object.assign(form1, form)
      const data = new FormData()
      if (form1.portrait != null && form1.portrait.raw) {
        data.append("portrait", form1.portrait.raw)
        delete form1.portrait
      }
      const blob = new Blob([JSON.stringify(form1, null, 2)], { type: "application/json" });
      data.append("value", blob)
      axios.post("/api/figures", data)
        .then(request => {
          loading.value = false
          ElMessage.success("新增成功")
          store.commit("addData", { "figure": [request.data.data] })
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
      const data = new FormData()
      if (form1.portrait != null) {
        if (form1.portrait.raw) {
          data.append("portrait", form1.portrait.raw)
          delete form1.portrait
        } else {
          form1.portrait = { id: form1.portrait.id }
        }
      }
      const blob = new Blob([JSON.stringify(form1, null, 2)], { type: "application/json" });
      data.append("json", blob)
      axios.patch('/api/figures/' + props.id, data)
        .then(request => {
          loading.value = false
          ElMessage.success('修改成功')
          store.commit('updateData', { "figure": request.data.data })
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
    axios.get('/api/figures/' + props.id)
      .then(response => {
        Object.assign(form, response.data.data)
        if (form.portrait != null) files.push({ url: viewUrl(form.portrait.id, "figure", "portrait"), name: form.portrait.originalFilename })
        store.commit('updateData', { "figure": form })
      })
      .catch(error => {
        ElMessage.error(error.response ? error.response.data.error : error.message)
      })
  }
})

function changePortrait(file) {
  files.splice(0)
  files.push(file)
  form.portrait = file
  if (!formRef.value) return
  formRef.value.validateField("portrait")
}

function removePortrait() {
  files.splice(0)
  form.portrait = null
  if (!formRef.value) return
  formRef.value.validateField("portrait")
}

</script>

<template>
  <el-form ref="formRef" :model="form" :rules="rules" status-icon label-width="auto"
    :label-position="xxs ? 'top' : 'left'">
    <el-form-item label="名字" prop="name">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.name" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('figure:name:w')" content="需要【figure:name:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-input :disabled="v(isEdit, checked.name, 'figure:name:w')" v-model="form.name" placeholder="名字" clearable />
    </el-form-item>
    <el-form-item label="全名" prop="fullname">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.fullname" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('figure:fullname:w')" content="需要【figure:fullname:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-input :disabled="v(isEdit, checked.fullname, 'figure:fullname:w')" v-model="form.fullname" placeholder="全名"
        clearable />
    </el-form-item>
    <el-form-item label="肖像" prop="portrait">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.portrait" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('figure:portrait:w')" content="需要【figure:portrait:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-upload :disabled="v(isEdit, checked.portrait, 'figure:portrait:w')" :file-list="files"
        :on-change="changePortrait" action="#" list-type="picture-card" :auto-upload="false" accept="image/*">
        <el-icon>
          <Plus />
        </el-icon>
        <template #file="{ file }">
          <div>
            <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
            <span v-if="!v(isEdit, checked.portrait, 'figure:portrait:w')" class="el-upload-list__item-actions">
              <span class="el-upload-list__item-delete" @click="removePortrait">
                <el-icon>
                  <Delete />
                </el-icon>
              </span>
            </span>
          </div>
        </template>
      </el-upload>
    </el-form-item>
    <el-form-item label="生辰" prop="birthday">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.birthday" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('figure:birthday:w')" content="需要【figure:birthday:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-input :disabled="v(isEdit, checked.birthday, 'figure:birthday:w')" v-model="form.birthday"
        placeholder="-1000/1/1" clearable />
    </el-form-item>
    <el-form-item label="忌辰" prop="deathday">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.deathday" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('figure:deathday:w')" content="需要【figure:deathday:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-input :disabled="v(isEdit, checked.deathday, 'figure:deathday:w')" v-model="form.deathday"
        placeholder="-1000/1/1" clearable />
    </el-form-item>
    <el-form-item label="备注">
      <template #label="scope">
        <el-checkbox v-if="isEdit" v-model="checked.remark" :label="scope.label" />
        <span v-else>{{ scope.label }}</span>
        <el-tooltip v-if="!c('figure:remark:w')" content="需要【figure:remark:w】权限">
          <el-icon class="cal-icon">
            <lock />
          </el-icon>
        </el-tooltip>
      </template>
      <el-input :disabled="v(isEdit, checked.remark, 'figure:remark:w')" v-model="form.remark" type="textarea"
        placeholder="备注" />
    </el-form-item>
    <el-form-item>
      <el-button v-if="isEdit" :loading="loading" :disabled="loading" type="primary" @click="edit">修改</el-button>
      <el-button v-else :loading="loading" :disabled="loading" type="primary" @click="add">新增</el-button>
      <el-button @click="cancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>
