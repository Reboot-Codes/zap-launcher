import React from 'react';
import { files } from './use/test-array';
import { superOptions } from './use/super-options';
import type { option as optionType } from './types/option';

import './app.scss';

export default function App() {
  const [results, setResults] = React.useState<optionType[]>([]);

  const handleQuery = (query: string) => {
    const localResults: optionType[] = [];
    const allOptions: optionType[] = superOptions.concat(files);
    allOptions.forEach(option => {
      // Make sure that there is a query, no repeats, and cap the results to 9 total.
      if (query.length > 0 && !localResults.includes(option) && localResults.length < 9) {
        // Check if the option contains the query
        if (option.name.toLowerCase().includes(query.toLowerCase())) {
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
              <div className="result" key={result.name}>
                {result.name}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
