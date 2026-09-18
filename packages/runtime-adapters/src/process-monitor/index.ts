export interface ProcessOutputChunk {
  stream: 'stdout' | 'stderr';
  text: string;
}