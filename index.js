// Fetch the JSON data
function fetchJsonData(year, isFilteredYear = false) {
    return fetch('data.json')
        .then(response => response.json())
        .then(data => {
            // Filtering the year data
            if (year) {
                data = data.filter((row) => row["SALE YEAR"] === Number(year));
            }

            // Aggregate and sort the sale prices by borough
            const saleData = aggregateSalePricesByBorough(data)
                .sort((a, b) => b["SALE PRICE"] - a["SALE PRICE"]);

            // Extract borough names and sale prices
            const boroughs = saleData.map(item => item.BOROUGH);
            const salePrices = saleData.map(item => item["SALE PRICE"]);

            // Get unique years from data and sort them
            const yearOptions = Array.from(new Set(data.map((row) => row["SALE YEAR"]))).sort();

            // Reference to the year dropdown element
            const yearElement = document.getElementById("year");

            // Populate the year dropdown if it is not filtered by year
            if (!year && yearElement.options.length > 0 && yearElement.options.length <= yearOptions.length) {
                for (let i = 0; i < yearOptions.length; i++) {
                    const option = document.createElement("option");
                    option.value = yearOptions[i];
                    option.text = yearOptions[i];
                    yearElement.appendChild(option);
                }

                // Add event listener to filter by year on change
                yearElement.addEventListener("change", filterByYear);
            }

            console.log({ data, saleData });

            // Create the chart
            const chartElement = document.getElementById("chart");

            if (isFilteredYear) {
                // Remove the old canvas and create a new one for the updated chart
                chartElement.removeChild(chartElement.lastElementChild);
                const newCtx = document.createElement("canvas");
                newCtx.id = "salePriceChart";
                newCtx["data-sort-year"] = true;
                chartElement.appendChild(newCtx);
                const ctx = document.getElementById('salePriceChart').getContext('2d');
                renderBarChart(ctx, boroughs, salePrices);
            } else {
                const ctx = document.getElementById('salePriceChart').getContext('2d');
                renderBarChart(ctx, boroughs, salePrices);
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Initial call to fetch JSON data
fetchJsonData();

// Event handler to filter data by selected year
function filterByYear() {
    const year = document.getElementById("year").value;
    fetchJsonData(year, true);
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
                        callback: function(value) { return value / 1e9 + 'B'; } // Format y-axis labels as 'B'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
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
