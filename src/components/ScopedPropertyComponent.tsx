import * as React from "react";
import { map, groupBy } from "lodash-es";
import {
  ScopedProperty,
  ScopedPropertyValue,
  Scope,
  ScopedConfig
} from "../models";

export class ScopedPropertyComponent extends React.Component<{
  property: ScopedProperty;
}> {
  render(): React.ReactNode {
    const { property } = this.props;
    return (
      <div className="property" key={property.key}>
        <div className="key">
          ["{property.key}"] {property.isArray ? "(Array)" : ""}
        </div>
        {this.renderScopes(property.mergedConfigs)}
        {this.renderScopedValues(property.values)}
        {map(property.children, (childProp, key) => (
          <ScopedPropertyComponent key={key} property={childProp} />
        ))}
      </div>
    );
  }

  renderScopedValues(values: Array<ScopedPropertyValue>): React.ReactNode {
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

    return map(valueGroups, (scopedValues, value) => (
      <div className="value-group">
        <div className="value">
          = {typeof value === "string" ? `"${value}"` : value}
        </div>
        {this.renderScopes(scopedValues, canBeRemovedCheck)}
      </div>
    ));
  }

  renderScopes<T extends ScopedConfig>(
    scopedValues: Array<T>,
    canBeRemovedCheck?: (scopedValue: T) => boolean
  ): React.ReactNode {
    const checkForRemovalEligibility =
      // the list of scoped values contains a default scope that we can fallback to
      scopedValues.some(v => !v.scope) &&
      // and we have more than one item in the scope list
      scopedValues.length > 1;

    return (
      <ul>
        {scopedValues.map((scopedValue, index) => {
          const scopeHref = scopedValue.config && scopedValue.config._id;
          const scopeAnchor = scopeHref ? (
            <React.Fragment>
              (
              <a
                href={`https://www.msncms.microsoft.com/amp/document/${scopeHref}?mode=json`}
                target="_new"
              >
                {scopeHref}
              </a>
              )
            </React.Fragment>
          ) : null;

          const canBeRemoved =
            checkForRemovalEligibility &&
            canBeRemovedCheck &&
            canBeRemovedCheck(scopedValue);

          return (
            <li key={index}>
              <span className={canBeRemoved ? "removable-scope" : ""}>
                {JSON.stringify(scopedValue.scope || "default")}
              </span>
              {scopeAnchor}
              {canBeRemoved && <span className="removable"> Redundant</span>}
            </li>
          );
        })}
      </ul>
    );
  }
}
