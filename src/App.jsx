import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Home from './views/Home';
import Dashboard from './views/Dashboard';
import Hardware from './views/Hardware';
import System from './views/System';
import BatteryView from './views/Battery';
import Camera from './views/Camera';
import Sensors from './views/Sensors';
import Benchmark from './views/Benchmark';
import About from './views/About';
import { getDeviceInfo } from './utils/deviceInfo';
import { Cpu } from 'lucide-react';

const BootScreen = () => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg/90 backdrop-blur-xl animate-fade-in">
    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-transparent border border-accent/20 flex items-center justify-center shadow-[0_0_40px_rgba(var(--color-accent),0.2)] mb-8 relative">
       <div className="absolute inset-0 rounded-2xl border-t-2 border-accent animate-spin" style={{ animationDuration: '3s' }}></div>
       <Cpu size={40} className="text-accent animate-pulse" />
    </div>
    <h1 className="text-2xl font-bold font-inter text-transparent bg-clip-text bg-gradient-to-r from-text to-muted tracking-wide mb-2">PHONE INFO</h1>
    <p className="text-sm font-mono text-accent/70 tracking-widest text-center max-w-xs animate-pulse">SCANNING FOR INITIAL HARDWARE</p>
  </div>
);

function App() {
  const [theme, setTheme] = useState('dark'); // Default to dark mode for AMOLED premium look
  const [currentView, setCurrentView] = useState('home');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [viewToRender, setViewToRender] = useState('home');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const [isBooting, setIsBooting] = useState(true);
  const [isNative, setIsNative] = useState(true);
  
  useEffect(() => {
    getDeviceInfo().then((res) => {
      setIsNative(res.isNative);
      // Small artificial delay for premium boot feel
      setTimeout(() => setIsBooting(false), 800);
    });
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const navigateTo = (view) => {
    if (view === currentView) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setViewToRender(view);
      setCurrentView(view);
      setIsTransitioning(false);
    }, 200); // match transition duration
  };

  const handleBack = () => {
    navigateTo('home');
  };

  // Render current view
  const renderView = () => {
    switch (viewToRender) {
      case 'home': return <Home onNavigate={navigateTo} />;
      case 'dashboard': return <Dashboard />;
      case 'hardware': return <Hardware />;
      case 'system': return <System />;
      case 'battery': return <BatteryView />;
      case 'camera': return <Camera />;
      case 'sensors': return <Sensors />;
      case 'benchmark': return <Benchmark />;
      case 'about': return <About />;
      default: return <Home onNavigate={navigateTo} />;
    }
  };

  return (
    <>
    {isBooting && <BootScreen />}
    <div className={`min-h-screen max-w-md mx-auto relative overflow-hidden flex flex-col shadow-2xl bg-bg sm:border-x border-border transition-opacity duration-700 ${isBooting ? 'opacity-0' : 'opacity-100'}`}>
      <Header 
        toggleTheme={toggleTheme} 
        theme={theme} 
        isHome={currentView === 'home'} 
        onBack={handleBack} 
        isNative={isNative}
        title={currentView === 'home' ? 'Phone Info' : currentView.charAt(0).toUpperCase() + currentView.slice(1)} 
      />
      
      <main className="flex-1 w-full relative z-0 hide-scrollbar overflow-y-auto pb-6">
        <div className={`transition-all duration-300 ease-in-out px-4 pt-4 pb-8 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          {renderView()}
        </div>
      </main>

      {currentView === 'home' && (
        <footer className="py-4 text-center text-xs text-muted font-medium flex items-center justify-center gap-2 pb-6">
          <span>Kevin Ranasinghe &copy;</span>
          <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
        </footer>
      )}
    </div>
    </>
  );
}

export default App;
