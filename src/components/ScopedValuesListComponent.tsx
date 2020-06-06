import * as React from "react";
import { map, groupBy } from "lodash-es";
import { ScopedPropertyValue } from "../models";
import { ScopedListComponent } from "./ScopedListComponent";

export interface ScopedValuesListComponentProps {
  propertyKey: string;
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
          <span className="value">= {this.renderValue(value)}</span>
          <ScopedListComponent
            scopedItems={scopedValues}
            autoExpandScopes={this.props.autoExpandScopes}
            canBeRemovedCheck={
              checkForRemovalEligibility ? canBeRemovedCheck : undefined
            }
          />
        </div>
      );
    });
  }

  private renderValue(value: any): React.ReactNode {
    const valueIsString = typeof value === "string";
    const valueAsString = valueIsString ? `"${value}"` : `${value}`;

    if (valueIsString) {
      const hrefMatch =
        this.props.propertyKey === "href" &&
        value.match(/experienceConfigIndex\/([a-z0-9]+)$/i);

      if (hrefMatch) {
        const id = hrefMatch[1];
        return (
          <a href={`?id=${id}`} target="_blank" rel="noopener noreferrer">
            {valueAsString}
          </a>
        );
      }
    }

    return valueAsString;
  }
}
