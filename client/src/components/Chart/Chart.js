import React from "react";
import styles from "./Chart.module.css";
import { Pie, Line, Bar } from "react-chartjs-2";

function Chart(props) {
  return (
    <div className={styles.container}>
      <>
        <Line
          data={{
            labels: props.chart01.chartLabels,
            datasets: [
              {
                data: props.chart01.chartData,
                label: "Balance",
                fill: true,
                lineTension: 0.4,
                backgroundColor: "#CAA6DB",
                borderColor: "#999999",
              },
            ],
          }}
        />

        <Bar
          data={{
            labels: props.chart02.chartLabels,
            datasets: props.chart02.datasets,
          }}
        />

        <Pie
          data={{
            labels: props.chart03.chartLabels,
            datasets: props.chart03.datasets,
          }}
        />
      </>
    </div>
  );
}

export default Chart;
