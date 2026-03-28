import React from 'react';
import { Info, Code2, Heart, ExternalLink } from 'lucide-react';

const About = () => {
  return (
    <div className="pb-4 animate-fade-in px-4 mt-2">
      <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-accent/10 to-transparent glass-panel border border-border/50 bg-black/5 dark:bg-white/5 rounded-3xl mb-6 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-accent shadow-lg shadow-accent/30 flex items-center justify-center mb-4 transform rotate-12 transition-transform hover:rotate-0 duration-300">
          <Info size={32} className="text-white" />
        </div>
        <h2 className="text-3xl font-bold font-inter tracking-tight mb-1">Phone Info</h2>
        <p className="text-muted font-mono text-sm bg-black/5 dark:bg-white/10 px-3 py-1 rounded">v2.0 (Dynamic Engine)</p>
      </div>

      <div className="glass-panel p-6 rounded-[2rem] space-y-4 text-sm text-text">
        <p className="leading-relaxed">
          This application was reconstructed to ditch static mock data and intelligently extract genuine hardware arrays from deep inside your web browser's limits.
        </p>

        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-xl flex gap-3 text-xs leading-relaxed mt-4">
           <Info size={16} className="shrink-0 mt-0.5" />
           <p>
             <strong>Privacy Sandbox Notice:</strong> Web browsers inherently hide precise temperatures, granular CPU core speeds, and battery cycling to protect you from fingerprint tracking. What you see is the absolute maximum data securely permissible.
           </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <a href="#" className="flex items-center justify-between p-4 glass-panel rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
          <div className="flex items-center gap-3 font-semibold">
            <Code2 size={18} className="text-muted group-hover:text-accent transition-colors" />
            Built with React & Vite
          </div>
          <ExternalLink size={16} className="text-muted/50" />
        </a>
        
        <a href="#" className="flex items-center justify-between p-4 glass-panel rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
          <div className="flex items-center gap-3 font-semibold">
            <Heart size={18} className="text-muted group-hover:text-red-500 transition-colors fill-transparent group-hover:fill-red-500/20" />
            Inspired by Samsung S20 Concept
          </div>
          <ExternalLink size={16} className="text-muted/50" />
        </a>
      </div>

       <div className="text-center mt-12 mb-6">
         <p className="text-xs text-muted font-medium mb-1">DESIGNED & DEVELOPED BY</p>
         <p className="text-sm font-bold tracking-widest uppercase">Kevin Ranasinghe</p>
       </div>
    </div>
  );
};

export default About;
