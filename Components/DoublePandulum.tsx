import React, { useEffect, useRef, useState } from 'react';
import { PendulumState, SimulationParams } from '../types';

interface DoublePendulumProps {
  params: SimulationParams;
  resetToken: number;
}

// RK4 Integrator
const derivative = (state: PendulumState, params: SimulationParams): PendulumState => {
  const { theta1, theta2, omega1, omega2 } = state;
  const { m1, m2, l1, l2, g } = params;

  const num1 = -g * (2 * m1 + m2) * Math.sin(theta1);
  const num2 = -m2 * g * Math.sin(theta1 - 2 * theta2);
  const num3 = -2 * Math.sin(theta1 - theta2) * m2 * (omega2 * omega2 * l2 + omega1 * omega1 * l1 * Math.cos(theta1 - theta2));
  const den = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * theta1 - 2 * theta2));
  
  const dOmega1 = (num1 + num2 + num3) / den;

  const num4 = 2 * Math.sin(theta1 - theta2);
  const num5 = (omega1 * omega1 * l1 * (m1 + m2));
  const num6 = g * (m1 + m2) * Math.cos(theta1);
  const num7 = omega2 * omega2 * l2 * m2 * Math.cos(theta1 - theta2);
  const den2 = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * theta1 - 2 * theta2));

  const dOmega2 = (num4 * (num5 + num6 + num7)) / den2;

  return {
    theta1: omega1,
    theta2: omega2,
    omega1: dOmega1,
    omega2: dOmega2
  };
};

const integrate = (state: PendulumState, dt: number, params: SimulationParams): PendulumState => {
  const k1 = derivative(state, params);
  
  const k2State = {
    theta1: state.theta1 + k1.theta1 * dt * 0.5,
    theta2: state.theta2 + k1.theta2 * dt * 0.5,
    omega1: state.omega1 + k1.omega1 * dt * 0.5,
    omega2: state.omega2 + k1.omega2 * dt * 0.5,
  };
  const k2 = derivative(k2State, params);

  const k3State = {
    theta1: state.theta1 + k2.theta1 * dt * 0.5,
    theta2: state.theta2 + k2.theta2 * dt * 0.5,
    omega1: state.omega1 + k2.omega1 * dt * 0.5,
    omega2: state.omega2 + k2.omega2 * dt * 0.5,
  };
  const k3 = derivative(k3State, params);

  const k4State = {
    theta1: state.theta1 + k3.theta1 * dt,
    theta2: state.theta2 + k3.theta2 * dt,
    omega1: state.omega1 + k3.omega1 * dt,
    omega2: state.omega2 + k3.omega2 * dt,
  };
  const k4 = derivative(k4State, params);

  return {
    theta1: state.theta1 + (dt / 6) * (k1.theta1 + 2 * k2.theta1 + 2 * k3.theta1 + k4.theta1),
    theta2: state.theta2 + (dt / 6) * (k1.theta2 + 2 * k2.theta2 + 2 * k3.theta2 + k4.theta2),
    omega1: state.omega1 + (dt / 6) * (k1.omega1 + 2 * k2.omega1 + 2 * k3.omega1 + k4.omega1),
    omega2: state.omega2 + (dt / 6) * (k1.omega2 + 2 * k2.omega2 + 2 * k3.omega2 + k4.omega2),
  };
};

const DoublePendulum: React.FC<DoublePendulumProps> = ({ params, resetToken }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [divergence, setDivergence] = useState(0);
  const requestRef = useRef<number>(0);
  
  // State 1: "Real" Physics (White)
  const realState = useRef<PendulumState>({ theta1: Math.PI / 2, theta2: Math.PI / 2, omega1: 0, omega2: 0 });
  // State 2: "AI Prediction" (Red) - Initial Error 0.001
  const aiState = useRef<PendulumState>({ theta1: Math.PI / 2 + 0.001, theta2: Math.PI / 2, omega1: 0, omega2: 0 });

  const traceReal = useRef<{x: number, y: number, v: number}[]>([]);
  const traceAI = useRef<{x: number, y: number, v: number}[]>([]);

  const drawVector = (ctx: CanvasRenderingContext2D, x: number, y: number, vx: number, vy: number, color: string, label?: boolean) => {
    const scale = 2.0; 
    const arrowLen = Math.sqrt(vx*vx + vy*vy) * scale;
    if (arrowLen < 2) return; // Don't draw tiny vectors

    // Draw Arrow
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + vx * scale, y + vy * scale);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2; // Thicker lines
    ctx.stroke();

    // Arrowhead
    const angle = Math.atan2(vy, vx);
    const headLen = 8; // Larger arrowhead
    ctx.beginPath();
    ctx.moveTo(x + vx * scale, y + vy * scale);
    ctx.lineTo(x + vx * scale - headLen * Math.cos(angle - Math.PI / 6), y + vy * scale - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x + vx * scale - headLen * Math.cos(angle + Math.PI / 6), y + vy * scale - headLen * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(x + vx * scale, y + vy * scale);
    ctx.fillStyle = color;
    ctx.fill();
    
    // Label magnitude with high visibility background
    if (label) {
      const mag = Math.sqrt(vx*vx + vy*vy).toFixed(1);
      const angleDeg = (angle * 180 / Math.PI).toFixed(0);
      
      ctx.font = "bold 13px JetBrains Mono";
      const text1 = `v = ${mag} m/s`;
      const text2 = `φ = ${angleDeg}°`;
      
      const metrics1 = ctx.measureText(text1);
      const metrics2 = ctx.measureText(text2);
      const boxWidth = Math.max(metrics1.width, metrics2.width) + 20;
      const boxHeight = 44;
      
      // Offset box to not cover bob
      const boxX = x + 25;
      const boxY = y + 10;

      // Draw backdrop plate
      ctx.save();
      ctx.fillStyle = "rgba(10, 10, 11, 0.9)"; // Dark, nearly opaque background
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 4);
      ctx.fill();
      ctx.stroke();
      
      // Draw Text
      ctx.fillStyle = "#ffffff"; // Always white text for max contrast
      ctx.fillText(text1, boxX + 10, boxY + 20);
      
      ctx.fillStyle = color; // Secondary color for direction to match the pendulum
      ctx.fillText(text2, boxX + 10, boxY + 38);
      ctx.restore();
    }
  };

  const getCartesian = (s: PendulumState) => {
    const x1 = params.l1 * Math.sin(s.theta1);
    const y1 = params.l1 * Math.cos(s.theta1);
    const x2 = x1 + params.l2 * Math.sin(s.theta2);
    const y2 = y1 + params.l2 * Math.cos(s.theta2);
    
    const vx1 = params.l1 * s.omega1 * Math.cos(s.theta1);
    const vy1 = -params.l1 * s.omega1 * Math.sin(s.theta1);
    
    // Velocity of bob 2 is vector sum
    const vx2 = vx1 + params.l2 * s.omega2 * Math.cos(s.theta2);
    const vy2 = vy1 - params.l2 * s.omega2 * Math.sin(s.theta2);

    return { x1, y1, x2, y2, vx1, vy1, vx2, vy2 };
  };

  const loop = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Physics Update with adjustable speed & accuracy
    const baseDt = params.dt ?? 0.2;
    const speed = params.speed ?? 1;
    const accuracy = params.accuracy ?? 1;

    const effectiveDt = baseDt * speed;
    const substeps = Math.max(1, Math.round(accuracy));

    for (let i = 0; i < substeps; i++) {
      realState.current = integrate(realState.current, effectiveDt / substeps, params);
      aiState.current = integrate(aiState.current, effectiveDt / substeps, params);
    }

    // Calc Divergence (Euclidean distance in phase space approximation)
    const posReal = getCartesian(realState.current);
    const posAI = getCartesian(aiState.current);
    const diff = Math.sqrt(
      Math.pow(posReal.x2 - posAI.x2, 2) + Math.pow(posReal.y2 - posAI.y2, 2)
    );
    setDivergence(diff);

    // Drawing
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    const cx = width / 2;
    const cy = height / 2.5; // Moved pivot up slightly to accommodate larger swing

    // Fade effect for trails
    ctx.fillStyle = 'rgba(10, 10, 11, 0.25)'; 
    ctx.fillRect(0, 0, width, height);

    const drawSystem = (state: PendulumState, trace: any[], color: string, label: string, isAI: boolean) => {
      const { x1, y1, x2, y2, vx1, vy1, vx2, vy2 } = getCartesian(state);
      
      // Update trace
      trace.push({ x: cx + x2, y: cy + y2 });
      if (trace.length > 200) trace.shift(); // Longer trace

      // Trace
      ctx.beginPath();
      if (trace.length > 0) ctx.moveTo(trace[0].x, trace[0].y);
      for (let p of trace) ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = isAI ? 3 : 1;
      ctx.globalAlpha = isAI ? 0.5 : 0.3;
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      // Rods
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + x1, cy + y1);
      ctx.lineTo(cx + x2, cy + y2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3; // Thicker rods
      ctx.stroke();

      // Bobs
      ctx.beginPath();
      ctx.arc(cx + x1, cy + y1, 6, 0, 2 * Math.PI); // Bigger pivot
      ctx.fillStyle = color;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx + x2, cy + y2, 10, 0, 2 * Math.PI); // Bigger main bob
      ctx.fillStyle = color;
      ctx.fill();

      // Vectors (Always draw for active view)
      ctx.globalAlpha = 0.9;
      // Only draw vector labels for the bottom bob to avoid clutter
      drawVector(ctx, cx + x1, cy + y1, vx1, vy1, color, false);
      drawVector(ctx, cx + x2, cy + y2, vx2, vy2, color, true); 
      ctx.globalAlpha = 1.0;
    };

    // Draw AI first (behind)
    drawSystem(aiState.current, traceAI.current, '#ef4444', 'AI', true);
    // Draw Real second (front)
    drawSystem(realState.current, traceReal.current, '#ffffff', 'Real', false);

    if (isRunning) {
      requestRef.current = requestAnimationFrame(loop);
    }
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning, params]);

  useEffect(() => {
    // Whenever resetToken changes (from App), restart initial conditions
    reset();
  }, [resetToken]);

  const reset = () => {
    realState.current = { theta1: Math.PI / 2, theta2: Math.PI / 2, omega1: 0, omega2: 0 };
    aiState.current = { theta1: Math.PI / 2 + 0.001, theta2: Math.PI / 2, omega1: 0, omega2: 0 };
    traceReal.current = [];
    traceAI.current = [];
    setDivergence(0);
    // clear canvas immediately
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-sci-dark overflow-hidden">
      
      {/* Enhanced Description Panel */}
      <div className="absolute top-6 left-8 z-10 bg-black/40 backdrop-blur-md p-5 rounded-xl border border-white/10 shadow-2xl max-w-sm">
        <h2 className="text-3xl font-black font-mono text-white tracking-tighter mb-4">
          CHAOS <span className="text-sci-accent">SANDBOX</span>
        </h2>
        
        <div className="space-y-3 font-mono">
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 border border-white/5">
            <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_10px_white]"></div>
            <div>
              <p className="text-white font-bold text-sm leading-none">Ground Truth</p>
              <p className="text-gray-400 text-[10px]">Hamiltonian Dynamics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-sci-red/10 border border-sci-red/20">
            <div className="w-3 h-3 rounded-full bg-sci-red shadow-[0_0_10px_#ef4444]"></div>
            <div>
              <p className="text-sci-red font-bold text-sm leading-none">Neural Surrogate</p>
              <p className="text-gray-400 text-[10px]">Approximation Model</p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/10">
             <div className="flex justify-between items-end">
               <span className="text-gray-400 text-xs">Initial Perturbation</span>
               <span className="text-sci-accent font-black text-lg">0.001 rad</span>
             </div>
             <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
               Demonstrates <span className="text-white font-bold">Lyapunov instability</span>: microscopic errors amplify exponentially, preventing long-term AI prediction.
             </p>
          </div>
        </div>
      </div>

      <div className="absolute top-6 right-8 z-10 flex flex-col items-end">
        <div className="bg-sci-panel border border-gray-800 p-4 rounded-lg shadow-2xl backdrop-blur-md">
          <div className="text-xs text-gray-500 font-mono uppercase mb-1">System Divergence</div>
          <div className={`text-3xl font-mono font-bold ${divergence > 100 ? 'text-sci-red' : 'text-emerald-400'}`}>
            Δ {divergence.toFixed(2)}
          </div>
          <div className="h-1 w-40 bg-gray-800 mt-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-100 ${divergence > 100 ? 'bg-sci-red' : 'bg-emerald-400'}`}
              style={{ width: `${Math.min(divergence / 5, 100)}%` }}
            />
          </div>
        </div>
      </div>
      
      <canvas 
        ref={canvasRef} 
        width={1200} 
        height={900} 
        className="rounded-xl"
      />

      <div className="absolute bottom-10 flex gap-4 z-20">
         <button 
          onClick={() => setIsRunning(!isRunning)}
          className="px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-lg font-bold font-mono tracking-widest transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] text-lg"
        >
          {isRunning ? 'FREEZE STATE' : 'RESUME SIM'}
        </button>
        <button 
          onClick={reset}
          className="px-8 py-4 bg-transparent border border-gray-600 text-white hover:border-white hover:bg-white/5 rounded-lg font-mono tracking-widest transition-all text-lg"
        >
          RESET INITIAL CONDITIONS
        </button>
      </div>
    </div>
  );
};

export default DoublePendulum;