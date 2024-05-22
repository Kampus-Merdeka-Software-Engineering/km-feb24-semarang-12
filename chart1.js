let limit =5;

fetch('data.json')


  .then(response => response.json())
  .then(data => {
    const labels = Array.from(new Set(data.map(row => row.BOROUGH))).slice(0, limit);
    const values = data.map(row => row.STATBUILT);

    const ctx = document.getElementById('chart1').getContext('2d');
    const myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'My Dataset',
          data: values,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  })
  .catch(error => console.error(error));
/*const ctx = document.getElementById('chart1');

let chart1;
let jsonData;
let jsonLabels;
let labels;
let values;
let limit = 5;


fetch('data.json')
.then(function(response){
    if(response.ok == true){
        return response.json();
    }
})
.then(data => {
    const labels = Array.from(new Set(data.map(row => row.BOROUGH))).slice(0, limit);
    const values = Array.from(new Set(data.map(row => row.SALEPRICE))).slice(0, limit);
    createChart(labels,values, 'line');
})
/*
.then(function(data){
    jsonData = Array.from(new Set(data.map(row => row.BOROUGH))).slice(0, limit);
    createChart(jsonData, 'line');
})

function setChartType(chartType){
    chart1.destroy();
    createChart(labels,values, chartType)
    
}

function createChart(data, type){
chart1 = new Chart(ctx, {
  type: type,
  data: {
    labels: labels,
    //data.map (row => row.BOROUGH).slice(0, limit),
    datasets: [{
      label: 'BOROUGH',
      data: values,
      //data.map (row => row.SALE_PR).slice(0, limit),
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
*/
