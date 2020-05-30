import { ScopedPropertyValue } from "./ScopedPropertyValue";
import { ScopedConfig, Scope } from "./ConfigTypes";
import { isEqual } from "lodash-es";

export class ScopedProperty {
  public readonly mergedConfigs: Array<ScopedConfig> = [];
  public readonly children: { [key: string]: ScopedProperty } = {};
  public readonly values: Array<ScopedPropertyValue> = [];

  public get isArray() {
    return this._isArray;
  }

  public constructor(
    public readonly key: string,
    parentConfig: ScopedConfig | null,
    private _isArray?: boolean
  ) {
    if (parentConfig) {
      this.addMergedConfig(parentConfig);
    }
  }

  public addLeafValue(otherValue: ScopedPropertyValue): void {
    // make sure we only add unique values
    // (useful when we merge arrays without scoping with the array index)
    if (this.values.some(thisValue => thisValue.equals(otherValue))) {
      return;
    }

    this.values.push(otherValue);
  }

  public addChildProperty(otherProp: ScopedProperty): void {
    const existingProp = this.children[otherProp.key];
    if (existingProp) {
      existingProp.merge(otherProp);
      return;
    }

    this.children[otherProp.key] = otherProp.clone();
  }

  private clone(): ScopedProperty {
    let clone = new ScopedProperty(
      this.key,
      null /** already added via the mergedConfigs list below */,
      this.isArray
    );

    clone.values.push(...this.values);
    clone.mergedConfigs.push(...this.mergedConfigs);

    for (const childKey in this.children) {
      clone.children[childKey] = this.children[childKey].clone();
    }
    return clone;
  }

  public merge(other: ScopedProperty): void {
    if (this.key !== other.key) {
      throw new Error(
        `Attempted to merge properties with different keys: this key := ${
          this.key
        }, other key := ${other.key}`
      );
    }

    if (other._isArray) {
      this._isArray = true;
    }

    other.values.forEach(value => this.addLeafValue(value));
    other.mergedConfigs.forEach(otherConfig =>
      this.addMergedConfig(otherConfig)
    );

    for (const otherChildPropKey in other.children) {
      const otherChildProp = other.children[otherChildPropKey];
      this.addChildProperty(otherChildProp);
    }
  }

  private addMergedConfig(config: ScopedConfig): void {
    if (
      this.mergedConfigs.some(mergedConfig => isEqual(mergedConfig, config))
    ) {
      return;
    }

    this.mergedConfigs.push(config);
  }

  public static parseObject(
    key: string,
    value: any,
    config: ScopedConfig,
    isArrayItem: boolean,
    flattenArrays: boolean
  ): ScopedProperty {
    // handle arrays separately since we need to set the isArray ctor property
    if (value instanceof Array) {
      const scopedProperty = new ScopedProperty(key, config, true);

      if (flattenArrays) {
        // merge array items as part of the owning object instead of as [0], [1], keys
        value.forEach(childValue => {
          var itemAsFakeProperty = ScopedProperty.parseObject(
            key,
            childValue,
            config,
            true,
            flattenArrays
          );
          scopedProperty.merge(itemAsFakeProperty);
        });
      } else {
        value.forEach((childValue, valueIndex) => {
          const childKey = `${valueIndex}`;
          const childProp = new ScopedProperty(childKey, config);
          childProp.merge(
            ScopedProperty.parseObject(
              childKey,
              childValue,
              config,
              true,
              flattenArrays
            )
          );
          scopedProperty.addChildProperty(childProp);
        });
      }

      return scopedProperty;
    }

    // other cases - complex objects & atom types
    const scopedProperty = new ScopedProperty(key, config);

    if (value == null) {
      scopedProperty.addLeafValue(
        new ScopedPropertyValue(null, config.config, config.scope, isArrayItem)
      );
    } else if (typeof value === "object") {
      for (const childKey in value) {
        const childValue = value[childKey];
        const childProp = new ScopedProperty(childKey, config);
        childProp.merge(
          ScopedProperty.parseObject(
            childKey,
            childValue,
            config,
            isArrayItem,
            flattenArrays
          )
        );
        scopedProperty.addChildProperty(childProp);
      }
    } else {
      scopedProperty.addLeafValue(
        new ScopedPropertyValue(value, config.config, config.scope, isArrayItem)
      );
    }

    return scopedProperty;
  }
}
