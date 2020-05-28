import { ScopedConfig, Config, Scope } from "./ConfigTypes";

export class ScopedPropertyValue implements ScopedConfig {
  public constructor(
    public readonly value: string | number | null,
    public readonly config: Config,
    public readonly scope?: Scope
  ) {}
}
