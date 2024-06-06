$(document).ready(function() {
  // Fetch the JSON data
  $.getJSON('data.json', function(data) {
      // Extract unique years and boroughs
      const years = [...new Set(data.map(item => item["SALE YEAR"]))].sort();
      const boroughs = [...new Set(data.map(item => item["BOROUGH"]))].sort();

      // Populate year filter
      years.forEach(year => {
          $('#yearFilter').append(`<option value="${year}">${year}</option>`);
      });

      // Populate borough filter
      boroughs.forEach(borough => {
          $('#boroughFilter').append(`<option value="${borough}">${borough}</option>`);
      });

      // Initialize DataTable
      const table = $('#example').DataTable({
          data: data,
          columns: [
              { data: 'BOROUGH' },
              { data: 'NEIGHBORHOOD' },
              { data: 'BUILDING CLASS CATEGORY' },
              { data: 'ADDRESS' },
              { data: 'TOTAL UNITS' },
              { data: 'SALE PRICE' },
              { data: 'SALE YEAR' }
          ],

      });

      // Filter by year
      $('#yearFilter').on('change', function() {
          const selectedYear = $(this).val();
          table.column(10).search(selectedYear).draw();
      });

      // Filter by borough
      $('#boroughFilter').on('change', function() {
          const selectedBorough = $(this).val();
          table.column(0).search(selectedBorough).draw();
      });
  });
});
