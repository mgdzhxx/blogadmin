<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from '../dashboard/admin/components/mixins/resize'

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '350px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        this.setOptions(val)
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this.setOptions(this.chartData)
    },
    setOptions({ xAxisData, actualData, name } = {}) {
      this.chart.setOption({
        xAxis: {
          data: xAxisData,
          boundaryGap: false,
          nameLocation: 'start', // 坐标轴名称显示位置
          axisTick: {
            show: false
          },
          axisLabel: {
            interval: 1, // 横轴信息全部显示
            formatter: function(params) {
              var newParamsName = ''// 最终拼接成的字符串
              var paramsNameNumber = params.length// 实际标签的个数
              var provideNumber = 10// 每行能显示的字的个数
              var rowNumber = Math.ceil(paramsNameNumber / provideNumber)// 换行的话，需要显示几行，向上取整
              /**
                             * 判断标签的个数是否大于规定的个数， 如果大于，则进行换行处理 如果不大于，即等于或小于，就返回原标签
                             */
              // 条件等同于rowNumber>1
              if (paramsNameNumber > provideNumber) {
                /** 循环每一行,p表示行 */
                for (var p = 0; p < rowNumber; p++) {
                  var tempStr = ''// 表示每一次截取的字符串
                  var start = p * provideNumber// 开始截取的位置
                  var end = start + provideNumber// 结束截取的位置
                  // 此处特殊处理最后一行的索引值
                  if (p === rowNumber - 1) {
                    // 最后一次不换行
                    tempStr = params.substring(start, paramsNameNumber)
                  } else {
                    // 每一次拼接字符串并换行
                    tempStr = params.substring(start, end) + '\n'
                  }
                  newParamsName += tempStr// 最终拼成的字符串
                }
              } else {
                // 将旧标签的值赋给新标签
                newParamsName = params
              }
              // 将最终的字符串返回
              return newParamsName
            }
          }
        },
        grid: {
          left: 10,
          right: 30,
          bottom: 20,
          top: 20,
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          padding: [5, 10]
        },
        yAxis: {
          axisTick: {
            show: true
          },
          min: function(value) {
            if (value.min < 10) {
              return 0
            }
            return value.min - 10
          },
          max: function(value) {
            if (value.max < 10) {
              return value.max * 2
            }
            return value.max + 5
          }
        },
        legend: {
          data: [name]
        },
        series: [
          {
            name: name,
            smooth: true,
            type: 'line',
            itemStyle: {
              normal: {
                color: '#3888fa',
                lineStyle: {
                  color: '#3888fa',
                  width: 2
                },
                areaStyle: {
                  color: '#f3f8ff'
                }
              }
            },
            data: actualData,
            animationDuration: 2800,
            animationEasing: 'quadraticOut'
          }]
      })
    }
  }
}
</script>
