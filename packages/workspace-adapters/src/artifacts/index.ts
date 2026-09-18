export interface ArtifactLocation {
  kind: 'report' | 'trace' | 'timeline';
  path: string;
}