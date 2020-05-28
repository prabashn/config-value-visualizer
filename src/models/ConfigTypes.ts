export interface IndexType {
  experienceType: string;
  configs: Array<ScopedConfigRef>;
}

export interface ScopedConfigRef {
  href: string;
  description?: string;
  targetScope?: Scope;
}

export interface Scope {
  locale?: {
    language?: string;
    market?: string;
  };
  experimentId?: string;
  browser?: {
    browserType?: string;
  };
}

export interface Config {
  _id: string;
  properties?: any;
}

export interface ScopedConfig {
  scope?: Scope;
  config: Config;
}
