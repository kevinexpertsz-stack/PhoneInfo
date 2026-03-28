import React, { useState, useEffect } from 'react';
import { Compass, Rotate3d, Maximize, Target, Activity } from 'lucide-react';

const Sensors = () => {
  const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [motion, setMotion] = useState({ x: 0, y: 0, z: 0 });
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If standard browser without permission requirement
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission !== 'function') {
      window.addEventListener('deviceorientation', handleOrientation);
      window.addEventListener('devicemotion', handleMotion);
      setPermissionGranted(true);
    }
    
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, []);

  const handleOrientation = (event) => {
    setOrientation({
      alpha: Math.round(event.alpha) || 0,
      beta: Math.round(event.beta) || 0,
      gamma: Math.round(event.gamma) || 0,
    });
  };

  const handleMotion = (event) => {
    setMotion({
      x: (event.accelerationIncludingGravity.x || 0).toFixed(2),
      y: (event.accelerationIncludingGravity.y || 0).toFixed(2),
      z: (event.accelerationIncludingGravity.z || 0).toFixed(2),
    });
  };

  const requestAccess = async () => {
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permissionState = await DeviceOrientationEvent.requestPermission();
        if (permissionState === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
          window.addEventListener('devicemotion', handleMotion);
          setPermissionGranted(true);
        } else {
          setError("Permission denied by user.");
        }
      } else {
        // Fallback for browsers that don't need explicit request but might throw if blocked
        window.addEventListener('deviceorientation', handleOrientation);
        window.addEventListener('devicemotion', handleMotion);
        setPermissionGranted(true);
      }
    } catch (err) {
      setError("This device lacks hardware sensors or the browser blocked access.");
    }
  };

  return (
    <div className="pb-4 animate-fade-in px-4 mt-2">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
          <Activity size={20} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text">Live Sensors</h2>
          <p className="text-muted text-sm">Hardware Telemetry Readout</p>
        </div>
      </div>

      {!permissionGranted && !error ? (
        <div className="glass-panel p-8 rounded-3xl text-center space-y-6">
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto text-accent">
            <Compass size={40} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Sensor Access Required</h3>
            <p className="text-muted text-sm">
              To read live accelerometer and gyroscope data, your browser requires explicit permission.
            </p>
          </div>
          <button onClick={requestAccess} className="bg-accent hover:bg-accent/80 text-white font-semibold py-3 px-8 rounded-full transition-colors mx-auto block w-full active:scale-95 shadow-lg shadow-accent/30">
            Allow Access
          </button>
        </div>
      ) : error ? (
        <div className="glass-panel p-6 rounded-3xl text-center border-red-500/20 bg-red-500/5 text-red-500">
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Gyroscope / Orientation */}
          <div className="glass-panel p-5 rounded-[2rem] relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4 text-accent">
              <Rotate3d size={18} />
              <h3 className="font-semibold text-text">Gyroscope (Orientation)</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center relative z-10">
               <div className="bg-bg rounded-xl py-3 border border-border/50">
                 <span className="block text-2xl font-mono font-bold text-text">{orientation.alpha}°</span>
                 <span className="text-[10px] uppercase tracking-wider font-semibold text-muted">Z-Axis / Alpha</span>
               </div>
               <div className="bg-bg rounded-xl py-3 border border-border/50">
                 <span className="block text-2xl font-mono font-bold text-text">{orientation.beta}°</span>
                 <span className="text-[10px] uppercase tracking-wider font-semibold text-muted">X-Axis / Beta</span>
               </div>
               <div className="bg-bg rounded-xl py-3 border border-border/50">
                 <span className="block text-2xl font-mono font-bold text-text">{orientation.gamma}°</span>
                 <span className="text-[10px] uppercase tracking-wider font-semibold text-muted">Y-Axis / Gamma</span>
               </div>
            </div>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-accent/5 rounded-full blur-xl z-0 pointer-events-none"></div>
          </div>

          {/* Accelerometer */}
          <div className="glass-panel p-5 rounded-[2rem] relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4 text-purple-500">
              <Maximize size={18} />
              <h3 className="font-semibold text-text">Accelerometer (Gravity)</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center relative z-10">
               <div className="bg-purple-500/5 rounded-xl py-3 border border-border/50">
                 <span className="block text-xl font-mono font-bold text-text">{motion.x}</span>
                 <span className="text-[10px] uppercase tracking-wider font-semibold text-muted">X m/s²</span>
               </div>
               <div className="bg-purple-500/5 rounded-xl py-3 border border-border/50">
                 <span className="block text-xl font-mono font-bold text-text">{motion.y}</span>
                 <span className="text-[10px] uppercase tracking-wider font-semibold text-muted">Y m/s²</span>
               </div>
               <div className="bg-purple-500/5 rounded-xl py-3 border border-border/50">
                 <span className="block text-xl font-mono font-bold text-text">{motion.z}</span>
                 <span className="text-[10px] uppercase tracking-wider font-semibold text-muted">Z m/s²</span>
               </div>
            </div>
          </div>
          
          <div className="text-center text-xs text-muted/60 mt-4">
            Live telemetry feed active.
          </div>
        </div>
      )}
    </div>
  );
};

export default Sensors;
