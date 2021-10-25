/* globals Chart:false, feather:false */

(function () {
  "use strict";

  feather.replace({ "aria-hidden": "true" });

  transactions = JSON.parse(transactions);
  transactionsCompare = JSON.parse(transactionsCompare);

  // Graphs
  var ctx = document.getElementById("myChart");
  // eslint-disable-next-line no-unused-vars
  if (ctx) {
    var myChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: transactions.map(
          (item) =>
            `${new Date(item.created_at).getFullYear()}-${
              new Date(item.created_at).getMonth() + 1
            }-${new Date(item.created_at).getDate()}`
        ),
        datasets: [
          {
            label: "Lucro",
            fill: false,
            data: transactions.map((item) => item.qty),
            lineTension: 0,
            backgroundColor: "transparent",
            borderColor: "#007bff",
            borderWidth: 4,
            pointBackgroundColor: "#007bff",
          },
          {
            label: "Perda",
            fill: false,
            data: transactionsCompare.map((item) => item.qty),
            lineTension: 0,
            backgroundColor: "transparent",
            borderColor: "#FF0000",
            borderWidth: 4,
            pointBackgroundColor: "#FF0000",
          },
        ],
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: false,
              },
            },
          ],
        },
        legend: {
          display: true,
        },
      },
    });
  }
})();
