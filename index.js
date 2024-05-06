// Define the data for the dashboard
const data = [
    { name: 'Halvino Panji', age: 21, city: 'Cilegon' },
    { name: 'Sarmida', age: 20, city: 'Medan' },
    { name: 'Fikri', age: 19, city: 'Los Angeles' },
    { name: 'Sharon', age: 18, city: 'Bali' }
  ];
  
  // Create the dashboard
  const dashboard = new Dashboard({
    container: '#dashboard',
    data: data,
    title: 'User Dashboard',
    widgets: [
      {
        type: 'table',
        options: {
          columns: ['name', 'age', 'city']
        }
      },
      {
        type: 'chart',
        options: {
          type: 'bar',
          x: 'city',
          y: 'age'
        }
      }
    ]
  });
  
  // Render the dashboard
  dashboard.render();