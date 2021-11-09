import React from 'react';
import './app.scss';

const results = [
  "Hello1",
  "Hello2",
  "Hello3",
  "Hello4",
  "Hello5",
  "Hello6",
  "Hello7",
  "Hello8",
  "Hello9",
];

export default function App() {
  const [query, setQuery] = React.useState('')

  return (
    <div className="app">
      <div className="vite-glass">
        <input className="text-box" onChange={e => setQuery(e.target.value)} />
        <div className="results">
          {results.map(result => {
            return (
              <div className="result">
                {result}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
