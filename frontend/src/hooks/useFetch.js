import { useState, useEffect } from 'react';
import { getAuthHeaders } from '../lib/auth';

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;

    setLoading(true);
    setError(null);
    const startTime = performance.now();

    fetch(url, {
      credentials: 'include',
      headers: {
        ...getAuthHeaders(),
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Network response was not ok');
        }

        // Measure user POV roundtrip time
        const duration = parseFloat((performance.now() - startTime).toFixed(2));
        const cacheStatus = res.headers.get('X-Cache-Status') || 'MISS';

        // Send latency report to backend (only for product retrieve requests)
        if (url.includes('/api/products') && !url.includes('report-latency')) {
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/report-latency`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders(),
            },
            credentials: 'include',
            body: JSON.stringify({
              url,
              duration,
              status: cacheStatus
            })
          }).catch(() => {});
        }

        return res.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setError(err);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
}

export default useFetch;
