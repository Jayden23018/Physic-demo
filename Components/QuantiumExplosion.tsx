import React, { useState, useEffect, useRef } from 'react';
import { 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';

const QuantumExplosion: React.FC = () => {
  const [qubits, setQubits] = useState(3);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Constants for simulation
  const MAX_QUBITS = 16;
  const THRESHOLD = 10; // "Quantum Supremacy" or ML collapse point in this demo

  // Data Generation for Charts
  const data = Array.from({ length: MAX_QUBITS }, (_, i) => {
    const n = i + 1;
    const states = Math.pow(2, n);
    
    // Simulation: Classical ML accuracy holds up until complexity explodes
    // Sigmoid-like collapse curve
    let accuracy = 100;
    if (n > 8) {
      const decay = Math.pow(1.8, n - 8);
      accuracy = Math.max(0, 100 - decay * 5);
    }
    
    // Simulation: Entanglement Entropy S(rho) increases linearly/logarithmically with system size
    const entropy = (n * 0.85).toFixed(2);

    return {
      n,
      statesLog: Math.log10(states), // Use log scale for chart readability
      statesReal: states,
      accuracy,
      entropy
    };
  });

  const currentData = data[qubits - 1];
  const currentStateCount = currentData.statesReal;
  const currentAccuracy = currentData.accuracy;
  const isCollapsed = qubits > THRESHOLD;

  // Auto-play logic
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setQubits(prev => {
          if (prev >= MAX_QUBITS) {
            setIsAutoPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 800);
    } else {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying]);

  // Visual Matrix Logic
  // We limit rendered blocks to preserve DOM performance, but style them to look "dense"
  const MAX_VISUAL_BLOCKS = 1024; 
  const visualBlockCount = Math.min(currentStateCount, MAX_VISUAL_BLOCKS);
  
  // Dynamic Grid Density
  const getGridCols = () => {
    if (visualBlockCount <= 16) return 'grid-cols-4';
    if (visualBlockCount <= 64) return 'grid-cols-8';
    if (visualBlockCount <= 256) return 'grid-cols-16';
    return 'grid-cols-32'; // Dense mode
  };

  return (
    <div className="w-full h-full flex flex-col p-6 lg:p-10 bg-sci-dark text-white overflow-y-auto">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-6">
        <div>
          <h2 className="text-4xl font-bold font-mono mb-2 tracking-tighter">
            HILBERT SPACE <span className={isCollapsed ? "text-sci-red" : "text-sci-accent"}>EXPLOSION</span>
          </h2>
          <p className="text-gray-400 max-w-2xl font-light text-sm lg:text-base">
            Simulating the breakdown of Classical Neural Networks when facing Quantum State Space ($2^n$).
            <br/>
            <span className="text-xs font-mono text-gray-500">
              OBSERVATION: As entanglement grows, local correlations vanish, blinding classical approximations.
            </span>
          </p>
        </div>
        <button 
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className={`px-6 py-2 font-mono text-sm font-bold rounded-lg border transition-all ${
            isAutoPlaying 
              ? 'bg-sci-red/20 text-sci-red border-sci-red animate-pulse' 
              : 'bg-sci-accent/10 text-sci-accent border-sci-accent hover:bg-sci-accent/20'
          }`}
        >
          {isAutoPlaying ? '[ STOP EVOLUTION ]' : '[ RUN EVOLUTION ]'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 flex-1 min-h-0">
        
        {/* CONTROL & METRICS PANEL */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          {/* Main Slider Panel */}
          <div className="bg-sci-panel p-6 rounded-xl border border-gray-800 shadow-lg relative overflow-hidden">
            <div className={`absolute top-0 right-0 p-2 opacity-20 font-black text-9xl select-none transition-colors duration-500 ${isCollapsed ? 'text-sci-red' : 'text-sci-accent'}`}>
              {qubits}
            </div>

            <div className="relative z-10">
              <label className="font-mono text-xs text-sci-accent uppercase tracking-widest mb-2 block">System Size (Qubits)</label>
              
              <div className="flex items-center gap-4 mb-8">
                <input 
                  type="range" 
                  min="1" 
                  max={MAX_QUBITS} 
                  step="1"
                  value={qubits}
                  onChange={(e) => {
                    setIsAutoPlaying(false);
                    setQubits(parseInt(e.target.value));
                  }}
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
                <span className="font-mono text-xl font-bold w-8 text-right">{qubits}</span>
              </div>

              <div className="space-y-6">
                {/* Metric 1: Dimension */}
                <div>
                  <div className="flex justify-between text-xs font-mono text-gray-500 mb-1">
                    <span>STATE VECTOR DIMENSION ($2^n$)</span>
                    <span>HILBERT SPACE</span>
                  </div>
                  <div className={`text-3xl font-mono transition-colors ${isCollapsed ? 'text-sci-red' : 'text-white'}`}>
                    {currentStateCount.toLocaleString()}
                  </div>
                  {isCollapsed && <div className="text-[10px] text-sci-red animate-pulse">{'>>'} MEMORY OVERFLOW HAZARD</div>}
                </div>

                {/* Metric 2: Entropy */}
                <div>
                  <div className="flex justify-between text-xs font-mono text-gray-500 mb-1">
                    <span>ENTANGLEMENT ENTROPY $S(\rho)$</span>
                    <span>VON NEUMANN</span>
                  </div>
                  <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-purple-500 transition-all duration-300"
                      style={{ width: `${(parseFloat(currentData.entropy) / 14) * 100}%` }}
                    />
                  </div>
                  <div className="text-right text-xs font-mono text-purple-400 mt-1">{currentData.entropy} bits</div>
                </div>

                {/* Metric 3: Model Accuracy */}
                <div className="pt-4 border-t border-gray-800">
                  <div className="flex justify-between text-xs font-mono text-gray-500 mb-1">
                    <span>CLASSICAL NN FIDELITY</span>
                    <span>ACCURACY</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className={`text-4xl font-bold font-mono transition-all ${currentAccuracy < 50 ? 'text-gray-600 blur-[1px]' : 'text-emerald-400'}`}>
                      {currentAccuracy.toFixed(1)}%
                    </span>
                    {currentAccuracy < 10 && <span className="text-xs text-sci-red mb-2 font-mono">SIGNAL LOST</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Explanation Box */}
          <div className={`flex-1 p-6 rounded-xl border border-dashed transition-colors duration-500 flex items-center ${isCollapsed ? 'border-sci-red/50 bg-sci-red/5' : 'border-gray-700 bg-gray-900/30'}`}>
            <p className="text-sm font-mono leading-relaxed text-gray-400">
              <span className={isCollapsed ? "text-sci-red font-bold" : "text-sci-accent font-bold"}>
                {isCollapsed ? "CRITICAL PHASE: " : "COHERENT PHASE: "}
              </span>
              {isCollapsed 
                ? "Exponential dimensionality prevents the neural network from mapping the state space. The system exhibits 'Barren Plateaus' in optimization landscapes."
                : "The quantum system is small enough to be efficiently simulated. Classical shadows can reconstruct the density matrix."
              }
            </p>
          </div>
        </div>

        {/* VISUALIZATION AREA */}
        <div className="xl:col-span-8 flex flex-col gap-6 h-full min-h-[500px]">
          
          {/* CHART */}
          <div className="bg-sci-panel p-4 rounded-xl border border-gray-800 h-1/2 relative">
             <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <defs>
                  <linearGradient id="colorStates" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#222" strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="n" 
                  stroke="#666" 
                  label={{ value: 'Qubits (n)', position: 'insideBottomRight', offset: -10, fill: '#666', fontSize: 12 }} 
                />
                
                {/* Left Y Axis: Dimensions (Log) */}
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  stroke="#3b82f6" 
                  label={{ value: 'Log(States)', angle: -90, position: 'insideLeft', fill: '#3b82f6', fontSize: 12 }}
                />
                
                {/* Right Y Axis: Accuracy */}
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke={isCollapsed ? "#ef4444" : "#10b981"} 
                  label={{ value: 'AI Accuracy %', angle: 90, position: 'insideRight', fill: isCollapsed ? '#ef4444' : '#10b981', fontSize: 12 }}
                />

                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                  itemStyle={{ fontFamily: 'monospace' }}
                  labelStyle={{ color: '#aaa', marginBottom: '0.5rem' }}
                />

                <ReferenceLine x={THRESHOLD} stroke="#ef4444" strokeDasharray="3 3" yAxisId="left" label={{ value: "COLLAPSE POINT", fill: "#ef4444", fontSize: 10, position: 'insideTopLeft' }} />

                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="statesLog" 
                  name="Complexity (Log)"
                  stroke="#3b82f6" 
                  fill="url(#colorStates)" 
                  animationDuration={300}
                />
                <Line 
                  yAxisId="right"
                  type="stepAfter" 
                  dataKey="accuracy" 
                  name="AI Model Fidelity"
                  stroke={currentAccuracy < 50 ? "#ef4444" : "#10b981"} 
                  strokeWidth={2}
                  dot={false}
                  animationDuration={300}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* MATRIX VISUALIZATION */}
          <div className="flex-1 bg-black rounded-xl border border-gray-800 p-4 relative overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-2">
               <span className="text-[10px] font-mono text-gray-500 uppercase">Vector Space Visualization</span>
               <span className="text-[10px] font-mono text-gray-500">
                 {visualBlockCount < currentStateCount ? `RENDER LIMITED (${visualBlockCount}/${currentStateCount})` : 'FULL STATE RENDER'}
               </span>
            </div>
            
            <div className={`flex-1 grid ${getGridCols()} gap-[1px] content-start overflow-hidden transition-all duration-300`}>
              {Array.from({ length: visualBlockCount }).map((_, i) => (
                <div 
                  key={i}
                  className={`
                    w-full h-full min-h-[4px] rounded-[1px] transition-all duration-300
                    ${isCollapsed ? 'bg-red-500/40' : 'bg-cyan-500/40'}
                  `}
                  style={{
                    opacity: isCollapsed 
                      ? Math.random() * 0.5 + 0.1 // Noisy/Glitchy effect
                      : 1 - (i / visualBlockCount) * 0.5, // Orderly gradient
                    animation: isCollapsed ? `pulse ${Math.random() * 0.5 + 0.1}s infinite` : 'none'
                  }}
                />
              ))}
            </div>

            {/* Collapse Overlay */}
            {isCollapsed && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
                <div className="text-5xl font-black text-white/5 tracking-widest uppercase">Uncomputable</div>
                <div className="text-sci-red font-mono text-xs mt-2 bg-black/80 px-2 py-1 border border-sci-red/30">
                  ⚠️ HILBERT SPACE DIMENSION EXCEEDS CLASSICAL CAPACITY
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default QuantumExplosion;