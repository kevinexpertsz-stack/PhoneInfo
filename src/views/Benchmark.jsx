import React, { useState, useEffect } from 'react';
import { LineChart, Play, Loader2, Award, Zap } from 'lucide-react';

const Benchmark = () => {
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(null);
  const [progress, setProgress] = useState(0);

  const runBenchmark = () => {
    setRunning(true);
    setScore(null);
    setProgress(0);

    // Run the benchmark without freezing the UI immediately
    setTimeout(() => {
      let interval = setInterval(() => {
        setProgress(p => {
          if (p >= 95) {
            clearInterval(interval);
            return p;
          }
           return p + 5;
        });
      }, 100);

      const startTime = performance.now();
      
      // We'll use a Promise to offload the heavy work
      new Promise(resolve => {
        setTimeout(() => {
          // Synthetic CPU Stress: Prime number generation
           let primes = 0;
           // Reduced iterations so it doesn't freeze lower end phones for too long
           for (let i = 2; i < 200000; i++) {
             let isPrime = true;
             for (let j = 2; j <= Math.sqrt(i); j++) {
               if (i % j === 0) {
                 isPrime = false;
                 break;
               }
             }
             if (isPrime) primes++;
           }
           resolve(primes);
        }, 10);
      }).then(() => {
         const endTime = performance.now();
         const timeTaken = endTime - startTime;
         
         // Calculate a fake score - lower time = higher score
         // Assuming a 2000ms base line for a lower end device
         const baseScore = 5000;
         const calculatedScore = Math.max(100, Math.floor(baseScore * (1000 / Math.max(timeTaken, 1))));
         
         clearInterval(interval);
         setProgress(100);
         setScore(calculatedScore);
         setRunning(false);
      });
      
    }, 100);
  };

  const getTier = (s) => {
    if (s > 20000) return { label: "Flagship / Desktop", color: "text-purple-500", bg: "bg-purple-500/10" };
    if (s > 8000) return { label: "High-End", color: "text-accent", bg: "bg-accent/10" };
    if (s > 3000) return { label: "Mid-Range", color: "text-emerald-500", bg: "bg-emerald-500/10" };
    return { label: "Entry-Level", color: "text-orange-500", bg: "bg-orange-500/10" };
  };

  return (
    <div className="pb-4 animate-fade-in px-4 mt-2">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
          <LineChart size={20} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text">Benchmark <span className="text-accent text-sm tracking-widest uppercase font-semibold">Beta</span></h2>
          <p className="text-muted text-sm">Synthetic JavaScript Performance</p>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-[2rem] text-center mb-6 shadow-lg shadow-accent/5">
        <div className="relative w-48 h-48 mx-auto mb-6 flex items-center justify-center">
            {/* Circular Progress logic */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-border" />
              <circle cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-accent transition-all duration-300 ease-out" 
                strokeDasharray={`${progress * 2.89} 289`} strokeLinecap="round" />
            </svg>
            
            <div className="z-10 flex flex-col items-center justify-center w-full h-full rounded-full bg-accent/5 backdrop-blur-sm border border-accent/20">
              {running ? (
                <>
                 <Loader2 size={32} className="text-accent animate-spin mb-2" />
                 <span className="font-mono font-bold text-xl text-text">{progress}%</span>
                </>
              ) : score ? (
                <>
                 <span className="text-[10px] uppercase font-bold text-muted tracking-widest mb-1">Score</span>
                 <span className="text-4xl font-bold text-text tracking-tighter">{score.toLocaleString()}</span>
                </>
              ) : (
                <Zap size={48} className="text-accent opacity-50" fill="currentColor" fillOpacity={0.2} />
              )}
            </div>
        </div>

        {!score && !running && (
           <p className="text-muted text-sm max-w-[250px] mx-auto mb-6">
             Test your device's single-core JS execution speed using a synthetic prime number generator.
           </p>
        )}

        {score && !running && (
          <div className="mb-6 animate-fade-in">
             <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${getTier(score).bg} ${getTier(score).color} border border-current/20 font-semibold text-sm`}>
                <Award size={16} />
                {getTier(score).label} Performance
             </div>
          </div>
        )}

        <button 
          onClick={runBenchmark}
          disabled={running}
          className="bg-accent hover:bg-accent/80 text-white font-semibold py-3 px-8 rounded-full transition-colors w-full active:scale-95 shadow-lg shadow-accent/30 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
        >
          {running ? "Testing Operations..." : score ? "Run Again" : "Start Benchmark"}
          {!running && !score && <Play size={18} fill="currentColor" />}
        </button>
      </div>

       {score && (
         <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl text-center text-xs text-muted">
           Scores are synthetic and bound to your browser version. Using a desktop browser will yield vastly higher scores than mobile.
         </div>
       )}
    </div>
  );
};

export default Benchmark;
