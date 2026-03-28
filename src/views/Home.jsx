import React from 'react';
import { LayoutDashboard, Cpu, HardDrive, BatteryCharging, Camera, Activity, LineChart, Info } from 'lucide-react';

const gridItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'hardware', label: 'Hardware', icon: Cpu },
  { id: 'system', label: 'System', icon: HardDrive },
  { id: 'battery', label: 'Battery', icon: BatteryCharging },
  { id: 'camera', label: 'Camera', icon: Camera },
  { id: 'sensors', label: 'Sensors', icon: Activity },
  { id: 'benchmark', label: 'Benchmark', icon: LineChart, badge: 'Beta' },
  { id: 'about', label: 'About', icon: Info },
];

const Home = ({ onNavigate }) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-4 pb-6 mt-2">
        {gridItems.map((item, index) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="group relative flex flex-col items-center justify-center p-6 gap-3 rounded-[2rem] glass-panel border border-border/50 hover:border-accent/30 active:scale-95 transition-all duration-300 overflow-hidden"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Background Gradient Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-accent shadow-sm group-hover:scale-110 group-hover:shadow-accent/20 transition-all duration-300">
              <item.icon size={26} strokeWidth={1.5} />
            </div>
            
            <span className="font-semibold text-text text-sm tracking-wide z-10">{item.label}</span>
            
            {item.badge && (
              <span className="absolute top-3 right-3 text-[9px] uppercase tracking-wider bg-accent/10 text-accent px-1.5 py-0.5 rounded border border-accent/20 z-10">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Home;
