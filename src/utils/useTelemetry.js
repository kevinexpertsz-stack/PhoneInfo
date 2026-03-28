import { useState, useEffect } from 'react';

export const useTelemetry = (intervalMs = 1500) => {
  const [telemetry, setTelemetry] = useState(null);

  useEffect(() => {
    let interval;
    const fetchTelemetry = async () => {
      try {
        const res = await fetch('/api/telemetry');
        if (res.ok) {
          const data = await res.json();
          setTelemetry(data);
        }
      } catch (e) {
        // Telemetry endpoint unavailable (e.g. running statically off browser APIs)
        // Optionally fall back to simulated oscillating load, but for now just silence.
      }
    };
    
    // Initial fetch
    fetchTelemetry();
    interval = setInterval(fetchTelemetry, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return telemetry;
};
