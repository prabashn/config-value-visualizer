import { ScopedProperty } from "./ScopedProperty";
import { ScopedConfig } from "./ConfigTypes";

export class ConfigPropertyTree {
  public readonly root: ScopedProperty = new ScopedProperty("properties");

  public constructor(configs: Array<ScopedConfig>) {
    for (const config of configs) {
      const configProperty = ScopedProperty.parseObject(
        this.root.key,
        config.config.properties,
        config
      );
      this.root.merge(configProperty);
    }
  }
}
