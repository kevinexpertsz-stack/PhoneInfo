import React, { useState, useEffect } from 'react';
import { Smartphone, Info, Calendar, Anchor, ShieldCheck, MapPin, Globe, Activity } from 'lucide-react';
import { getDeviceInfo } from '../utils/deviceInfo';

const SystemRow = ({ label, value, icon: Icon, highlight }) => (
  <div className="flex items-center justify-between py-3 border-b border-border/30 last:border-0 group hover:bg-black/5 dark:hover:bg-white/5 px-3 rounded-xl transition-colors cursor-default">
    <div className="flex items-center gap-3">
      {Icon && <Icon size={18} className="text-muted/70 group-hover:text-accent transition-colors" />}
      <span className="text-text font-medium">{label}</span>
    </div>
    <span className={`text-sm ${highlight ? 'text-accent font-semibold bg-accent/10 px-2 py-0.5 rounded text-right max-w-[50%] truncate' : 'text-muted text-right max-w-[50%] truncate'}`} title={value}>{value}</span>
  </div>
);

const SystemSection = ({ title, children }) => (
  <div className="glass-panel rounded-3xl p-1 mb-4 flex flex-col gap-1 overflow-hidden animate-fade-in pb-2">
    <h3 className="font-semibold text-sm text-accent uppercase tracking-wider px-4 pt-4 pb-2">{title}</h3>
    <div className="flex flex-col">
      {children}
    </div>
  </div>
);

const System = ({ data: fullData }) => {
  const data = fullData?.system;

  if (!data) return (
    <div className="animate-pulse space-y-4">
      <div className="flex flex-col items-center justify-center p-6 bg-border/20 glass-panel rounded-3xl mb-6">
        <div className="w-16 h-16 rounded-full bg-border/30 mb-3"></div>
        <div className="h-8 w-40 bg-border/30 rounded-lg mb-2"></div>
        <div className="h-4 w-24 bg-border/20 rounded-md"></div>
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="glass-panel rounded-3xl p-4 border border-border/20 space-y-3">
          <div className="h-4 w-24 bg-border/30 rounded"></div>
          <div className="space-y-2">
            <div className="h-6 w-full bg-border/10 rounded"></div>
            <div className="h-6 w-full bg-border/10 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="pb-4">
      {/* Device Header */}
      <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-accent/20 to-purple-500/20 glass-panel border border-border/50 rounded-3xl mb-6 shadow-sm shadow-accent/10">
        <div className="w-16 h-16 rounded-full bg-bg shadow-sm flex items-center justify-center mb-3">
          <Smartphone size={32} className="text-accent" />
        </div>
        <h2 className="text-2xl font-bold font-inter tracking-tight text-center">{data.deviceName}</h2>
        <p className="text-muted">{data.deviceModel}</p>
      </div>

      {/* Device Info */}
      <SystemSection title="Device Info">
        <SystemRow label="Model" value={data.deviceModel} icon={Smartphone} />
        <SystemRow label="Manufacturer" value={data.variant} icon={Anchor} />
        <SystemRow label="Architecture" value={data.architecture} icon={Info} />
      </SystemSection>

      {/* Operating System */}
      <SystemSection title="Operating System">
        <SystemRow label="OS Details" value={data.operatingSystem} highlight icon={Smartphone} />
        <SystemRow label="Build Number" value={data.build} icon={Info} />
        <SystemRow label="Kernel" value={data.kernel} icon={ShieldCheck} />
      </SystemSection>

      {/* Firmware / BIOS */}
      <SystemSection title="Firmware (BIOS)">
        <SystemRow label="BIOS Version" value={data.biosVersion} icon={Anchor} />
        <SystemRow label="BIOS Vendor" value={data.biosVendor} icon={Info} />
      </SystemSection>

      {/* Network Info */}
      <SystemSection title="Network">
        <SystemRow label="Local IPv4" value={data.network?.ip || "N/A"} icon={Globe} />
        <SystemRow label="MAC Address" value={data.network?.mac || "N/A"} icon={ShieldCheck} />
        <SystemRow label="Network Type" value={data.network?.type || "N/A"} icon={Info} />
        <SystemRow label="Link Speed" value={data.network?.speed || "N/A"} icon={Activity} />
      </SystemSection>

      {/* Settings & Config */}
      <SystemSection title="System Settings">
        <SystemRow label="Time Zone" value={data.timezone} icon={MapPin} />
        <SystemRow label="Language" value={data.language} icon={Globe} />
      </SystemSection>
    </div>
  );
};

export default System;
