<script setup>
import { onBeforeMount, onMounted, ref, reactive } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { Search, Back } from '@element-plus/icons-vue'
import Github from '@/components/icons/Github.vue'
import { useMediaQuery, useSessionStorage } from '@vueuse/core'
import { computed } from '@vue/reactivity'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import store from '@/store'
import { viewUrl } from '@/util'

const router = useRouter()
const isActive = ref(false)
const avatarText = computed(() => store.getters.avatarText)
const avatar = computed(() => store.getters.avatar)
const xs = useMediaQuery('(max-width: 768px)')
const menu = useSessionStorage("menu", "home")
const menus = reactive([{ index: "home", title: "首页" }, { index: "file", title: "文件" }, { index: "user", title: "用户" },
{ index: "role", title: "角色" }, { index: "permission", title: "权限" }, { index: "about", title: "关于" }])
const isFull = ref(false)
const fullObj = reactive({
  "login": "登录", "register": "注册", "fileAdd": "上传文件", "fileEdit": "修改文件", "userAdd": "新增用户", "userEdit": "修改用户",
  "roleAdd": "新增角色", "roleEdit": "修改角色", "permissionAdd": "新增权限", "permissionEdit": "修改权限", "me": "个人中心"
})
const title1 = computed(() => {
  const f = menus.find(el => el.index == menu.value)
  return f ? f.title : ''
})
const title = ref('')

router.afterEach((to, from) => {
  isActive.value = false
  menu.value = to.name
  isFull.value = Object.keys(fullObj).includes(to.name)
  title.value = fullObj[to.name]
})

function goBack() {
  router.back()
}

function toggleMenu() {
  isActive.value = !isActive.value;
}

function selectMenu(index) {
  router.push({ path: index == "home" ? '/' : '/' + index })
}

function onBeforeClose() {
  isActive.value = false;
}

function login() {
  isActive.value = false;
  if (store.getters.isLogin) router.push({ path: '/me' });
  else router.push({ path: '/login' });
}

onBeforeMount(() => {
  console.log("onBeforeMount-App")
  axios.get("/api/users/me")
    .then(response => {
      store.commit("setUser", response.data.data)
    })
    .catch(error => ElMessage.error(error.response ? error.response.data.error : error.message))
})

onMounted(() => {
  console.log("onMounted-App")
})
</script>

<template>
  <el-backtop />
  <el-drawer custom-class="cal-drawer" :modal-class="'cal-modal' + (isActive && xs ? ' cal-is-active' : '')"
    v-model="isActive" :before-close="onBeforeClose" :with-header="false" :z-index="1999">
    <el-menu :default-active="menu" class="cal-drawer-menu" @select="selectMenu">
      <el-menu-item v-for="menu in menus" :index="menu.index">{{ menu.title }}</el-menu-item>
    </el-menu>
  </el-drawer>
  <el-container class="cal-container">
    <el-header v-if="isFull" class="cal-header">
      <el-icon @click="goBack" class="cal-back" :size="xs ? 28 : 32">
        <back />
      </el-icon>
      <span class="cal-title">{{ title }}</span>
    </el-header>
    <el-header v-else class="cal-header">
      <img alt="Vue logo" class="logo" src="@/assets/logo.svg" />
      <nav>
        <el-menu :default-active="menu" class="cal-menu" mode="horizontal" @select="selectMenu">
          <el-menu-item v-for="menu in menus" :index="menu.index">{{ menu.title }}
          </el-menu-item>
        </el-menu>
        <span class="cal-nav-title">{{ title1 }}</span>
      </nav>
      <span class="cal-search">
        <el-icon :size="20">
          <Search />
        </el-icon>
      </span>
      <a class="cal-github" target="_blank" href="https://github.com/calvinscofield/figure">
        <github />
      </a>
      <span @click="login" class="avatar" :class="{ 'cal-is-active': isActive && xs }">
        <el-avatar>
          <img v-if="avatar" :src="viewUrl(avatar.id, 100)" />
          <span v-else> {{ avatarText }}</span>
        </el-avatar>
      </span>
      <span @click="toggleMenu" class="cal-hamburger" :class="{ 'cal-is-active': isActive && xs }">
        <span class="cal-hamburger-container">
          <span class="cal-hamburger-top"></span>
          <span class="cal-hamburger-middle"></span>
          <span class="cal-hamburger-bottom"></span>
        </span>
      </span>
    </el-header>
    <el-main class="cal-main">
      <RouterView />
    </el-main>
  </el-container>
</template>

<style>
@import "@/assets/base.css";

@keyframes bounce {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.25);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes bounce-in {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(0.75);
  }

  100% {
    transform: scale(1);
  }
}

#app {
  --cal-header-height: 60px;
}

.cal-drawer {
  width: 100% !important;
  max-width: 400px;
}

.cal-modal:not(.cal-is-active) {
  display: none;
}

.cal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  width: 100%;
  height: var(--cal-header-height);
  --el-header-padding: 0;
  z-index: 2000;
  border-bottom: 1px solid #ebf2f2;
  background: var(--color-background);
}

.logo {
  margin-left: 1rem;
  margin-right: 1rem;
  width: calc(var(--cal-header-height) - 10px);
  height: calc(var(--cal-header-height) - 10px);
}

.cal-github {
  margin-left: 1rem;
  width: 40px;
  height: 40px;
}

.cal-github>svg {
  width: 100%;
  height: 100%;
}

nav {
  display: flex;
  align-items: center;
  flex-grow: 1;
}

.cal-drawer-menu {
  border-right: none;
}

.cal-menu {
  flex-grow: 1;
  border-bottom: none;
}

.cal-nav-title {
  flex-grow: 1;
}

.cal-search {
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  margin-left: 1rem;
  border: solid 1px #cdcdcd;
  border-radius: 50%;
}

.cal-back {
  cursor: pointer;
  margin-left: 1rem;
  margin-right: 1rem;
}

.cal-title {
  flex-grow: 1;
  font-size: var(--el-font-size-extra-large);
}

.avatar {
  cursor: pointer;
  width: calc(var(--cal-header-height) - 10px);
  height: calc(var(--cal-header-height) - 10px);
  transition: all 0.3s ease-out;
  margin-left: 1rem;
  margin-right: 1rem;
}

.avatar .el-avatar {
  width: 100%;
  height: 100%;
}

@media(any-hover:hover) {

  .cal-github:hover,
  .logo:hover,
  .cal-search:hover,
  .cal-back:hover {
    animation: bounce 0.5s;
  }

  @media(max-width: 768px) {
    .avatar:hover:not(.cal-is-active) {
      transform: translate(0, 50%) scale(2);
    }
  }

  @media(min-width: 768px) {
    .avatar:hover:not(.cal-is-active) {
      animation: bounce 0.5s;
    }
  }

  .cal-hamburger:hover .cal-hamburger-top {
    top: 0;
    left: 0;
    transform: translate(4px);
  }

  .cal-hamburger:hover .cal-hamburger-middle {
    top: 6;
    left: 0;
    transform: translate(0);
  }

  .cal-hamburger:hover .cal-hamburger-bottom {
    top: 12px;
    left: 0;
    transform: translate(8px);
  }
}

.avatar.cal-is-active {
  transform: translate(0, 50%) scale(2);
}

.cal-hamburger {
  width: 30px;
  height: var(--cal-header-height);
  margin-right: 1rem;
  display: none;
}

.cal-hamburger-container {
  display: inline-block;
  position: relative;
  width: 16px;
  height: 14px;
  overflow: hidden;
}

.cal-hamburger-top {
  top: 0;
  left: 0;
  transform: translate(0);
}

.cal-hamburger.cal-is-active .cal-hamburger-top {
  top: 6px;
  transform: translate(0) rotate(225deg);
}

.cal-hamburger-middle {
  top: 6px;
  left: 0;
  transform: translate(8px);
}

.cal-hamburger.cal-is-active .cal-hamburger-middle {
  top: 6px;
  transform: translate(16px);
}

.cal-hamburger-bottom {
  top: 12px;
  left: 0;
  transform: translate(4px);
}

.cal-hamburger.cal-is-active .cal-hamburger-bottom {
  top: 6px;
  transform: translate(0) rotate(135deg);
}

.cal-hamburger-top,
.cal-hamburger-middle,
.cal-hamburger-bottom {
  position: absolute;
  width: 16px;
  height: 2px;
  background-color: var(--color-text);
  transition: top .25s, background-color .5s, transform .25s;
}

.cal-drawer>.el-drawer__body {
  margin-top: var(--cal-header-height);
}

.cal-main {
  margin-top: var(--cal-header-height);
}


@media (min-width: 768px) {
  .cal-nav-title {
    display: none;
  }
}

@media (max-width: 768px) {
  #app {
    --cal-header-height: 40px;
  }

  .cal-title {
    font-size: var(--el-font-size-large);
  }

  .cal-hamburger {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .cal-menu {
    display: none;
  }

  .cal-github {
    width: 30px;
    height: 30px;
  }

  .cal-search {
    width: 30px;
    height: 30px;
    border: none;
  }
}
</style>
