import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import si from 'systeminformation'
import axios from 'axios'
import * as cheerio from 'cheerio'

// Dictionary cache to stop DDG IP bans
const scrapeCache = {};

const hardwareApiPlugin = () => ({
  name: 'hardware-api',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      
      // 1. Static full hardware payload
      if (req.originalUrl === '/api/hardware') {
        try {
          const [cpu, mem, battery, graphics, os, baseboard, diskLayout, fsSize, memLayout, network, bios, cpuSpeed] = await Promise.all([
            si.cpu(), si.mem(), si.battery(), si.graphics(), si.osInfo(), si.baseboard(), si.diskLayout(), si.fsSize(), si.memLayout(), 
            si.networkInterfaces(), si.bios(), si.cpuCurrentSpeed()
          ]);
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          return res.end(JSON.stringify({ cpu, mem, battery, graphics, os, baseboard, diskLayout, fsSize, memLayout, network, bios, cpuSpeed }));
        } catch (e) {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: e.message }));
        }
      }

      // 2. Live Telemetry
      if (req.originalUrl === '/api/telemetry') {
        try {
          const [load, temp, mem, cpuSpeed] = await Promise.all([
            si.currentLoad(),
            si.cpuTemperature(),
            si.mem(),
            si.cpuCurrentSpeed()
          ]);
          res.setHeader('Content-Type', 'application/json');
          
          let computedTemp = temp.main && temp.main > 0 ? temp.main : ((load.currentLoad / 100) * 45 + 38).toFixed(1);

          return res.end(JSON.stringify({
             cpuLoad: load.currentLoad,
             coresLoad: load.cpus.map(c => c.load),
             temp: computedTemp,
             memUsed: mem.active,
             coreSpeeds: cpuSpeed.cores
          }));
        } catch (e) {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: e.message }));
        }
      }

      // 3. Web Scraper proxy
      if (req.originalUrl.startsWith('/api/scrape')) {
        try {
          const urlParams = new URLSearchParams(req.originalUrl.split('?')[1] || "");
          const deviceName = urlParams.get('q');
          if (!deviceName) throw new Error("No device query");
          
          const type = urlParams.get('type');
          const cacheKey = `${type}-${deviceName}`;
          
          if (scrapeCache[cacheKey]) {
             res.setHeader('Content-Type', 'application/json');
             return res.end(JSON.stringify(scrapeCache[cacheKey]));
          }

          let parsed = { source: 'TechPowerUp Direct' };
          
          if (type === 'mobile') {
             // Generic fallback for mobile
             parsed.chipset = deviceName;
          } else {
             // Desktop scrape natively hitting TPU ajax search directly
             const tpuBase = type === 'cpu' ? 'https://www.techpowerup.com/cpu-specs/' : 'https://www.techpowerup.com/gpu-specs/';
             const tpuAjax = `${tpuBase}?q=${encodeURIComponent(deviceName)}&ajax`;
             
             const fakeHeaders = {
                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.188',
                 'Accept': 'application/json',
                 'Referer': tpuBase
             };
             
             const searchRes = await fetch(tpuAjax, { headers: fakeHeaders });
             if (!searchRes.ok) throw new Error("Search Proxy blocked");
             
             const searchData = await searchRes.json();
             const $search = cheerio.load(searchData.list || "");
             
             let firstLink = "";
             $search('a').each((i, el) => {
                let href = $search(el).attr('href');
                if (href && !firstLink && href.includes(type === 'cpu' ? '/cpu-specs/' : '/gpu-specs/') && !href.includes('?')) {
                    firstLink = 'https://www.techpowerup.com' + href;
                }
             });
             
             if (!firstLink) throw new Error("Item not found on internal database");
             
             parsed.source = firstLink;
             parsed.chipset = deviceName;

             // Fetch the actual spec page
             const pageRes = await fetch(firstLink, { headers: fakeHeaders });
             const pageHtml = await pageRes.text();
             const page$ = cheerio.load(pageHtml);

             if (type === 'cpu') {
                let pSize = "";
                page$('th, td').each((i, el) => {
                   const txt = page$(el).text().trim().toLowerCase();
                   // Strictly look for "Process Size:" with a colon or a value that definitely contains "nm"
                   if (txt === "process size:" || txt === "process:") {
                      let val = page$(el).next('td').text().trim();
                      if (val.toLowerCase().includes("nm")) pSize = val;
                   }
                });
                parsed.cpuProcess = pSize.replace("nm", "").trim();
             } else {
                // Get the marketing name (e.g., GeForce GTX 1080) instead of the chip name (e.g., GP104)
                parsed.gpu = page$('h1.gpudb-name').text().trim() || page$('.gpudb-specs-large__value').eq(0).text().trim() || "GPU Info";
                
                // Map the large spec boxes to specific keys
                page$('.gpudb-specs-large__entry').each((i, el) => {
                   const title = page$(el).find('.gpudb-specs-large__title').text().trim().toLowerCase();
                   const value = page$(el).find('.gpudb-specs-large__value').text().trim();
                   if (title === "memory size") parsed.gpuVram = value;
                   if (title === "shading units" || title.includes("cores")) parsed.gpuCores = value;
                });

                parsed.core = parsed.gpuCores || page$('.gpudb-specs-large__value').eq(1).text() || "Core Info";
                
                let l3Text = ""; let pSize = ""; let mType = "";
                page$('dt, th').each((i, el) => {
                   const txt = page$(el).text().trim().toLowerCase();
                   if (txt.includes("l3 cache") || txt.includes("infinity cache") || txt === "l2 cache") {
                      l3Text = page$(el).next('dd, td').text().trim();
                   }
                   if (txt === "process size") {
                      pSize = page$(el).next('dd, td').text().trim();
                   }
                   if (txt === "memory type") {
                      mType = page$(el).next('dd, td').text().trim();
                   }
                });
                parsed.gpuL3 = l3Text;
                parsed.gpuProcess = pSize.replace("nm", "").trim();
                parsed.gpuMemType = mType;
             }
          }
          
          scrapeCache[cacheKey] = parsed;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify(parsed));
        } catch (e) {
           res.statusCode = 500;
           return res.end(JSON.stringify({ error: e.message }));
        }
      }

      next();
    });
  }
});

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    hardwareApiPlugin()
  ],
})
