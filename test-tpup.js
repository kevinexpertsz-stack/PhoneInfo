const axios = require('axios');
const cheerio = require('cheerio');

(async () => {
    try {
        console.log("Fetching DDG...");
        const p1 = axios.get('https://html.duckduckgo.com/html/?q=site:techpowerup.com+NVIDIA+GeForce+GTX+1080', {
            headers: {'User-Agent': 'Mozilla/5.0'}
        });
        const p2 = axios.get('https://html.duckduckgo.com/html/?q=site:techpowerup.com+i7-3770', {
            headers: {'User-Agent': 'Mozilla/5.0'}
        });
        
        const [r1, r2] = await Promise.all([p1, p2]);
        
        const parseDDG = (data) => {
            const $ = cheerio.load(data);
            let firstLink = '';
            $('.result__url').each((i, el) => {
               const text = $(el).text().trim();
               if(text.includes('techpowerup.com') && !firstLink) {
                 firstLink = 'https://' + text.replace(/ /g, '');
               }
            });
            return firstLink;
        };
        const gpuLink = parseDDG(r1.data);
        const cpuLink = parseDDG(r2.data);
        console.log("Found GPU:", gpuLink);
        console.log("Found CPU:", cpuLink);
        
        const gpupage = await axios.get(gpuLink, {headers: {'User-Agent': 'Mozilla/5.0'}});
        const gpage$ = cheerio.load(gpupage.data);
        let gpSize = ''; let gmType = '';
        gpage$('dt, th').each((i, el) => {
            const txt = gpage$(el).text().trim().toLowerCase();
            if (txt === 'process size') gpSize = gpage$(el).next('dd, td').text().trim();
            if (txt === 'memory type') gmType = gpage$(el).next('dd, td').text().trim();
        });
        console.log("GPU process:", gpSize, " GPU Mem:", gmType);

        const cpupage = await axios.get(cpuLink, {headers: {'User-Agent': 'Mozilla/5.0'}});
        const cpage$ = cheerio.load(cpupage.data);
        let cpSize = '';
        cpage$('th, td').each((i, el) => {
            const txt = cpage$(el).text().trim().toLowerCase();
            if (txt === 'process size' || txt === 'process' || txt === 'production') {
                cpSize = cpage$(el).next('dd, td').text().trim() || cpage$(el).next().text().trim();
            }
        });
        console.log("CPU process:", cpSize);

    } catch(e) { console.error("ERR:", e.message) }
})();
