<script setup>
const getMedia = () => {
  let video = document.querySelector("#video")
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop())
  }
  navigator.mediaDevices.getUserMedia({ audio: true, video: { width: 200, height: 200, facingMode: value.value ? "user" : "environment" } })
    .then(stream => {
      video.srcObject = stream
      video.play()
    })
    .catch(error => {
      console.error(error)
    })
}
const closeMedia = () => {
  let video = document.querySelector("#video")
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop())
  }
}

const capture = () => {
  let canvas = document.querySelector("#canvas")
  let video = document.querySelector("#video")
  let ctx = canvas.getContext('2d')
  let ch = video.height
  let cw = video.width
  canvas.height = ch
  canvas.width = cw
  if (video.srcObject) {
    ctx.drawImage(video, 0, 0)
    let url = canvas.toDataURL('image/jpeg')
  }
}
</script>
<template>
  <div class="about">
    <h1>This is an about page</h1>
    <el-upload :auto-upload="false" accept="image/*" action :on-change="change" :on-remove="change" multiple>
      <el-button type="primary">选择文件</el-button>
      <template #tip>
        <div class="el-upload__tip">
          选择要上传的文件
        </div>
      </template>
    </el-upload>
    <el-switch v-model="value" @change="getMedia" active-text="前置" inactive-text="后置" />
    <el-button @click="getMedia">开启摄像头</el-button>
    <el-button @click="closeMedia">关闭摄像头</el-button>
    <el-button @click="capture">拍照</el-button>
    <video id="video" width="200" height="200" autoplay></video>
    <canvas id="canvas" width="200" height="200"></canvas>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
