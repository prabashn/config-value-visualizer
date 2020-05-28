import { ScopedPropertyValue } from "./ScopedPropertyValue";
import { Scope } from "./ConfigTypes";

export class ScopedProperty {
  public readonly children: { [key: string]: ScopedProperty } = {};
  public readonly values: Array<ScopedPropertyValue> = [];

  public constructor(public readonly key: string) {}

  public addLeafValue(value: ScopedPropertyValue): void {
    this.values.push(value);
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
    let clone = new ScopedProperty(this.key);
    clone.values.push(...this.values);
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

    this.values.push(...other.values);

    for (const otherChildPropKey in other.children) {
      const otherChildProp = other.children[otherChildPropKey];
      this.addChildProperty(otherChildProp);
    }
  }

  public static parseObject(
    key: string,
    value: any,
    scope?: Scope
  ): ScopedProperty {
    const scopedProperty = new ScopedProperty(key);

    if (value == null) {
      scopedProperty.addLeafValue(new ScopedPropertyValue(null, scope));
    } else if (value instanceof Array) {
      value.forEach((childValue, valueIndex) => {
        const childKey = `${valueIndex}`;
        const childProp = new ScopedProperty(childKey);
        childProp.merge(
          ScopedProperty.parseObject(childKey, childValue, scope)
        );
        scopedProperty.addChildProperty(childProp);
      });
    } else if (typeof value === "object") {
      for (const childKey in value) {
        const childValue = value[childKey];
        const childProp = new ScopedProperty(childKey);
        childProp.merge(
          ScopedProperty.parseObject(childKey, childValue, scope)
        );
        scopedProperty.addChildProperty(childProp);
      }
    } else {
      scopedProperty.addLeafValue(new ScopedPropertyValue(value, scope));
    }
    return scopedProperty;
  }
}
