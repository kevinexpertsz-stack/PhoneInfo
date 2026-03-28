async function test() {
  const res = await fetch('http://localhost:5173/api/hardware');
  const sys = await res.json();
  try {
     const diskTotal = sys.diskLayout.reduce((acc, disk) => acc + disk.size, 0);
     const formattedDisk = (diskTotal / (1024 ** 3)).toFixed(0);
     const primaryDisk = sys.diskLayout[0] || {};
     const totalMemGB = Math.round(sys.mem.total / (1024 ** 3));
     const usedMemGB = (sys.mem.active / (1024 ** 3)).toFixed(1);
     const primaryGpu = sys.graphics.controllers[0] || {};
     const primaryDisplay = sys.graphics.displays[0] || {};

     const ret = {
        dashboard: {
          cpu: {
            cores: Array.from({ length: sys.cpu.physicalCores || 4 }).map((_, i) => ({ name: `Core ${i}`, usage: "Live" }))
          }
        }
     };
     console.log("Passed mapping without throwing");
  } catch (e) {
     console.error("MAPPING CRASHED", e);
  }
}
test();
