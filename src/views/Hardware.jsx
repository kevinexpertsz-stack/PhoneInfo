import React, { useState, useEffect } from 'react';
import { Cpu, Maximize, Smartphone, Fingerprint, Zap, Wind, HardDrive } from 'lucide-react';
import { getDeviceInfo } from '../utils/deviceInfo';
import { useScraper } from '../utils/useScraper';
import { useTelemetry } from '../utils/useTelemetry';

const HardwareSection = ({ title, icon: Icon, children }) => (
  <div className="glass-panel rounded-3xl p-5 mb-4 animate-fade-in relative overflow-hidden">
    <div className="flex items-center gap-3 mb-4 border-b border-border/50 pb-3">
      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
        <Icon size={18} />
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
    </div>
    
    <div className="text-sm space-y-2">
      {children}
    </div>
  </div>
);

const DetailRow = ({ label, value, highlight }) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-muted">{label}</span>
    <span className={`font-medium ${highlight ? 'text-accent' : 'text-text'} text-right max-w-[60%] truncate`} title={value}>{value}</span>
  </div>
);

const Hardware = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    getDeviceInfo().then(res => setData(res));
  }, []);

  const isMobile = data?.system?.deviceModel?.toLowerCase().includes('mobile') || data?.system?.deviceModel?.toLowerCase().includes('tablet');
  const { scrapedData } = useScraper(
    isMobile ? data?.system?.deviceName : data?.hardware?.processor?.model,
    isMobile ? null : data?.hardware?.gpu?.model,
    isMobile
  );
  
  // Use telemetry for live GPU power/fans if available
  const telemetry = useTelemetry(1500);

  if (!data) return null;

  return (
    <div className="pb-4">
      {/* Processor Section */}
      <HardwareSection title="Processor" icon={Cpu}>
        <div className="flex justify-between items-end mb-4 bg-black/5 dark:bg-white/5 rounded-xl p-3">
          <div>
            <div className="font-semibold text-lg text-text">{scrapedData.cpu?.chipset || data.hardware.processor.brand}</div>
            <div className="text-muted text-sm">{data.hardware.processor.model}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4 text-center">
          <div className="bg-bg rounded-lg p-2"><span className="block font-semibold text-text uppercase">{data.hardware.processor.cores}</span><span className="text-[10px] text-muted uppercase tracking-wider font-medium">Cores</span></div>
          <div className="bg-bg rounded-lg p-2"><span className="block font-semibold text-text uppercase">{data.hardware.processor.threads}</span><span className="text-[10px] text-muted uppercase tracking-wider font-medium">Threads</span></div>
          <div className="bg-bg rounded-lg p-2"><span className="block font-semibold text-text uppercase">{scrapedData.cpu?.cpuProcess || data.hardware.processor.process}</span><span className="text-[10px] text-muted uppercase tracking-wider font-medium">Process (nm)</span></div>
          <div className="bg-bg rounded-lg p-2"><span className="block font-semibold text-text uppercase">{data.hardware.processor.architecture}</span><span className="text-[10px] text-muted uppercase tracking-wider font-medium">Architecture</span></div>
        </div>
        
        <div className="space-y-1 mt-4">
          <DetailRow label="L1 Cache" value={data.dashboard.cpu.l1Cache} />
          <DetailRow label="L2 Cache" value={data.dashboard.cpu.l2Cache} />
          <DetailRow label="L3 Cache" value={data.dashboard.cpu.l3Cache} />
          <DetailRow label="Instruction Sets" value={data.dashboard.cpu.flags && Array.isArray(data.dashboard.cpu.flags) ? data.dashboard.cpu.flags.slice(0, 8).join(', ').toUpperCase() : "N/A"} />
        </div>
      </HardwareSection>

      {/* GPU Section */}
      <HardwareSection title="GPU" icon={Maximize}>
         <div className="flex justify-between items-end mb-4 bg-black/5 dark:bg-white/5 rounded-xl p-3">
          <div>
            <div className="font-semibold text-lg text-text truncate max-w-xs" title={scrapedData.gpu?.gpu || data.hardware.gpu.model}>
               {scrapedData.gpu?.gpu || data.hardware.gpu.model}
            </div>
            <div className="text-muted text-sm">{data.hardware.gpu.technology}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 text-center text-[13px] mb-4">
           <div className="bg-bg rounded-lg py-2"><span className="block font-semibold px-1 truncate uppercase">{scrapedData.gpu?.gpuVram || "N/A"}</span><span className="text-[10px] text-muted uppercase tracking-wider font-medium">VRAM</span></div>
           <div className="bg-bg rounded-lg py-2"><span className="block font-semibold px-1 truncate uppercase">{scrapedData.gpu?.gpuCores || data.hardware.gpu.cores}</span><span className="text-[10px] text-muted uppercase tracking-wider font-medium">CUDA Cores</span></div>
           <div className="bg-bg rounded-lg py-2"><span className="block font-semibold uppercase">{scrapedData.gpu?.gpuProcess || "N/A"}</span><span className="text-[10px] text-muted uppercase tracking-wider font-medium">Process</span></div>
           <div className="bg-bg rounded-lg py-2"><span className="block font-semibold px-1 truncate uppercase">{scrapedData.gpu?.gpuMemType || "GDDR"}</span><span className="text-[10px] text-muted uppercase tracking-wider font-medium">Type</span></div>
           <div className="bg-bg rounded-lg py-2"><span className="block font-semibold uppercase">{data.hardware.gpu.bus}</span><span className="text-[10px] text-muted uppercase tracking-wider font-medium">Bus</span></div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
           <div className="flex items-center gap-3 bg-bg/50 p-3 rounded-2xl border border-border/30">
              <Zap size={16} className="text-yellow-500" />
              <div>
                <div className="text-[10px] text-muted uppercase font-bold">Power Draw</div>
                <div className="font-semibold text-text">{telemetry?.gpuUsage || "API Pending"}W</div>
              </div>
           </div>
           <div className="flex items-center gap-3 bg-bg/50 p-3 rounded-2xl border border-border/30">
              <Wind size={16} className="text-cyan-500" />
              <div>
                <div className="text-[10px] text-muted uppercase font-bold">Fan Speed</div>
                <div className="font-semibold text-text">{telemetry?.gpuFan || "0"}%</div>
              </div>
           </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-border/30">
           <DetailRow label="Video Driver" value={data.hardware.gpu.driver || "N/A"} />
           <DetailRow label="VRAM Status" value={data.hardware.gpu.vramUsed ? `${data.hardware.gpu.vramUsed}MB / ${data.hardware.gpu.vramTotal}MB` : "N/A"} />
        </div>
      </HardwareSection>

      {/* Display Section */}
      <HardwareSection title="Display" icon={Smartphone}>
        <div className="flex justify-between bg-accent/5 p-3 rounded-xl border border-accent/10 mb-3 hover:bg-accent/10 transition-colors">
          <div>
            <div className="font-semibold text-text">{data.hardware.display.brand}</div>
            <div className="text-sm text-accent uppercase tracking-tighter font-bold">{data.hardware.display.type} PANEL</div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-text">{scrapedData.cpu?.displayRes || data.hardware.display.resolution}</div>
            <div className="text-sm text-muted">{data.hardware.display.refreshRate} • {data.hardware.display.ppi}</div>
          </div>
        </div>

        <DetailRow label="Physical Screen Size" value={data.hardware.display.physicalSize} highlight />
        <DetailRow label="Color Depth" value={data.hardware.display.bitDepth} />
        <DetailRow label="Aspect Ratio" value={data.hardware.display.aspectRatio} />
        <DetailRow label="HDR Support" value={data.hardware.display.hdrSupport} />
      </HardwareSection>

      {/* Storage Section (Expanded) */}
      <HardwareSection title="Storage Hardware" icon={HardDrive}>
         <div className="flex items-center gap-3 bg-accent/5 p-3 rounded-xl border border-accent/10 mb-3">
             <div className="w-10 h-10 rounded-lg bg-bg flex items-center justify-center text-accent">
                <HardDrive size={20} />
             </div>
             <div>
                <div className="font-semibold text-text">{data.dashboard.storage.type} Drive</div>
                <div className="text-xs text-muted">Primary System Partition (C:)</div>
             </div>
         </div>
         <DetailRow label="Capacity" value={data.dashboard.storage.romCapacity} />
         <DetailRow label="Used Space" value={data.dashboard.storage.used + " GB"} />
      </HardwareSection>

      {/* Other Features */}
      {Object.values(data.hardware.other).some(v => v) && (
        <HardwareSection title="Other Hardware Features" icon={Fingerprint}>
           <div className="grid grid-cols-2 gap-y-3 gap-x-4 pl-1 text-[13px]">
              {data.hardware.other.fingerprint && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center bg-emerald-500/20 text-emerald-500 text-[10px]">✓</div>
                  <span>Fingerprint</span>
                </div>
              )}
              {data.hardware.other.faceRecognition && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center bg-emerald-500/20 text-emerald-500 text-[10px]">✓</div>
                  <span>Face Recon/Hello</span>
                </div>
              )}
              {data.hardware.other.gps && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center bg-emerald-500/20 text-emerald-500 text-[10px]">✓</div>
                  <span>GPS Location</span>
                </div>
              )}
              {data.hardware.other.wifi && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center bg-emerald-500/20 text-emerald-500 text-[10px]">✓</div>
                  <span>Wi-Fi Network</span>
                </div>
              )}
           </div>
        </HardwareSection>
      )}
    </div>
  );
};

export default Hardware;
