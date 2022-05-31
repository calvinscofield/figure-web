<script setup>
import axios from 'axios';
import { ref, onMounted, onBeforeMount, onUpdated, watch, h } from 'vue';
import { computed } from '@vue/reactivity'
import { ElMessage } from 'element-plus'
import { FullScreen } from '@element-plus/icons-vue'
import * as d3 from "d3"
import store from '@/store'
import { solarText, solarDate, viewUrl } from '@/util'

const figures = ref([])

const packet = (function () {
  let index = 0
  return function (data, y) {
    let column = []
    data.forEach(el => {
      let b = false
      for (let i = 0; i < column.length; i++) {
        const el1 = column[i];
        const yb1 = y(el1._birthday), yd1 = Math.max(y(el1._deathday), yb1 + 70), yb = y(el._birthday), yd = Math.max(y(el._deathday), yb + 70)
        if (yb <= yd1 && yd >= yb1) { // 有交叉
          b = true
          break
        }
      }
      if (!b) {
        el._column = index
        column.push(el)
      }
    })
    let data1 = data.filter(el => el._column === undefined)
    if (data1.length > 0) {
      index++
      return packet(data1, y)
    } else return index
  }
})()

function src(id) {
  return viewUrl(id, "figure", "portrait", 100)
}

onMounted(() => {
  axios.get('/api/figures')
    .then(response => {
      figures.value = response.data.data
      let dates = []
      figures.value.forEach(d => {
        dates.push(d._birthday = solarDate(d.birthday), d._deathday = solarDate(d.deathday))
      })
      const fs = document.querySelector("#figureShow")
      let width = 500, height = 1000, margin = { top: 20, bottom: 60, left: 45, right: 45 }
      const extent = d3.extent(dates)
      if (extent[0] !== extent[1]) {
        height = (extent[1].getTime() - extent[0].getTime()) / 31536000000 + 100
      }
      const y = d3.scaleUtc()
        .domain(extent)
        .range([margin.top, height - margin.bottom])
      const cols = packet(figures.value, y)
      width = margin.left + (cols + 1) * 70 + margin.right
      const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .on("click", (event) => {
          console.log(event)
          if (event.target == svg.node()) {
            d3.select("#current").remove()
          }
        })
      let defs = svg.append('defs')
      let circleTextFilter = defs
        .append('filter')
        .attr('id', 'circleTextBg')
        .attr("x", -0.05)
        .attr("y", -0.05)
        .attr("width", 1.1)
        .attr("height", 1.1)

      circleTextFilter.append('feFlood')
        .attr('flood-color', '#95d475')

      circleTextFilter.append('feComposite')
        .attr('in', 'SourceGraphic')
      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y)).node()
      figures.value.forEach(el => {
        const rectX = margin.left + 10 + 70 * el._column
        const rectY = y(el._birthday)
        const rectH = y(el._deathday) - y(el._birthday)
        const href = el.portrait ? src(el.portrait.id) : ''
        const p = el.deathday ? `${rectH - 4} a 4 4 1 1 1 -8 0` : `${rectH} h-8`
        const g = svg.append("g")
          .on("click", () => {
            d3.select("#current").remove()
            const g1 = svg.append("g")
              .attr("id", "current")
            g1.append("line")
              .attr("x1", margin.left)
              .attr("y1", rectY)
              .attr("x2", width - margin.right)
              .attr("y2", rectY)
              .attr("stroke", "#95d475")
            g1.append("line")
              .attr("x1", margin.left)
              .attr("y1", rectY + rectH)
              .attr("x2", width - margin.right)
              .attr("y2", rectY + rectH)
              .attr("stroke", "#95d475")
            g1.append("text")
              .attr("x", rectX)
              .attr("y", rectY)
              .attr("dx", "0.35em")
              .attr("fill", "white")
              .attr('filter', 'url(#circleTextBg)')
              .text(solarText(el.birthday))
            g1.append("text")
              .attr("x", rectX)
              .attr("y", rectY + rectH)
              .attr("dx", "0.35em")
              .attr("dy", "1em")
              .attr("fill", "white")
              .attr('filter', 'url(#circleTextBg)')
              .text(solarText(el.deathday))
            g1.append("rect")
              .attr("x", margin.left)
              .attr("y", rectY)
              .attr("width", width - margin.left - margin.right)
              .attr("height", rectH)
              .attr("fill-opacity", 0.5)
              .attr("fill", "steelblue")
            g1.append("text")
              .attr("x", rectX)
              .attr("y", rectY)
              .attr("dx", "0.35em")
              .attr("dy", "1.2em")
              .attr("fill", "red")
              .text(el.fullname)
            g1.append("text")
              .attr("x", rectX)
              .attr("y", rectY + rectH)
              .attr("dx", "0.35em")
              .attr("dy", "-0.2em")
              .attr("fill", "red")
              .text(el.remark)
          })
        g.append("path")
          .attr("d", `M ${rectX} ${rectY} h 8 v ${p} z`)
          .attr("fill", "steelblue")
        g.append("image")
          .attr("x", rectX + 10)
          .attr("y", rectY)
          .attr("width", 50)
          .attr("height", 50)
          .attr("href", href)
        g.append("text")
          .attr("x", rectX + 10)
          .attr("y", rectY + 50)
          .attr("dx", "0.35em")
          .attr("dy", "1em")
          .text(el.name)

      })

      fs.replaceChildren(svg.node())
    })
    .catch(error => {
      ElMessage.error(error.response ? error.response.data.error : error.message)
    })

})

</script>

<template>
  <main>
    <div id="figureShow"></div>
  </main>
</template>
