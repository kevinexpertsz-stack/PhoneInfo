import { UAParser } from 'ua-parser-js';

const getBrowserTelemetry = async () => {
    const parser = new UAParser();
    const result = parser.getResult();
    
    const osName = result.os.name || 'Unknown OS';
    const osVersion = result.os.version || '';
    const operatingSystem = `${osName} ${osVersion}`.trim();
    const deviceModel = result.device.model || 'Unknown Device';
    const deviceVendor = result.device.vendor || result.browser.name || 'Unknown Vendor';
    const deviceType = result.device.type || 'Desktop/Laptop';
    
    // Better architecture detection
    let architecture = result.cpu.architecture || 'x64';
    if (navigator.userAgentData && navigator.userAgentData.platform === 'arm') architecture = 'ARM';
    
    // Better CPU Branding for browser mode (Stop "Edge Processor")
    let cpuBrand = result.os.name === 'Windows' ? 'Intel/AMD Processor' : `${deviceVendor} Processor`;
    if (architecture.includes('ARM') || (result.os.name === 'Mac OS' && architecture === 'arm64')) cpuBrand = 'Apple Silicon / ARM';

    const cores = navigator.hardwareConcurrency || 'N/A';
    const memory = navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'N/A (Hidden by browser)';
    
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          let rawGpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          gpuVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
          
          // Clean GPU name: Remove ANGLE, Direct3D, etc.
          gpuRenderer = rawGpu
            .replace(/ANGLE \((.*)\)/, '$1')
            .replace(/Direct3D11 vs_5_0 ps_5_0/, '')
            .split(',')[0]
            .trim();
        }
      }
    } catch(e) {}

    const width = window.screen.width * window.devicePixelRatio;
    const height = window.screen.height * window.devicePixelRatio;
    const resolution = `${Math.round(width)} x ${Math.round(height)}`;
    const isHDR = window.matchMedia('(dynamic-range: high)').matches ? 'HDR Supported' : 'SDR Only';
    const ppi = window.devicePixelRatio ? `~${Math.round(window.devicePixelRatio * 160)} PPI` : "N/A";

    let batteryData = {
      percentage: "N/A",
      status: "Hidden by browser (iOS/Safari) or Desktop",
      estimateTime: "N/A"
    };

    if ('getBattery' in navigator) {
      try {
        // Battery API can hang in some environments, so we wrap it
        const batteryPromise = navigator.getBattery();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Battery Timeout")), 1500));
        
        const battery = await Promise.race([batteryPromise, timeoutPromise]);
        
        batteryData.percentage = Math.round(battery.level * 100);
        batteryData.status = battery.charging ? "Charging" : "Discharging";
        batteryData.estimateTime = battery.charging 
          ? (battery.chargingTime === Infinity ? "Calculating..." : `${Math.round(battery.chargingTime / 60)} min full`)
          : (battery.dischargingTime === Infinity ? "Calculating..." : `${Math.round(battery.dischargingTime / 60)} min left`);
      } catch (e) {
        console.warn("Battery API unavailable or timed out:", e.message);
      }
    }

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown Timezone';
    const language = navigator.language || 'English';

    return {
      isNative: false,
      dashboard: {
        cpu: {
          usage: "N/A",
          idleStatus: "Browser Sandbox",
          temp: "N/A",
          cores: Array.from({ length: cores !== 'N/A' ? cores : 4 }).map((_, i) => ({ name: `Logical Core ${i+1}`, usage: "Hidden" })),
          model: cpuBrand,
          architecture: architecture,
          l1Cache: "N/A",
          l2Cache: "N/A",
          coreCount: cores,
          threadCount: cores,
        },
        battery: {
          percentage: batteryData.percentage,
          status: batteryData.status,
          estimateTime: batteryData.estimateTime,
          actualCapacity: "Unknown",
          technology: "Li-Ion",
          health: "Unknown",
          chargeCycle: "N/A",
          temp: "N/A"
        },
        ram: {
          used: "N/A",
          total: memory,
          capacity: memory,
          type: "Unknown",
          usageText: memory
        },
        storage: {
          used: "N/A",
          total: "N/A",
          romCapacity: "Restricted",
          type: "Unknown",
          sdCardSupport: false
        }
      },
      hardware: {
        processor: {
          brand: deviceVendor,
          model: "Detected via Browser",
          cores: cores,
          threads: cores,
          process: "N/A",
          architecture: architecture,
          configuration: [`${cores}x logical cores detected`]
        },
        gpu: {
          model: gpuRenderer,
          technology: gpuVendor,
          cores: "N/A",
          frequency: "N/A",
          bus: "N/A"
        },
        display: {
          brand: "Native Screen",
          type: "LCD/OLED",
          resolution: resolution,
          refreshRate: "Unknown API",
          ppi: ppi,
          aspectRatio: `${window.screen.width}:${window.screen.height}`,
          hdrSupport: isHDR,
          physicalSize: "N/A",
          bitDepth: "8-bit"
        },
        other: {
          fingerprint: window.PublicKeyCredential !== undefined,
          gps: "geolocation" in navigator,
          bluetooth: "bluetooth" in navigator,
          irisScanner: false,
          faceRecognition: false,
          wifi: true
        }
      },
      system: {
        deviceName: deviceModel !== 'Unknown Device' ? deviceModel : `${osName} System`,
        deviceModel: deviceType,
        manufacturingDate: "N/A",
        variant: deviceVendor,
        operatingSystem: operatingSystem,
        oneUiVersion: "N/A",
        architecture: architecture,
        securityUpdate: "N/A",
        launchedOs: result.browser.name || "Unknown Browser",
        currentRelease: operatingSystem,
        timezone: timezone,
        devOptions: "Restricted by browser",
        usbDebugging: "Restricted by browser",
        language: language
      }
    };
};

let globalCache = null;
let pendingPromise = null;

const fetchWithTimeout = async (resource, options = {}) => {
  const { timeout = 15000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, { ...options, signal: controller.signal });
  clearTimeout(id);
  return response;
};

export const getDeviceInfo = async () => {
   if (globalCache) return globalCache;
   if (pendingPromise) return pendingPromise;

   pendingPromise = (async () => {
     try {
       const res = await fetchWithTimeout('/api/hardware');
     if (!res.ok) throw new Error("Local backend not available");
     const sys = await res.json();
     
     // We successfully fetched deep Windows stats via Node.js
     
     // Parse disk size (Strictly C: Drive / Main Mount)
     let mainFs = sys.fsSize ? sys.fsSize.find(f => f.mount === 'C:\\' || f.mount === 'C:' || f.mount === '/') : null;
     if (!mainFs && sys.fsSize && sys.fsSize.length > 0) mainFs = sys.fsSize[0];

     const formattedDisk = mainFs ? (mainFs.size / (1024 ** 3)).toFixed(0) : (sys.diskLayout.reduce((acc, disk) => acc + disk.size, 0) / (1024 ** 3)).toFixed(0);
     const primaryDisk = sys.diskLayout[0] || {};
     const usedDisk = mainFs ? (mainFs.used / (1024 ** 3)).toFixed(0) : "N/A";
     
     // Parse exact RAM
     const totalMemGB = Math.round(sys.mem.total / (1024 ** 3));
     const usedMemGB = (sys.mem.active / (1024 ** 3)).toFixed(1);
     const memType = sys.memLayout && sys.memLayout[0] ? sys.memLayout[0].type : "DDR";

     // GPU
     const primaryGpu = sys.graphics.controllers[0] || {};
     
     // Display mapping
     const primaryDisplay = sys.graphics.displays[0] || {};
     const diagInches = primaryDisplay.sizeX ? (Math.sqrt(Math.pow(primaryDisplay.sizeX, 2) + Math.pow(primaryDisplay.sizeY, 2)) / 2.54).toFixed(1) : null;

     // Network mapping
     const primaryNet = sys.network ? (sys.network.find(n => n.default) || sys.network[0]) : {};

     return {
        isNative: true,
        dashboard: {
          cpu: {
            usage: "Live Backend",
            idleStatus: "Native Stats",
            temp: "N/A", // require root on windows sometimes
            cores: Array.from({ length: sys.cpu.physicalCores || 4 }).map((_, i) => ({ 
              name: `Core ${i}`, 
              usage: "Live",
              speed: sys.cpuSpeed?.cores?.[i] || 0
            })),
            model: sys.cpu.brand,
            architecture: "64-bit",
            l1Cache: sys.cpu.cache && sys.cpu.cache.l1d ? (sys.cpu.cache.l1d / 1024).toFixed(0) + " KB" : "256 KB",
            l2Cache: sys.cpu.cache && sys.cpu.cache.l2 ? (sys.cpu.cache.l2 / (1024 ** 2)).toFixed(0) + " MB" : "N/A",
            l3Cache: sys.cpu.cache && sys.cpu.cache.l3 ? (sys.cpu.cache.l3 / (1024 ** 2)).toFixed(0) + " MB" : "N/A",
            coreCount: sys.cpu.physicalCores,
            threadCount: sys.cpu.cores,
            speedAvg: sys.cpuSpeed?.avg || 0,
            flags: Array.isArray(sys.cpu.flags) ? sys.cpu.flags : (sys.cpu.flags?.split(' ') || [])
          },
          battery: {
             percentage: sys.battery.hasBattery ? sys.battery.percent : 100,
             status: sys.battery.hasBattery ? (sys.battery.isCharging ? "Charging" : "Discharging") : "AC Power",
             estimateTime: sys.battery.hasBattery ? (sys.battery.timeRemaining + " min left") : "Desktop Power",
             actualCapacity: sys.battery.hasBattery ? (sys.battery.maxCapacity + " mAh") : "N/A",
             technology: sys.battery.hasBattery ? sys.battery.type : "N/A",
             health: sys.battery.hasBattery ? (sys.battery.maxCapacity / sys.battery.designedCapacity * 100).toFixed(0) + "%" : "N/A",
             chargeCycle: sys.battery.hasBattery ? sys.battery.cycleCount : 0,
             temp: "N/A",
             voltage: sys.battery.voltage || 0
          },
          ram: {
            used: usedMemGB,
            total: totalMemGB,
            capacity: totalMemGB + " GB",
            type: memType,
            usageText: usedMemGB + " GB"
          },
          storage: {
            used: usedDisk !== "N/A" ? `${usedDisk}` : "Live",
            total: formattedDisk,
            romCapacity: formattedDisk + " GB",
            type: primaryDisk.type || "SSD/HDD",
            sdCardSupport: false
          }
        },
        hardware: {
          processor: {
            brand: sys.cpu.manufacturer,
            model: sys.cpu.brand,
            cores: sys.cpu.physicalCores,
            threads: sys.cpu.cores,
            process: "N/A",
            architecture: "64-bit",
            configuration: [`${sys.cpu.performanceCores || sys.cpu.physicalCores}x Performance Cores`, `${sys.cpu.efficiencyCores || 0}x Efficiency Cores`]
          },
          gpu: {
            model: primaryGpu.model || "Unknown GPU",
            technology: primaryGpu.vendor || "Unknown Vendor",
            cores: primaryGpu.vram ? `${primaryGpu.vram} MB` : "Integrated",
            frequency: "N/A",
            bus: primaryGpu.bus || "PCIe",
            cudaCores: "N/A"
          },
          display: {
            brand: primaryDisplay.vendor || "Native Display",
            type: primaryDisplay.connection || "Internal",
            resolution: `${primaryDisplay.resolutionX} x ${primaryDisplay.resolutionY}`,
            refreshRate: `${primaryDisplay.currentRefreshRate} Hz`,
            ppi: "Native",
            aspectRatio: "16:9",
            hdrSupport: "SDR Only",
            physicalSize: diagInches ? `${diagInches}"` : "N/A",
            bitDepth: primaryDisplay.pixelDepth + "-bit"
          },
          network: {
            ip: primaryNet.ip4 || "N/A",
            ip6: primaryNet.ip6 || "N/A",
            mac: primaryNet.mac || "N/A",
            speed: primaryNet.speed ? primaryNet.speed + " Mbps" : "N/A",
            type: primaryNet.type || "Unknown",
            dhcp: primaryNet.dhcp ? "Enabled" : "Disabled"
          },
          other: {
            fingerprint: false,
            gps: false,
            bluetooth: sys.os.hostname ? true : false,
            irisScanner: false,
            faceRecognition: false,
            wifi: true
          }
        },
        system: {
          deviceName: sys.os.hostname || "Windows PC",
          deviceModel: sys.baseboard.model || "Custom Rig",
          manufacturingDate: "N/A",
          variant: sys.baseboard.manufacturer || "Custom",
          operatingSystem: sys.os.distro || "Windows",
          oneUiVersion: sys.os.release || "N/A",
          architecture: sys.os.arch || "x64",
          securityUpdate: "N/A",
          launchedOs: "N/A",
          currentRelease: sys.os.build || "N/A",
          kernel: sys.os.kernel || "N/A",
          build: sys.os.build || "N/A",
          biosVersion: sys.bios.version || "N/A",
          biosVendor: sys.bios.vendor || "N/A",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown Timezone',
          devOptions: "Enabled",
          usbDebugging: "Enabled",
          language: navigator.language || 'English'
        }
     };

   } catch (e) {
     // Fallback to purely browser APIs when Node backend is absent (e.g., hosted on Vercel)
     return await getBrowserTelemetry();
   }
   })();

   globalCache = await pendingPromise;
   return globalCache;
};
