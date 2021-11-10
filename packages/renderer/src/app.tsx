import React from 'react';
import { files } from './use/test-array';
import { superOptions } from './use/super-options';

import './app.scss';

export default function App() {
  const [results, setResults] = React.useState<string[]>([]);

  const handleQuery = (query: string) => {
    const localResults: string[] = [];
    const allOptions = superOptions.concat(files);
    allOptions.forEach(option => {
      // Make sure that there is a query, no repeats, and cap the results to 9 total.
      if (query.length > 0 && !localResults.includes(option) && localResults.length < 9) {
        // Check if the option contains the query
        if (option.toLowerCase().includes(query.toLowerCase())) {
          // if it does, then add the option to the results
          localResults.push(option);
        }
      }
    });
    // Set the finished results to display in the results list
    setResults(localResults);
  };

  return (
    <div className="app">
      <div className="vite-glass">
        <input className="text-box" onChange={e => handleQuery(e.target.value)} />
        <div className="results">
          {results.map(result => {
            return (
              <div className="result" key={result}>
                {result}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
