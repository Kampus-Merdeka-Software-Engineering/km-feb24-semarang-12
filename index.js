fetch('data.json')
    .then(response => response.json())
    .then(data => {
        // Extract relevant information
        const saleData = aggregateSalePricesByBorough(data);

        const boroughs = saleData.map(item => item.BOROUGH);
        const salePrices = saleData.map(item => item["SALE PRICE"]);

        // Create the chart
        const ctx = document.getElementById('salePriceChart').getContext('2d');
        const salePriceChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: boroughs,
                datasets: [{
                    label: 'SALE PRICE',
                    data: salePrices,
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
    })
    .catch(error => console.error('Error fetching data:', error));

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
