export type StateType = 'idle' | 'action' | 'decision' | 'error';

export interface StateData {
  id: string;
  name: string;
  type: StateType;
  description: string;
  entry_action: string;
  exit_action: string;
  parameters: string; // JSON string
}

export interface TransitionData {
  id: string;
  source: string;
  target: string;
  event: string;
}

export type AppMode = 'builder' | 'viewer';
