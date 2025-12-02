export enum ViewMode {
  DOUBLE_PENDULUM = 'DOUBLE_PENDULUM',
  QUANTUM_COMPLEXITY = 'QUANTUM_COMPLEXITY'
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface PendulumState {
  theta1: number;
  theta2: number;
  omega1: number;
  omega2: number;
}

export interface SimulationParams {
  m1: number;
  m2: number;
  l1: number;
  l2: number;
  g: number;
}

export interface SimulationConfig {
  g: number;
  m1: number;
  m2: number;
  l1: number;
  l2: number;
  dt: number;
}

export interface SimulationMetrics {
  time: number;
  divergence: number;
}