import { Scope } from "./ConfigTypes";

export class ScopedPropertyValue {
  public constructor(
    public readonly value: string | number | null,
    public readonly scope?: Scope
  ) {}
}
