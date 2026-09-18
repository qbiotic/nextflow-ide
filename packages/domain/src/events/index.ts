export interface ExecutionEvent {
  runId: string;
  kind: 'started' | 'log' | 'completed' | 'failed';
  message: string;
  timestamp: string;
}