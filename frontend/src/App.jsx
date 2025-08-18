import React, { useEffect, useState } from 'react';

export default function App() {
  const [apiMessage, setApiMessage] = useState('loading…');

  useEffect(() => {
    fetch('/api/ping')
      .then((r) => r.json())
      .then((data) => setApiMessage(data.message))
      .catch(() => setApiMessage('API not reachable'));
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>React + Vite Frontend</h1>
      <p>API says: <strong>{apiMessage}</strong></p>
    </div>
  );
}
