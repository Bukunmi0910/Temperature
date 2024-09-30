// App.jsx
import React from 'react';
import AverageTemperatureChart from './weather';


const App = () => {
  return (
    <div>
      <h1>Temperature Data Visualization</h1>
      <br></br>
      <AverageTemperatureChart />
    </div>
  );
};

export default App;
