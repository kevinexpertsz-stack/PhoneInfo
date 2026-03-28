import React, { useState, useEffect } from 'react';
import { Battery, BatteryCharging, BatteryWarning, BatteryFull, Zap } from 'lucide-react';

const BatteryView = () => {
  const [batteryData, setBatteryData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        if (!active) return;
        const updateData = () => {
          setBatteryData({
            level: Math.round(battery.level * 100),
            charging: battery.charging,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime,
          });
        };
        updateData();
        battery.addEventListener('chargingchange', updateData);
        battery.addEventListener('levelchange', updateData);
        battery.addEventListener('chargingtimechange', updateData);
        battery.addEventListener('dischargingtimechange', updateData);
        
        return () => {
          battery.removeEventListener('chargingchange', updateData);
          battery.removeEventListener('levelchange', updateData);
          battery.removeEventListener('chargingtimechange', updateData);
          battery.removeEventListener('dischargingtimechange', updateData);
        };
      }).catch(err => {
        if(active) setError("Battery API error or permissions denied.");
      });
    } else {
      setError("Battery Status API not supported on this browser (e.g. Safari, iOS, Firefox)");
    }
    return () => { active = false; };
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in mt-10 glass-panel rounded-3xl mx-4">
        <BatteryWarning size={48} className="text-muted mb-4 opacity-50" />
        <h2 className="text-xl font-semibold mb-2">Unavailable</h2>
        <p className="text-muted text-sm">{error}</p>
      </div>
    );
  }

  if (!batteryData) return null;

  const BatteryIcon = batteryData.charging ? BatteryCharging : (batteryData.level > 90 ? BatteryFull : Battery);
  const iconColor = batteryData.charging ? "text-emerald-500" : (batteryData.level < 20 ? "text-red-500" : "text-accent");
  const timeInfo = batteryData.charging 
    ? (batteryData.chargingTime === Infinity ? "Calculating..." : `${Math.round(batteryData.chargingTime / 60)} min until full`)
    : (batteryData.dischargingTime === Infinity ? "Calculating..." : `${Math.round(batteryData.dischargingTime / 60)} min remaining`);

  return (
    <div className="pb-4 animate-fade-in">
      <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-b from-accent/5 to-transparent glass-panel border border-border/50 rounded-3xl mb-6 shadow-sm mx-4 mt-2">
        <div className="relative">
          <BatteryIcon size={80} className={`${iconColor} transition-colors duration-500`} strokeWidth={1} />
          {batteryData.charging && (
            <div className="absolute inset-0 flex items-center justify-center animate-pulse">
               <Zap size={32} className="text-emerald-500 fill-emerald-500" />
            </div>
          )}
        </div>
        
        <h2 className="text-5xl font-bold font-inter tracking-tight mt-6 mb-2">
          {batteryData.level}%
        </h2>
        <p className={`text-sm font-medium px-3 py-1 rounded-full ${batteryData.charging ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-black/5 dark:bg-white/10 text-text'}`}>
          {batteryData.charging ? "Charging" : "Discharging"}
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-5 mb-4 mx-4">
        <div className="flex justify-between items-center py-3 border-b border-border/30 last:border-0">
          <span className="text-muted">Estimated Time</span>
          <span className="font-medium text-text">{timeInfo}</span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-border/30 last:border-0">
          <span className="text-muted">Battery Health</span>
          <span className="text-xs bg-bg px-2 py-1 rounded">Hidden (Web API Restriction)</span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-border/30 last:border-0">
          <span className="text-muted">Technology</span>
          <span className="text-xs bg-bg px-2 py-1 rounded">Hidden</span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-border/30 last:border-0">
          <span className="text-muted">Charge Cycle</span>
          <span className="text-xs bg-bg px-2 py-1 rounded">Hidden</span>
        </div>
      </div>
    </div>
  );
};

export default BatteryView;
