export interface ViewContribution {
  id: string;
  title: string;
}

export const viewContributions: ViewContribution[] = [];

export * from './runs-tree.js';