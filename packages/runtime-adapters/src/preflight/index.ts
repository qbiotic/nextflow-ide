export interface RuntimePreflightCheck {
  name: string;
  validate(): Promise<boolean>;
}