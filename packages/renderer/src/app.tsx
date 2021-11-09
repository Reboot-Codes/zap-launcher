import React from 'react';
import './app.scss';
import { files } from './use/test-array';

export default function App() {
  const [results, setResults] = React.useState<string[]>([]);
  const handleQuery = (query: string) => {
    let localResults: string[] = [];
    files.forEach(value => {
      if (query.length > 0 && !localResults.includes(value) && localResults.length < 9) {
        if (value.toLowerCase().includes(query.toLowerCase())) {
          localResults.push(value);
        }
      }
    });
    setResults(localResults);
  }

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
            )
          })}
        </div>
      </div>
    </div>
  );
}
