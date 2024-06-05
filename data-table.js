const tbody = document.getElementById('data-body');
const paginationContainer = document.getElementById('pagination');
const entriesSelect = document.getElementById('entries-select');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const sortOrderSelect = document.getElementById('sort-order');

let currentPage = 1;
let rowsPerPage = 20; // initial value
let totalPages = 0;
let currentData = [];

function populateTable(data, page) {
  tbody.innerHTML = ''; // clear table body

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, data.length);

  for (let i = startIndex; i < endIndex; i++) {
    const row = document.createElement('tr');
    const boroughCell = document.createElement('td');
    boroughCell.textContent = data[i].BOROUGH;
    row.appendChild(boroughCell);

    const neighborhoodCell = document.createElement('td');
    neighborhoodCell.textContent = data[i].NEIGHBORHOOD;
    row.appendChild(neighborhoodCell);

    const buildingClassCell = document.createElement('td');
    buildingClassCell.textContent = data[i]["BUILDING CLASS CATEGORY"];
    row.appendChild(buildingClassCell);

    const addressCell = document.createElement('td');
    addressCell.textContent = data[i].ADDRESS;
    row.appendChild(addressCell);

    const ownedCell = document.createElement('td');
    ownedCell.textContent = data[i]["OWNED BY"];
    row.appendChild(ownedCell);

    const priceCell = document.createElement('td');
    priceCell.textContent = data[i]["SALE PRICE"];
    row.appendChild(priceCell);

    const dateCell = document.createElement('td');
    dateCell.textContent = data[i]["SALE DATE"];
    row.appendChild(dateCell);

    tbody.appendChild(row);
  }

  updatePageInfo();
}

function createPagination(data) {
  totalPages = Math.ceil(data.length / rowsPerPage);
  updatePaginationButtons();
  generatePageButtons(data);
}

function updatePaginationButtons() {
  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPages;
}

function updatePageInfo() {
  document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages}`;
}

function searchTable(data, searchTerm) {
  return data.filter(item => 
      Object.values(item).some(value =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
  );
}

function sortTable(data, sortBy, order) {
  const sortedData = [...data];
  sortedData.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (order === 'asc') {
          return aValue > bValue ? 1 : -1;
      } else {
          return aValue < bValue ? 1 : -1;
      }
  });
  return sortedData;
}

function changeEntriesPerPage(newData, newRowsPerPage) {
    // Update data and rowsPerPage variables
    data = newData; // Assuming data is an array
    rowsPerPage = parseInt(newRowsPerPage);
    currentPage = 1; // Reset to first page when entries change
    createPagination(data); // Recalculate pagination with new entries
    populateTable(data, currentPage);
}

function generatePageButtons(data) {
  paginationContainer.innerHTML = '';

  const visiblePages = Math.min(5, totalPages); // Show max 5 pages
  const startIndex = Math.max(1, currentPage - Math.floor(visiblePages / 2));
  const endIndex = Math.min(startIndex + visiblePages - 1, totalPages);

  const prevButton = document.createElement('button');
  prevButton.textContent = 'Prev';
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      populateTable(data, currentPage);
      updatePageInfo();
      updatePaginationButtons();
      generatePageButtons(data);
    }
  });
  paginationContainer.appendChild(prevButton);

  for (let i = startIndex; i <= endIndex; i++) {
    const button = document.createElement('button');
    button.textContent = i;
    button.classList.add('page-button');

    if (i === currentPage) {
      button.classList.add('active');
    }

    button.addEventListener('click', () => {
      currentPage = i;
      populateTable(data, currentPage);
      updatePageInfo();
      updatePaginationButtons();
      generatePageButtons(data);
    });

    paginationContainer.appendChild(button);
  }

  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next';
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      populateTable(data, currentPage);
      updatePageInfo();
      updatePaginationButtons();
      generatePageButtons(data);
    }
  });
  paginationContainer.appendChild(nextButton);
}

function updatePageInfo() {
    const pageInfoElement = document.getElementById('page-info');
    if (pageInfoElement) {
      pageInfoElement.textContent = `Page ${currentPage} of ${totalPages}`;
    }
  }
  
fetch('data.json')
  .then(response => response.json())
  .then(data => {
    createPagination(data);
    populateTable(data, currentPage);

    // Entries dropdown functionality
    entriesSelect.addEventListener('change', () => {
      const newRowsPerPage = entriesSelect.value;
      changeEntriesPerPage(data,newRowsPerPage);
      createPagination(data); // Recalculate pagination with new entries
      populateTable(data, currentPage);
      updatePageInfo();
    });

    // Search functionality
    searchInput.addEventListener('input', () => {
      const searchTerm = searchInput.value;
      const filteredData = searchTable(currentData, searchTerm);
      createPagination(filteredData);
      populateTable(filteredData, currentPage);
  });

  // Sort functionality
  sortSelect.addEventListener('change', () => {
      const sortBy = sortSelect.value;
      const sortOrder = sortOrderSelect.value;
      if (sortBy) {
          const sortedData = sortTable(currentData, sortBy, sortOrder);
          createPagination(sortedData);
          populateTable(sortedData, currentPage);
      }
  });

  sortOrderSelect.addEventListener('change', () => {
      const sortBy = sortSelect.value;
      const sortOrder = sortOrderSelect.value;
      if (sortBy) {
          const sortedData = sortTable(currentData, sortBy, sortOrder);
          createPagination(sortedData);
          populateTable(sortedData, currentPage);
      }
  });
})
  .catch(error => console.error(error));
  