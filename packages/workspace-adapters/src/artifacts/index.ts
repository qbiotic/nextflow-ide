import type { ArtifactKind } from '@nextflow-ide/domain';

export interface ArtifactLocation {
  kind: ArtifactKind;
  path: string;
  exists: boolean;
}