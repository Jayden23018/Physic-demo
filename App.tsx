import React from 'react';
import Sidebar from './Components/Sidebar';
import DoublePendulum from './Components/DoublePandulum';
import RightPanel from './Components/RightPanel';
import { useState, useCallback } from 'react';
import { SimulationParams } from './types';

const App: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>({
    m1: 10,
    m2: 10,
    l1: 150,
    l2: 150,
    g: 1,
    dt: 0.2,
    speed: 1,
    accuracy: 1,
  });
  const [resetToken, setResetToken] = useState(0);

  const handleParamsChange = useCallback((next: SimulationParams) => {
    setParams(next);
    setResetToken((t) => t + 1);
  }, []);

  return (
    <div className="flex w-screen h-screen bg-black text-white overflow-hidden font-sans">
      {/* Navigation */}
      <Sidebar currentView="double" setView={() => {}} />

      {/* Main Content Area */}
      <main className="flex-1 relative h-full">
        <DoublePendulum params={params} resetToken={resetToken} />
      </main>

      {/* Right panel: AI chat / system parameters */}
      <RightPanel params={params} onChange={handleParamsChange} />
    </div>
  );
};

export default App;
