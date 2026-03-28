import React from 'react';
import { AlertCircle, Moon, Sun, ChevronLeft } from 'lucide-react';

const Header = ({ toggleTheme, theme, isHome, onBack, title }) => {
  return (
    <header className="sticky top-0 w-full z-50 glass backdrop-blur-md px-4 py-4 flex items-center justify-between shadow-sm border-b border-border transition-colors duration-300">
      <div className="flex-1 flex justify-start">
        {isHome ? (
          <button className="p-2 -ml-2 rounded-full text-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors group relative" title="Report a bug">
            <AlertCircle size={22} className="group-hover:text-red-500 transition-colors" />
          </button>
        ) : (
          <button onClick={onBack} className="p-2 -ml-2 flex items-center gap-1 rounded-full text-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <ChevronLeft size={24} />
          </button>
        )}
      </div>
      
      <div className="flex-2 flex justify-center text-center">
        <h1 className="text-xl font-bold tracking-tight text-text whitespace-nowrap">{title}</h1>
      </div>
      
      <div className="flex-1 flex justify-end">
        <button 
          onClick={toggleTheme}
          className="p-2 -mr-2 rounded-full text-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
