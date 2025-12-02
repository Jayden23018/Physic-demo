import React from 'react';
import { Play, RotateCcw, Pause, Activity } from 'lucide-react';
import { SimulationMetrics } from '../types';

interface InfoPanelProps {
  metrics: SimulationMetrics;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  perturbation: number;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ 
  metrics, 
  isPlaying, 
  onTogglePlay, 
  onReset,
  perturbation
}) => {
  const divergencePercent = Math.min((metrics.divergence / 4) * 100, 100);
  
  let phase = "Coherence";
  let phaseColor = "text-emerald-400";
  
  if (metrics.divergence > 0.1) {
    phase = "Divergence";
    phaseColor = "text-yellow-400";
  }
  if (metrics.divergence > 1.2) {
    phase = "Chaos (Bifurcation)";
    phaseColor = "text-rose-500";
  }

  return (
    <div className="absolute top-6 left-6 z-10 w-80 md:w-96">
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-500" />
            The Butterfly Effect
          </h1>
          <p className="text-xs text-slate-400 mt-1">Double Pendulum • Error Propagation</p>
        </div>

        {/* Legend */}
        <div className="space-y-3 mb-6 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
              <span className="text-sm font-medium text-slate-200">Ground Truth</span>
            </div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Physics</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>
              <span className="text-sm font-medium text-rose-500">AI Prediction</span>
            </div>
             <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Error: {perturbation}</span>
          </div>
        </div>

        {/* Live Metrics */}
        <div className="space-y-4 mb-8">
           <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">System State</span>
              <span className={`font-mono font-bold ${phaseColor}`}>{phase}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
               <div 
                  className={`h-full transition-all duration-300 ${metrics.divergence > 1.2 ? 'bg-rose-500' : metrics.divergence > 0.1 ? 'bg-yellow-400' : 'bg-emerald-400'}`}
                  style={{ width: `${Math.max(5, divergencePercent)}%` }}
               />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
               <span className="text-[10px] text-slate-400 uppercase block mb-1">Elapsed Time</span>
               <span className="text-lg font-mono text-white">{metrics.time.toFixed(1)}s</span>
             </div>
             <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
               <span className="text-[10px] text-slate-400 uppercase block mb-1">Divergence</span>
               <span className="text-lg font-mono text-white">{metrics.divergence.toFixed(4)}</span>
             </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="text-xs text-slate-400 leading-relaxed mb-6 border-l-2 border-rose-500/30 pl-3">
          <p>
            The <span className="text-rose-400 font-bold">Red</span> pendulum starts with a tiny <strong>{perturbation} radian</strong> error. 
            Watch closely at <strong>T=5s</strong> for tremors, and <strong>T=10s</strong> for total separation.
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button 
            onClick={onTogglePlay}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white py-3 rounded-xl transition-all font-medium text-sm shadow-lg shadow-indigo-900/20"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause' : 'Start Simulation'}
          </button>
          
          <button 
            onClick={onReset}
            className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all border border-slate-700"
            aria-label="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};