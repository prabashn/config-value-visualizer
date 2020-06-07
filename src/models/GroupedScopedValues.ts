import { ScopedPropertyValue } from "./ScopedPropertyValue";

export class GroupedScopedValues {
  public readonly valueGroupsMap: Map<
    any,
    Array<ScopedPropertyValue>
  > = new Map();

  public addValue(value: ScopedPropertyValue): void {
    let valuesList = this.valueGroupsMap.get(value.value);
    if (!valuesList) {
      this.valueGroupsMap.set(value.value, (valuesList = []));
    } else if (valuesList.some(thisValue => thisValue.equals(value))) {
      // make sure we only add unique values
      // (useful when we merge arrays without scoping with the array index)
      return;
    }

    valuesList.push(value);
  }

  public copyFrom(source: GroupedScopedValues): void {
    source.valueGroupsMap.forEach(valueList => {
      valueList.forEach(value => this.addValue(value));
    });
  }

  public map<T>(
    callback: (valueList: Array<ScopedPropertyValue>, keyValue: any) => T
  ): Array<T> {
    let values: Array<T> = [];
    this.valueGroupsMap.forEach((valueList, value) => {
      values.push(callback(valueList, value));
    });
    return values;
  }
}
