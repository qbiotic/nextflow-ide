export interface UiCommandMessage {
  type: string;
  payload?: unknown;
}

export interface UiEventMessage {
  type: string;
  payload?: unknown;
}