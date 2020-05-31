import * as React from "react";
import { map, groupBy } from "lodash-es";
import { ScopedPropertyValue } from "../models";
import { ScopedListComponent } from "./ScopedListComponent";

export interface ScopedValuesListComponentProps {
  scopedValues: Array<ScopedPropertyValue>;
  autoExpandScopes?: boolean;
}

export class ScopedValuesListComponent extends React.Component<
  ScopedValuesListComponentProps
> {
  render(): React.ReactNode {
    const values = this.props.scopedValues;
    const valueGroups = groupBy(values, val => val.value);

    // const uniqueValues = Object.keys(valueGroups);
    // if (uniqueValues.length <= 1) {
    //   const uniqueValue = uniqueValues[0];
    //   const scopeCount = valueGroups[uniqueValue]?.length;
    //   const scopeCounter = scopeCount ? ` (${scopeCount})` : "";
    //   return (
    //     <div className="value">
    //       {uniqueValue}{scopeCounter}
    //     </div>
    //   );
    // }

    const canBeRemovedCheck = (scopedValue: ScopedPropertyValue) =>
      // this scope is a non-default scope
      scopedValue.scope != null &&
      // and the value is not part of an array
      !scopedValue.isArrayItem;

    return map(valueGroups, (scopedValues, value) => {
      const checkForRemovalEligibility =
        // the list of scoped values contains a default scope that we can fallback to
        scopedValues.some(v => !v.scope) &&
        // and we have more than one item in the scope list
        scopedValues.length > 1;

      return (
        <div className="value-group">
          <div className="value">
            = {typeof value === "string" ? `"${value}"` : value}
          </div>

          <ScopedListComponent
            scopedItems={scopedValues}
            checkForRemovalEligibility={checkForRemovalEligibility}
            canBeRemovedCheck={canBeRemovedCheck}
          />
        </div>
      );
    });
  }
}
