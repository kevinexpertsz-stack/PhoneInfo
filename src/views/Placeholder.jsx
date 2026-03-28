import React from 'react';
import { Battery, Camera, Activity, LineChart, Info } from 'lucide-react';

const icons = {
  Battery: Battery,
  Camera: Camera,
  Activity: Activity,
  LineChart: LineChart,
  Info: Info,
};

const Placeholder = ({ title, icon }) => {
  const IconComponent = icons[icon] || Info;

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-fade-in">
      <div className="w-24 h-24 rounded-3xl bg-accent/20 flex items-center justify-center text-accent shadow-lg shadow-accent/20">
        <IconComponent size={48} />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-purple-500">
          {title}
        </h2>
        <p className="text-muted max-w-[250px] mx-auto text-base">
          This section is currently under development. Check back later!
        </p>
      </div>
    </div>
  );
};

export default Placeholder;
