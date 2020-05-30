import { ScopedConfig, Config, Scope } from "./ConfigTypes";
import { isEqual } from "lodash-es";

export class ScopedPropertyValue implements ScopedConfig {
  public constructor(
    public readonly value: string | number | null,
    public readonly config: Config,
    public readonly scope?: Scope,
    public readonly isArrayItem?: boolean
  ) {}

  public equals(other: ScopedPropertyValue): boolean {
    return isEqual(this, other);
  }
}
