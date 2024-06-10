// Fetch the JSON data and render charts
let totalUnitsChart;
let unitSalesChart;
let saleTrendChart;

async function fetchJsonData(year = null, boroughs = [], isFiltered = false) {
    try {
        // Fetch data from the JSON file
        const response = await fetch('dataFull.json');
        const data = await response.json();

        // Filter data by year if a specific year is selected
        let filteredData = data;
        if (year) {
            filteredData = filteredData.filter(row => row["SALE YEAR"] === Number(year));
        }

        // Filter data by boroughs if specific boroughs are selected
        if (boroughs.length > 0) {
            filteredData = filteredData.filter(row => boroughs.includes(row["BOROUGH"]));
        }

        // Aggregate and sort the sale prices by borough
        const saleData = aggregateSalePricesByBorough(filteredData).sort((a, b) => b["SALE PRICE"] - a["SALE PRICE"]);

        // Extract borough names and sale prices
        const boroughNames = saleData.map(item => item["BOROUGH"]);
        const salePrices = saleData.map(item => item["SALE PRICE"]);

        // Get unique years from the data and sort them
        const yearOptions = Array.from(new Set(data.map(row => row["SALE YEAR"]))).sort();

        // Populate the year dropdown if not filtered by year
        populateYearDropdown(yearOptions, !year);

        // Populate borough checkboxes if not already populated
        populateBoroughCheckboxes(data);

        // Update statistics
        updateStats(filteredData);

        // Render charts
        renderCharts(isFiltered, boroughNames, salePrices, filteredData);

        // Calculate total units by borough for the doughnut chart
        const totalUnitsByBorough = filteredData.reduce((acc, curr) => {
            if (acc[curr.BOROUGH]) {
                acc[curr.BOROUGH] += curr["TOTAL UNITS"];
            } else {
                acc[curr.BOROUGH] = curr["TOTAL UNITS"];
            }
            return acc;
        }, {});

        // Prepare data for the doughnut chart
        const labels = Object.keys(totalUnitsByBorough);
        const totalUnits = Object.values(totalUnitsByBorough);

        // Destroy the previous doughnut chart if it exists
        if (totalUnitsChart) {
            totalUnitsChart.destroy();
        }

        // Render Doughnut Chart for total units
        const ctx = document.getElementById('propertyUnitChart').getContext('2d');
        totalUnitsChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: totalUnits,
                    backgroundColor: [
                        'rgba(139, 69, 19, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(134, 214, 170, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(223, 217, 84, 0.6)',
                    ],
                    borderColor: [
                        'rgba(139, 69, 19, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(134, 214, 170, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(223, 217, 84, 1)',
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                const value = tooltipItem.raw;
                                const percentage = ((value / totalUnits.reduce((a, b) => a + b, 0)) * 100).toFixed(2);
                                return `${tooltipItem.label}: ${percentage}% (Total Units: ${value})`;
                            }
                        }
                    },
                    datalabels: {
                        formatter: (value, ctx) => {
                            const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(2) + "%";
                            return percentage;
                        },
                        color: '#000',
                        labels: {
                            title: {
                                font: {
                                    size: '14',
                                    weight: 'bold'
                                }
                            }
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });

        // Call the renderStackedLineChart function here
        renderStackedLineChart(filteredData);

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Populate the year dropdown with options
function populateYearDropdown(yearOptions, shouldPopulate) {
    const yearElement = document.getElementById("year");

    if (shouldPopulate && yearElement.options.length <= 1) {
        yearOptions.forEach(year => {
            const option = document.createElement("option");
            option.value = year;
            option.text = year;
            yearElement.appendChild(option);
        });

        // Add event listener to filter by year on change
        yearElement.addEventListener("change", filterByYear);
    }
}

// Populate borough checkboxes with options
function populateBoroughCheckboxes(data) {
    const boroughOptions = Array.from(new Set(data.map(row => row.BOROUGH)));
    const boroughContainer = document.getElementById("boroughs");

    if (boroughContainer.children.length === 0) {
        boroughOptions.forEach(borough => {
            const label = document.createElement("label");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = borough;
            checkbox.name = "borough";
            checkbox.addEventListener("change", filterByBorough);
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(borough));
            boroughContainer.appendChild(label);
        });
    }
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

// Function to render all charts
function renderCharts(isFiltered, boroughNames, salePrices, data) {
    const chartElement = document.getElementById("chart");

    // Render or update bar chart
    const salePriceCtx = createOrUpdateCanvas(chartElement, 'salePriceChart', isFiltered);
    renderBarChart(salePriceCtx, boroughNames, salePrices);

    // Render or update stacked bar chart for 2016 and 2017
    const stackedSaleComparisonCtx = createOrUpdateCanvas(chartElement, 'stackedSaleComparisonChart', isFiltered);
    renderStackedBarChart(stackedSaleComparisonCtx, data.filter(row => [2016, 2017].includes(row["SALE YEAR"])), boroughNames);
}

// Create or update canvas element for chart
function createOrUpdateCanvas(parentElement, canvasId, shouldUpdate) {
    if (shouldUpdate) {
        const oldCanvas = document.getElementById(canvasId);
        oldCanvas.remove();
        const newCanvas = document.createElement("canvas");
        newCanvas.id = canvasId;
        parentElement.querySelector(`.${canvasId}`).appendChild(newCanvas);
        return newCanvas.getContext('2d');
    } else {
        return document.getElementById(canvasId).getContext('2d');
    }
}

// Function to render the bar chart
function renderBarChart(ctx, labels, data) {
    new Chart(ctx, {
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

// Function to render the stacked bar chart
function renderStackedBarChart(ctx, filteredData, boroughs) {
    const years = Array.from(new Set(filteredData.map(row => row["SALE YEAR"])));
    const aggregatedData = years.map(year => aggregateSalePricesByBorough(filteredData.filter(row => row["SALE YEAR"] === year)));

    const datasets = years.map((year, index) => ({
        label: year,
        data: boroughs.map(borough => {
            const saleData = aggregatedData[index].find(row => row["BOROUGH"] === borough);
            return saleData ? saleData["SALE PRICE"] : 0;
        }),
        backgroundColor: index % 2 === 0 ? 'rgba(223, 217, 84, 0.6)' : 'rgba(139, 69, 19, 0.6)',
        borderColor: index % 2 === 0 ? 'rgba(223, 217, 84, 1)' : 'rgba(139, 69, 19, 1)',
        borderWidth: 1
    }));

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: boroughs,
            datasets: datasets
        },
        options: {
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true,
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

// Function to render the stacked line chart for dataFull.json
function renderStackedLineChart(data) {
    if (unitSalesChart) {
                unitSalesChart.destroy();
            }
    const ctx = document.getElementById('unitSalesChart').getContext('2d');

    // Convert sale date from numerical format to proper date and determine the quarter
    const parseDate = (date) => {
        const epoch = new Date(1900, 0, 1);
        epoch.setDate(epoch.getDate() + date - 2); // Excel's epoch starts on January 1, 1900, and Excel incorrectly considers 1900 a leap year
        return epoch;
    };

    const getQuarter = (date) => {
        const month = date.getMonth() + 1; // Months are 0-indexed in JavaScript
        return Math.ceil(month / 3);
    };

    // Aggregate data by quarter and unit type
    const aggregatedData = data.reduce((acc, curr) => {
        const date = parseDate(curr["SALE DATE"]);
        const year = date.getFullYear();
        const quarter = `Q${getQuarter(date)}`;
        const key = `${year}-${quarter}`;
        if (!acc[key]) {
            acc[key] = { yearQuarter: key, residential: 0, commercial: 0 };
        }
        acc[key].residential += curr["RESIDENTIAL UNITS"];
        acc[key].commercial += curr["COMMERCIAL UNITS"];
        return acc;
    }, {});

    const sortedData = Object.values(aggregatedData).sort((a, b) => a.yearQuarter.localeCompare(b.yearQuarter));

    const labels = sortedData.map(item => item.yearQuarter);
    const residentialData = sortedData.map(item => item.residential);
    const commercialData = sortedData.map(item => item.commercial);
    
//function to render the stacked line chart
    unitSalesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Residential Units',
                data: residentialData,
                borderColor: 'rgba(166, 159, 78, 0.6)',
                backgroundColor: 'rgba(223, 217, 84, 1)',
                fill: false
            }, {
                label: 'Commercial Units',
                data: commercialData,
                borderColor: 'rgba(139, 69, 19, 0.6)',
                backgroundColor: 'rgba(139, 69, 19, 1)',
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    beginAtZero: true,
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

//Prepa




// Function to update statistics
function updateStats(data) {
    const totalUnits = data.reduce((acc, item) => acc + item["TOTAL UNITS"], 0);
    const totalSale = data.reduce((acc, item) => acc + item["SALE PRICE"], 0);
    const residentialUnits = data.reduce((acc, item) => acc + item["RESIDENTIAL UNITS"], 0);
    const commercialUnits = data.reduce((acc, item) => acc + item["COMMERCIAL UNITS"], 0);

    document.getElementById("total-units").textContent = totalUnits.toLocaleString();
    document.getElementById("total-sale").textContent = totalSale.toLocaleString();
    document.getElementById("residential-units").textContent = residentialUnits.toLocaleString();
    document.getElementById("commercial-units").textContent = commercialUnits.toLocaleString();
}

// Add the ChartDataLabels plugin to the Chart.js library
Chart.register(ChartDataLabels);

// Fetch and render the charts immediately on page load
fetchJsonData();
