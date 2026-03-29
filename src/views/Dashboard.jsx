import React, { useState, useEffect } from 'react';
import { Cpu, BatteryCharging, HardDrive, Database, MoreVertical, CheckCircle2, Activity, Zap } from 'lucide-react';
import { getDeviceInfo } from '../utils/deviceInfo';
import { useTelemetry } from '../utils/useTelemetry';
import { useScraper } from '../utils/useScraper';

const DashboardCard = ({ title, icon: Icon, stat, subStat, highlight, detailedInfo, isExpanded, onToggle }) => {
  return (
    <div className="glass-panel rounded-[2rem] p-5 flex flex-col gap-4 relative overflow-hidden transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Icon size={20} />
          </div>
          <span className="font-semibold text-lg uppercase tracking-tight">{title}</span>
        </div>
        <button onClick={onToggle} className="p-2 -mr-2 text-muted hover:text-text hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors group">
          <MoreVertical size={20} className={`transition-transform duration-300 ${isExpanded ? 'rotate-90 text-accent' : ''}`} />
        </button>
      </div>
      
      <div className="flex flex-col gap-1 z-10">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight">{stat}</span>
          <span className="text-muted text-sm font-medium uppercase">{highlight}</span>
        </div>
        <p className="text-sm text-muted">{subStat}</p>
      </div>
      
      <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-accent/10 rounded-full blur-2xl z-0"></div>

      <div className={`transition-all duration-500 overflow-hidden ${isExpanded ? 'max-h-[800px] opacity-100 mt-2 border-t border-border/50 pt-4' : 'max-h-0 opacity-0 m-0 p-0 border-transparent'}`}>
         {detailedInfo}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const telemetry = useTelemetry(1500);

  useEffect(() => {
    getDeviceInfo().then(res => setData(res));
  }, []);

  const isMobile = data?.system?.deviceModel?.toLowerCase().includes('mobile') || data?.system?.deviceModel?.toLowerCase().includes('tablet');
  const { scrapedData } = useScraper(
    isMobile ? data?.system?.deviceName : data?.hardware?.processor?.model,
    isMobile ? null : data?.hardware?.gpu?.model,
    isMobile
  );

  if (!data) return null;

  const toggleCard = (id) => {
    setExpandedCard(prev => prev === id ? null : id);
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-4">
      {/* Overview Head */}
      <div className="px-2 mb-4">
        <h2 className="text-3xl font-bold text-text tracking-tight">{data.system.deviceName}</h2>
        <div className="flex flex-col gap-1">
          <p className="text-muted text-sm font-medium mt-1">
            <span className="text-accent">{data.dashboard.cpu.model}</span> • <span>{data.system.operatingSystem}</span>
          </p>
          <div className="flex items-center gap-2 mt-2">
             <div className={`flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold rounded uppercase ${data.isNative ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>
                <Activity size={10} /> {data.isNative ? 'Pro Mode Active' : 'Lite Mode: Browser Sandbox'}
             </div>
             {data.isNative ? (
               <div className="text-[10px] text-muted font-bold uppercase tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded">
                  Status: Full Telemetry
               </div>
             ) : (
               <div className="text-[10px] text-orange-500/80 font-bold uppercase tracking-widest bg-orange-500/5 px-2 py-0.5 rounded flex items-center gap-1">
                  <Zap size={10} /> Running locally recommended
               </div>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CPU Card */}
        <DashboardCard 
          title="CPU" 
          icon={Cpu} 
          stat={telemetry ? `${Math.round(telemetry.cpuLoad)}%` : `${data.dashboard.cpu.usage}`} 
          highlight="Load"
          subStat={`${data.dashboard.cpu.coreCount} Cores • ${telemetry ? telemetry.temp : "N/A"}°C`}
          isExpanded={expandedCard === 'cpu'}
          onToggle={() => toggleCard('cpu')}
          detailedInfo={
            <div className="flex flex-col gap-4 text-sm text-text">
              <div className="grid grid-cols-2 gap-x-3 gap-y-3 mb-2">
                {(telemetry?.coresLoad || data.dashboard.cpu.cores).slice(0, 8).map((core, i) => {
                  const coreLoad = typeof core === 'object' ? 0 : core;
                  const coreSpeed = telemetry?.coreSpeeds?.[i] ? (telemetry.coreSpeeds[i] * 1000).toFixed(0) : "N/A";
                  return (
                    <div key={i} className="bg-bg/40 p-2 rounded-xl border border-border/30">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-muted uppercase font-bold">Core {i}</span>
                          <span className="text-[10px] text-accent font-mono">{Math.round(coreLoad)}%</span>
                       </div>
                       <div className="text-xs font-mono font-bold text-text">{coreSpeed} MHz</div>
                       <div className="h-1 w-full bg-border/30 rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-accent transition-all duration-500" style={{ width: `${coreLoad}%` }}></div>
                       </div>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-1.5 opacity-90 text-[13px] bg-bg/20 p-3 rounded-2xl border border-border/20">
                <div className="flex justify-between"><span>Instruction Sets</span> <span className="font-medium uppercase text-xs truncate max-w-[150px]">{data.dashboard.cpu.flags && Array.isArray(data.dashboard.cpu.flags) ? data.dashboard.cpu.flags.slice(0, 6).join(', ') : "N/A"}</span></div>
                <div className="flex justify-between"><span>L3 Cache</span> <span className="font-medium">{data.dashboard.cpu.l3Cache}</span></div>
                <div className="flex justify-between"><span>Avg Frequency</span> <span className="font-medium">{data.dashboard.cpu.speedAvg ? data.dashboard.cpu.speedAvg.toFixed(2) + " GHz" : "N/A"}</span></div>
              </div>
            </div>
          }
        />

        {/* Battery Card */}
        <DashboardCard 
          title="Battery" 
          icon={BatteryCharging} 
          stat={`${data.dashboard.battery.percentage}%`} 
          highlight="Level"
          subStat={`${data.dashboard.battery.status} • Health: ${data.dashboard.battery.health}`}
          isExpanded={expandedCard === 'battery'}
          onToggle={() => toggleCard('battery')}
          detailedInfo={
            <div className="flex flex-col gap-2 text-sm text-text opacity-90 text-[13px]">
              <div className="flex justify-between border-b border-border/30 pb-1"><span>Voltage</span> <span className="font-medium text-accent">{data.dashboard.battery.voltage} mV</span></div>
              <div className="flex justify-between border-b border-border/30 pb-1"><span>Designed Capacity</span> <span className="font-medium">{data.dashboard.battery.actualCapacity}</span></div>
              <div className="flex justify-between border-b border-border/30 pb-1"><span>Technology</span> <span className="font-medium">{data.dashboard.battery.technology}</span></div>
              <div className="flex justify-between"><span>Charge Cycles</span> <span className="font-medium">{data.dashboard.battery.chargeCycle}</span></div>
            </div>
          }
        />

        {/* RAM Card */}
        <DashboardCard 
          title="Memory" 
          icon={Database} 
          stat={telemetry ? `${(telemetry.memUsed / (1024**3)).toFixed(1)} GB` : data.dashboard.ram.usageText} 
          highlight="Used"
          subStat={`${data.dashboard.ram.total} GB Available • ${data.dashboard.ram.type}`}
          isExpanded={expandedCard === 'ram'}
          onToggle={() => toggleCard('ram')}
          detailedInfo={
            <div className="flex flex-col gap-2 text-sm text-text opacity-90 text-[13px]">
              <div className="flex justify-between border-b border-border/30 pb-1"><span>Total Capacity</span> <span className="font-medium">{data.dashboard.ram.capacity}</span></div>
              <div className="flex justify-between border-b border-border/30 pb-1"><span>Memory Type</span> <span className="font-medium uppercase">{data.dashboard.ram.type}</span></div>
              <div className="flex justify-between items-center text-xs text-muted mt-2">
                 <span>OS Active Memory</span>
                 <span className="font-mono text-text">{telemetry ? (telemetry.memUsed / (1024**3)).toFixed(2) : "0"} GB</span>
              </div>
            </div>
          }
        />

        {/* Storage Card */}
        <DashboardCard 
          title="Storage" 
          icon={HardDrive} 
          stat={`${data.dashboard.storage.used} GB`} 
          highlight="Used"
          subStat={`${data.dashboard.storage.total} GB Capacity • ${data.dashboard.storage.type}`}
          isExpanded={expandedCard === 'storage'}
          onToggle={() => toggleCard('storage')}
          detailedInfo={
            <div className="flex flex-col gap-2 text-sm text-text opacity-90 text-[13px]">
               <div className="relative h-2 w-full bg-border/40 rounded-full overflow-hidden mb-4 shadow-inner">
                  <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-purple-500 rounded-full transition-all duration-1000" style={{ width: `${(parseFloat(data.dashboard.storage.used) / parseFloat(data.dashboard.storage.total)) * 100}%` }}></div>
               </div>
              <div className="flex justify-between border-b border-border/30 pb-1"><span>Disk Interface</span> <span className="font-medium uppercase">{data.dashboard.storage.type}</span></div>
              <div className="flex justify-between border-b border-border/30 pb-1"><span>Primary Partition</span> <span className="font-medium">C: (NTFS)</span></div>
              <div className="flex justify-between items-center">
                <span>Removable Support</span> 
                {data.dashboard.storage.sdCardSupport ? <CheckCircle2 size={16} className="text-emerald-500" /> : <span className="text-muted text-xs uppercase font-bold">No SD Support</span>}
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default Dashboard;
