import React from 'react';
import { SimulationParams } from '../types';

interface ControlPanelProps {
  params: SimulationParams;
  onChange: (next: SimulationParams) => void;
}

const Slider: React.FC<{
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  unit?: string;
  onChange: (v: number) => void;
}> = ({ label, min, max, step, value, unit, onChange }) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[11px] font-mono text-gray-400">
        <span>{label}</span>
        <span className="text-sci-accent font-semibold">{value.toFixed(2)}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-sci-accent"
      />
      <div className="flex justify-between text-[10px] text-gray-600 font-mono">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

const ControlPanel: React.FC<ControlPanelProps> = ({ params, onChange }) => {
  return (
    <aside className="w-80 h-full bg-sci-panel border-l border-gray-800 flex flex-col p-4 gap-4">
      <div>
        <h3 className="font-mono text-xs font-bold text-sci-accent tracking-widest">SYSTEM PARAMETERS</h3>
        <p className="text-[11px] text-gray-500 mt-1">
          Adjust masses, lengths and gravity in real time.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        <Slider
          label="Mass m1"
          min={1}
          max={30}
          step={0.5}
          value={params.m1}
          unit=" kg"
          onChange={(m1) => onChange({ ...params, m1 })}
        />
        <Slider
          label="Mass m2"
          min={1}
          max={30}
          step={0.5}
          value={params.m2}
          unit=" kg"
          onChange={(m2) => onChange({ ...params, m2 })}
        />
        <Slider
          label="Length l1"
          min={50}
          max={250}
          step={5}
          value={params.l1}
          unit=" px"
          onChange={(l1) => onChange({ ...params, l1 })}
        />
        <Slider
          label="Length l2"
          min={50}
          max={250}
          step={5}
          value={params.l2}
          unit=" px"
          onChange={(l2) => onChange({ ...params, l2 })}
        />
        <Slider
          label="Gravity g"
          min={0.1}
          max={3}
          step={0.1}
          value={params.g}
          unit=" m/s²"
          onChange={(g) => onChange({ ...params, g })}
        />
        <Slider
          label="Time Step dt"
          min={0.05}
          max={0.5}
          step={0.01}
          value={params.dt ?? 0.2}
          unit=" s"
          onChange={(dt) => onChange({ ...params, dt })}
        />
        <Slider
          label="Sim Speed"
          min={0.25}
          max={4}
          step={0.25}
          value={params.speed ?? 1}
          unit=" x"
          onChange={(speed) => onChange({ ...params, speed })}
        />
        <Slider
          label="Model Accuracy"
          min={0.1}
          max={3}
          step={0.5}
          value={params.accuracy ?? 1}
          unit=" x"
          onChange={(accuracy) => onChange({ ...params, accuracy })}
        />
      </div>
    </aside>
  );
};

export default ControlPanel;
