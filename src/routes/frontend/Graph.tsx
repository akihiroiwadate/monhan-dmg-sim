import { Hono } from 'hono'

import { useEffect } from 'hono/jsx'
import { render } from 'hono/jsx/dom'
import { html } from 'hono/html'

const GraphView = () => {
  return (
    <div>
      {html`
      <script>

        // 棒グラフの設定
        let barCtx = document.getElementById("barChart");
        let barConfig = {
          type: 'bar',
          data: {
            labels: ["クロムナントソード", "シルバーボッシュ", "防衛隊連刃式太刀Ⅴ"],
            datasets: [{
              data: [109, 90, 80],
              label: 'label',
              backgroundColor: [  // それぞれの棒の色を設定(dataの数だけ)
                '#80120F',
                '#6C0809',
                '#550202',
                '#008000',
                '#800080',
                '#ffa500',
              ],
              borderWidth: 1,
            }]
          },
        };
        let barChart = new Chart(barCtx, barConfig);

      </script>
      <canvas id="barChart"/>
      `}
    </div>
  )
}

export default GraphView