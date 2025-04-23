<template>
  <div class="data-chart">
    <h4>生态数据</h4>
    <canvas ref="chartCanvas"></canvas>
    <p v-if="!chartData || !chartData.labels || chartData.labels.length === 0">正在加载数据...</p>
  </div>
</template>

<script>
import { Line } from 'vue-chartjs';
import Chart from 'chart.js/auto'; // Use Chart.js v3+ auto registration

export default {
  name: 'DataChart',
  extends: Line,
  props: {
    chartData: {
      type: Object,
      default: () => ({ labels: [], datasets: [] }),
    },
    options: {
      type: Object,
      default: () => ({
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }),
    },
  },
  mounted() {
    this.renderLineChart();
  },
  watch: {
    chartData: {
      deep: true,
      handler() {
        this.renderLineChart();
      }
    }
  },
  methods: {
    renderLineChart() {
       // vue-chartjs v4+ uses renderChart method
       // Ensure the chart instance is destroyed before rendering a new one
       if (this.chart) {
           this.chart.destroy();
       }
       if (this.chartData && this.chartData.labels && this.chartData.labels.length > 0) {
            this.renderChart(this.chartData, this.options);
       } else {
           console.log("DataChart: No data to render yet.");
       }
    }
  }
};
</script>

<style scoped>
.data-chart {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 300px;
  height: 200px; /* Adjust as needed */
  background: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 5px;
  z-index: 10;
}
canvas {
    width: 100% !important;
    height: 150px !important; /* Adjust height within the container */
}
</style>