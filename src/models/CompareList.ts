import { ScopedConfig } from "./ConfigTypes";
import { isEqual } from "lodash-es";

export type ScopedConfigList = Array<ScopedConfig>;

export interface ScopedConfigDiff {
  firstOnly: ScopedConfigList;
  intersection: ScopedConfigList;
  secondOnly: ScopedConfigList;
}

export class ScopedConfigComparer {
  private first?: ScopedConfigList;
  private second?: ScopedConfigList;

  public setConfigs(config: ScopedConfigList, which: 1 | 2): void {
    if (which === 1) {
      this.first = config;
    } else if (which === 2) {
      this.second = config;
    }
  }

  public getDiff(): ScopedConfigDiff | null {
    const first = this.first;
    const second = this.second;

    if (!first || !second) {
      return null;
    }

    return {
      firstOnly: first.filter(
        item1 => !second.some(item2 => scopedConfigsEqual(item1, item2))
      ),
      secondOnly: second.filter(
        item1 => !first.some(item2 => scopedConfigsEqual(item1, item2))
      ),
      intersection: first.filter(item1 =>
        second.some(item2 => scopedConfigsEqual(item1, item2))
      )
    };
  }
}

function scopedConfigsEqual(
  first: ScopedConfig,
  second: ScopedConfig
): boolean {
  return (
    isEqual(first.scope, second.scope) && first.config._id === second.config._id
  );
}

export const scopedConfigComparer = new ScopedConfigComparer();
