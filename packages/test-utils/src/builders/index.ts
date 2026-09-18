export interface FixtureBuilder<TValue> {
  build(): TValue;
}