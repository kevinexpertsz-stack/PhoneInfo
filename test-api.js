const si = require('systeminformation');
async function test() {
  try {
    const [cpu, mem, battery, graphics, os, baseboard, diskLayout] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.battery(),
      si.graphics(),
      si.osInfo(),
      si.baseboard(),
      si.diskLayout()
    ]);
    console.log("Success! Data preview:", {
       cpu: { brand: cpu.brand, cache: cpu.cache },
       battery: { hasBattery: battery.hasBattery },
       disk: diskLayout[0] && diskLayout[0].type
    });
  } catch (e) {
    console.error("Sysinfo error:", e);
  }
}
test();
