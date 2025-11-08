export const commonOptionsBase = {
  responsive: true,
  maintainAspectRatio: false,
  layout: { padding: { top: 8, right: 12, bottom: 6, left: 8 } },
  plugins: {
    legend: {
      position: 'top',
      labels: { boxWidth: 12, boxHeight: 12, font: { size: 11 } }
    },
    tooltip: {
      intersect: false,
      mode: 'index' as const
    }
  },
  scales: {
    x: { grid: { display: false }, ticks: { autoSkip: true, maxTicksLimit: 7 } },
    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { precision: 0 } }
  }
} as const;