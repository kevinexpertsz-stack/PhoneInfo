import React, { useState, useEffect } from 'react';
import { Camera as CameraIcon, Mic, Video, ShieldAlert } from 'lucide-react';

const Camera = () => {
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDevices() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          setError("MediaDevices API not supported on this browser.");
          setLoading(false);
          return;
        }
        
        // This will only fetch labels if permission is granted, otherwise we just get IDs
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        setDevices(deviceList);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    fetchDevices();
  }, []);

  const requestPermission = async () => {
    try {
      // Requesting the feed forces the browser to ask for permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      // Stop the tracks immediately after so the light doesn't stay on
      stream.getTracks().forEach(track => track.stop());
      
      // Refetch devices now that permission is granted
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      setDevices(deviceList);
    } catch (err) {
      setError("Permission denied by user.");
    }
  };

  if (loading) return <div className="text-center p-10 animate-pulse text-muted">Checking available media devices...</div>;

  if (error) return (
     <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in mt-10 glass-panel rounded-3xl mx-4">
        <ShieldAlert size={48} className="text-red-500 mb-4 opacity-70" />
        <h2 className="text-xl font-semibold mb-2 text-text">Access Denied</h2>
        <p className="text-muted text-sm">{error}</p>
      </div>
  );

  const videoInputs = devices.filter(d => d.kind === 'videoinput');
  const audioInputs = devices.filter(d => d.kind === 'audioinput');
  const audioOutputs = devices.filter(d => d.kind === 'audiooutput');

  const needsPermissionBadge = devices.some(d => d.label === '');

  return (
    <div className="pb-4 animate-fade-in px-4 mt-2">
      {needsPermissionBadge && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-xl flex flex-col gap-3 mb-6 text-sm">
          <div className="flex items-start gap-3">
             <ShieldAlert size={20} className="shrink-0 mt-0.5" />
             <span>Device labels and precise lens names are hidden. Grant permissions to view exact hardware model names.</span>
          </div>
          <button onClick={requestPermission} className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-600 dark:text-amber-400 font-semibold py-2 px-4 rounded-lg w-full transition-colors mt-2">
            Ask for Permission
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
          <CameraIcon size={20} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text">Cameras</h2>
          <p className="text-muted text-sm">{videoInputs.length} Lenses Detected</p>
        </div>
      </div>

      <div className="space-y-3 mb-8">
        {videoInputs.length === 0 ? (
          <div className="p-4 rounded-2xl border border-border/50 text-center text-muted glass-panel italic">No cameras found.</div>
        ) : (
          videoInputs.map((device, idx) => (
            <div key={device.deviceId || idx} className="glass-panel p-4 rounded-2xl flex items-center gap-4 group hover:border-accent/30 transition-colors">
              <div className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center">
                <Video size={20} className="text-muted group-hover:text-accent transition-colors" />
              </div>
              <div>
                <div className="font-semibold text-text">{device.label || `Camera Module ${idx + 1}`}</div>
                <div className="text-xs text-muted font-mono truncate max-w-[200px]">ID: {device.deviceId || "Restricted"}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
          <Mic size={20} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text">Microphones</h2>
          <p className="text-muted text-sm">{audioInputs.length} Inputs Detected</p>
        </div>
      </div>

      <div className="space-y-3">
        {audioInputs.length === 0 ? (
          <div className="p-4 rounded-2xl border border-border/50 text-center text-muted glass-panel italic">No audio hardware found.</div>
        ) : (
          audioInputs.map((device, idx) => (
            <div key={device.deviceId || idx} className="glass-panel p-4 rounded-2xl flex items-center gap-4 group hover:border-purple-500/30 transition-colors">
              <div className="w-10 h-10 bg-black/5 dark:bg-white/5 text-muted rounded-full flex items-center justify-center">
                <Mic size={18} />
              </div>
              <div>
                <div className="font-semibold text-text text-sm">{device.label || `Audio Input ${idx + 1}`}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Camera;
