import React from 'react';

const Sidebar: React.FC<any> = () => {
  return (
    <div className="w-20 h-full bg-sci-dark border-r border-gray-800 flex flex-col items-center py-6 gap-8 z-20 shadow-xl">
      <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold font-mono text-xl">
        Y
      </div>

      <div className="flex flex-col w-full gap-4">
        <div className="w-full py-4 flex flex-col items-center gap-1 text-sci-accent border-r-2 border-sci-accent bg-white/5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px] font-mono">CHAOS</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
