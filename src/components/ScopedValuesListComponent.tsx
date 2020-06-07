import * as React from "react";
import { ScopedPropertyValue, GroupedScopedValues } from "../models";
import { ScopesListComponent } from "./ScopesListComponent";

export interface ScopedValuesListComponentProps {
  propertyKey: string;
  scopedValueGroups: GroupedScopedValues;
  autoExpandScopes?: boolean;
}

export class ScopedValuesListComponent extends React.Component<
  ScopedValuesListComponentProps
> {
  render(): React.ReactNode {
    const canBeRemovedCheck = (scopedValue: ScopedPropertyValue) =>
      // this scope is a non-default scope
      scopedValue.scope != null &&
      // and the value is not part of an array
      !scopedValue.isArrayItem;

    return this.props.scopedValueGroups.map((scopedValues, value) => {
      const checkForRemovalEligibility =
        // the list of scoped values contains a default scope that we can fallback to
        scopedValues.some(v => !v.scope) &&
        // and we have more than one item in the scope list
        scopedValues.length > 1;

      return (
        <div className="value-group" key={value}>
          {renderSingleValue(value, this.props.propertyKey)}
          <ScopesListComponent
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
}

export function renderSingleValue(
  value: any,
  propertyKey: string
): React.ReactNode {
  const valueIsString = typeof value === "string";
  const valueAsString = valueIsString ? `"${value}"` : `${value}`;

  if (valueIsString) {
    const hrefMatch =
      propertyKey === "href" &&
      value.match(/experienceConfigIndex\/([a-z0-9]+)$/i);

    if (hrefMatch) {
      const id = hrefMatch[1];
      return (
        <React.Fragment>
          ={" "}
          <a
            className="value"
            href={`?id=${id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {valueAsString}
          </a>
        </React.Fragment>
      );
    }
  }

  return <span className="value">= {valueAsString}</span>;
}
