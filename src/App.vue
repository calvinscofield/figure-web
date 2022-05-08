<script setup>
import { onBeforeMount, onMounted, ref, reactive } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { Search, Back } from '@element-plus/icons-vue'
import { useMediaQuery, useSessionStorage } from '@vueuse/core'
import { computed } from '@vue/reactivity'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import store from '@/store'

const router = useRouter()
const isActive = ref(false)
const avatarText = computed(() => store.getters.avatarText)
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

function selectMenu(index, indexPath, item, routeResult) {
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
    <el-menu :default-active="menu" @select="selectMenu">
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
      <a class="cal-github" target="_blank" href="https://github.com/calvinscofield/figure">
        <svg height="32" viewBox="0 0 16 16" width="32">
          <path fill-rule="evenodd"
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z">
          </path>
        </svg>
      </a>
      <el-button class="cal-search" :icon="Search" :size="xs ? 'default' : 'large'" circle></el-button>
      <el-button @click="login" class="avatar" :class="{ 'cal-is-active': isActive && xs }" type="text">
        <el-avatar style="--el-avatar-size: calc(var(--cal-header-height) - 10px)">{{ avatarText }}</el-avatar>
      </el-button>
      <el-button @click="toggleMenu" class="cal-hamburger" :class="{ 'cal-is-active': isActive && xs }" type="text">
        <span class="cal-hamburger-container">
          <span class="cal-hamburger-top"></span>
          <span class="cal-hamburger-middle"></span>
          <span class="cal-hamburger-bottom"></span>
        </span>
      </el-button>
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
  display: block;
  margin: auto 1rem;
  width: calc(var(--cal-header-height) - 10px);
  height: calc(var(--cal-header-height) - 10px);
}

.cal-github {
  margin: auto 1rem;
  width: 40px;
  height: 40px;
}

.cal-github>svg {
  width: 100%;
  height: 100%;
}

nav {
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  flex-grow: 1;
}

.cal-menu {
  flex-grow: 1;
}

.cal-nav-title {
  flex-grow: 1;
}

.cal-search {
  margin: auto;
}

.cal-back {
  margin: auto 1rem;
}

.cal-title {
  margin: auto;
  flex-grow: 1;
  font-size: var(--el-font-size-extra-large);
}

.avatar {
  transition: all 0.3s ease-out;
  margin: auto;
  margin-left: 1rem !important;
  margin-right: 1rem;
}

@media(any-hover:hover) {

  .cal-github:hover,
  .logo:hover {
    animation: bounce 0.5s;
  }

  .cal-back:hover {
    cursor: pointer;
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
}

.avatar.cal-is-active {
  transform: translate(0, 50%) scale(2);
}

.cal-hamburger {
  width: 30px;
  height: var(--cal-header-height);
  margin-left: 0 !important;
  margin-right: 1rem;
  display: none;
}

.cal-hamburger-container {
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

.cal-hamburger:hover .cal-hamburger-top {
  top: 0;
  left: 0;
  transform: translate(4px);
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

.cal-hamburger:hover .cal-hamburger-middle {
  top: 6;
  left: 0;
  transform: translate(0);
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

.cal-hamburger:hover .cal-hamburger-bottom {
  top: 12px;
  left: 0;
  transform: translate(8px);
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
    display: block;
  }

  .cal-menu {
    display: none;
  }

  .cal-github {
    width: 30px;
    height: 30px;
  }
}
</style>
