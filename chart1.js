const ctx = document.getElementById('chart1');

let chart1;
let jsonData;
let limit = 5;


fetch('data.json')
.then(function(response){
    if(response.ok == true){
        return response.json();
    }
})
.then(function(data){
    //jsonData = data;
    //createChart(data, 'line');
    jsonData = Array.from(new Set(data.map(row => row.BOROUGH))).slice(0, limit);
    createChart(jsonData, 'line');
}
);

function setChartType(chartType){
    chart1.destroy();
    createChart(jsonData, chartType)
}

function createChart(data, type){
chart1 = new Chart(ctx, {
  type: type,
  data: {
    labels: data,
    //data.map (row => row.BOROUGH).slice(0, limit),
    datasets: [{
      label: 'BOROUGH',
      data: data.map (row => row.SALE_PR).slice(0, limit),
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  },
  options: {
    plugins: {
        decimation: {
          enabled: true,
          algorithm: 'lttb',
          samples: 20,
          threshold: 20
        }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    },
    maintainAspectRatio: false
  }
});
}