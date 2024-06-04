// Fetch the JSON data
function fetchJsonData(year = null, boroughs = [], isFiltered = false) {
    return fetch('data.json')
        .then(response => response.json())
        .then(data => {
            // Filtering the year data
            if (year) {
                data = data.filter((row) => row["SALE YEAR"] === Number(year));
            }

            // Filtering the boroughs data
            if (boroughs && boroughs.length > 0) {
                data = data.filter((row) => boroughs.includes(row["BOROUGH"]));
            }

            // Aggregate and sort the sale prices by borough
            const saleData = aggregateSalePricesByBorough(data)
                .sort((a, b) => b["SALE PRICE"] - a["SALE PRICE"]);

            // Extract borough names and sale prices
            const boroughNames = saleData.map(item => item["BOROUGH"]);
            const salePrices = saleData.map(item => item["SALE PRICE"]);

            // Get unique years from data and sort them
            const yearOptions = Array.from(new Set(data.map((row) => row["SALE YEAR"]))).sort();

            // Reference to the year dropdown element
            const yearElement = document.getElementById("year");

            // Populate the year dropdown if it is not filtered by year
            if (!year && yearElement.options.length <= 1) {
                for (let i = 0; i < yearOptions.length; i++) {
                    const option = document.createElement("option");
                    option.value = yearOptions[i];
                    option.text = yearOptions[i];
                    yearElement.appendChild(option);
                }

                // Add event listener to filter by year on change
                yearElement.addEventListener("change", filterByYear);
            }

            // Get unique boroughs from data
            const boroughOptions = Array.from(new Set(data.map((row) => row.BOROUGH)));

            // Reference to the borough container element
            const boroughContainer = document.getElementById("boroughs");

            // Populate the borough checkboxes if it is not filtered by borough
            if (boroughContainer.children.length === 0) {
                for (let i = 0; i < boroughOptions.length; i++) {
                    const label = document.createElement("label");
                    const checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.value = boroughOptions[i];
                    checkbox.name = "borough";
                    checkbox.addEventListener("change", filterByBorough);
                    label.appendChild(checkbox);
                    label.appendChild(document.createTextNode(boroughOptions[i]));
                    boroughContainer.appendChild(label);
                }
            }

            // Update statistics
            updateStats(data);

            // Create the chart
            const chartElement = document.getElementById("chart");

            if (isFiltered) {
                // Remove the old canvas and create a new one for the updated chart
                const salePriceChart = document.getElementById('salePriceChart');
                salePriceChart.remove();
                const newSalePriceCtx = document.createElement("canvas");
                newSalePriceCtx.id = 'salePriceChart';
                chartElement.querySelector('.salePriceChart').appendChild(newSalePriceCtx);
                const SalePriceCtx = document.getElementById('salePriceChart').getContext('2d');
                renderBarChart(SalePriceCtx, boroughNames, salePrices);

                // Remove the old canvas and create a new one for the updated pie chart
                const propertyUnitChart = document.getElementById('propertyUnitChart');
                propertyUnitChart.remove();
                const newPropertyUnitCtx = document.createElement("canvas");
                newPropertyUnitCtx.id = "propertyUnitChart";
                chartElement.querySelector('.propertyUnitChart').appendChild(newPropertyUnitCtx);
                const propertyUnitCtx = document.getElementById('propertyUnitChart').getContext('2d');
                renderPieChart(propertyUnitCtx, boroughNames, saleData);

            } else {
                const salePriceCtx = document.getElementById('salePriceChart').getContext('2d');
                renderBarChart(salePriceCtx, boroughNames, salePrices);

                const propertyUnitCtx = document.getElementById('propertyUnitChart').getContext('2d');
                renderPieChart(propertyUnitCtx, boroughNames, saleData);
            }
        })
        
        .catch(error => console.error('Error fetching data:', error));
}


// Event handler to filter data by selected year
function filterByYear() {
    const year = document.getElementById("year").value;
    const boroughs = Array.from(document.querySelectorAll('#boroughs input:checked')).map(checkbox => checkbox.value);
    fetchJsonData(year, boroughs, true);
}

// Event handler to filter data by selected borough
function filterByBorough() {
    const year = document.getElementById("year").value;
    const boroughs = Array.from(document.querySelectorAll('#boroughs input:checked')).map(checkbox => checkbox.value);
    fetchJsonData(year, boroughs, true);
}

// Function to render the bar chart
function renderBarChart(ctx, labels, data) {
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'SALE PRICE',
                data: data,
                backgroundColor: 'rgba(139, 69, 19, 0.6)', // brown color with opacity
                borderColor: 'rgba(139, 69, 19, 1)', // brown color
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) { return value / 1e9 + 'B'; } // Format y-axis labels as 'B'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                datalabels: {
                    display: false // Hide data labels
                }
            }
        }
    });
}


// Function to render the pie chart (doughnut chart)
function renderPieChart(ctx, labels, data) {
    const totalSales = data.reduce((acc, item) => acc + item["SALE PRICE"], 0);
    const percentages = data.map(item => ((item["SALE PRICE"] / totalSales) * 100).toFixed(2));
    const salesNumbers = data.map(item => item["SALE PRICE"]);

    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: percentages,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                datalabels: {
                    formatter: (value, context) => {
                        return value + '%';
                    },
                    color: '#000',
                    labels: {
                        title: {
                            font: {
                                size: 9,
                                weight: 'bold'
                            }
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            const dataIndex = tooltipItem.dataIndex;
                            const percentage = tooltipItem.raw;
                            const salesNumber = salesNumbers[dataIndex].toLocaleString();
                            return `${tooltipItem.label}: ${percentage}% (Total Sales: ${salesNumber})`;
                        }
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}



// Function to aggregate sale prices by borough
function aggregateSalePricesByBorough(data) {
    const salePricesByBorough = {};

    data.forEach(item => {
        const borough = item.BOROUGH;
        const salePrice = item["SALE PRICE"];

        if (!salePricesByBorough[borough]) {
            salePricesByBorough[borough] = 0;
        }
        salePricesByBorough[borough] += salePrice;
    });

    return Object.entries(salePricesByBorough).map(([borough, salePrice]) => ({
        BOROUGH: borough,
        "SALE PRICE": salePrice
    }));
}

// Function to update stats
function updateStats(data) {
    const totalUnits = data.length;
    const residentialUnits = data.reduce((acc, item) => acc + item["RESIDENTIAL UNITS"],0);
    const commercialUnits = data.reduce((acc, item) => acc + item["COMMERCIAL UNITS"],0);

    document.getElementById("total-units").textContent = totalUnits.toLocaleString();
    document.getElementById("residential-units").textContent = residentialUnits.toLocaleString();
    document.getElementById("commercial-units").textContent = commercialUnits.toLocaleString();
}

// Add the ChartDataLabels plugin to the Chart.js library
Chart.register(ChartDataLabels);

// Fetch and render the charts immediately on page load
fetchJsonData();


