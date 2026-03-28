import { useState, useEffect } from 'react';

export const useScraper = (cpuModel, gpuModel, isMobile) => {
  const [scrapedData, setScrapedData] = useState({ cpu: null, gpu: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cpuModel && !gpuModel) return;

    let active = true;

    const fetchScrape = async () => {
      setLoading(true);
      try {
        if (isMobile) {
          // Mobile scrape is generic device-based (GSMArena)
          const res = await fetch(`/api/scrape?type=mobile&q=${encodeURIComponent(cpuModel)}`);
          if (res.ok && active) {
            const data = await res.json();
            setScrapedData(data);
          }
        } else {
          // Clean strings for TechPowerUp Desktop scraping
          const cleanCpu = cpuModel ? cpuModel.replace(/™|®|©| CPU/g, '').replace(/ @.*/g, '').trim() : '';
          const cleanGpu = gpuModel ? gpuModel.replace(/™|®|©/g, '').replace(/ Graphics.*/i, '').trim() : '';

          // Desktop scrape parallel fetches for CPU and GPU
          const [cpuRes, gpuRes] = await Promise.all([
            cleanCpu && !cleanCpu.includes("Unknown") ? fetch(`/api/scrape?type=cpu&q=${encodeURIComponent(cleanCpu)}`) : Promise.resolve(null),
            cleanGpu && !cleanGpu.includes("Unknown") ? fetch(`/api/scrape?type=gpu&q=${encodeURIComponent(cleanGpu)}`) : Promise.resolve(null)
          ]);

          let payload = { cpu: null, gpu: null };
          if (cpuRes && cpuRes.ok && active) {
            payload.cpu = await cpuRes.json();
          }
          if (gpuRes && gpuRes.ok && active) {
            payload.gpu = await gpuRes.json();
          }

          if (active) setScrapedData(payload);
        }
      } catch (e) {
        // Scrape unavailable or blocked
      } finally {
        if (active) setLoading(false);
      }
    };
    
    fetchScrape();

    return () => { active = false; };
  }, [cpuModel, gpuModel, isMobile]);

  return { scrapedData, loading };
};
