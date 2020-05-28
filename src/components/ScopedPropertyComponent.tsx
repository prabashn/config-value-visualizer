import * as React from "react";
import { map, groupBy } from "lodash-es";
import { ScopedProperty, ScopedPropertyValue, Scope } from "../models";

export class ScopedPropertyComponent extends React.Component<{
  property: ScopedProperty;
}> {
  render(): React.ReactNode {
    const { property } = this.props;
    return (
      <div className="property" key={property.key}>
        <div className="key">["{property.key}"]</div>
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

    return map(valueGroups, (scopedValues, value) => (
      <div className="value-group">
        <div className="value">
          = {typeof value === "string" ? `"${value}"` : value}
        </div>
        {this.renderScopes(scopedValues)}
      </div>
    ));
  }

  renderScopes(scopedValues: Array<ScopedPropertyValue>): React.ReactNode {
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
            scopedValue.scope &&
            scopedValues.find(v => !v.scope) &&
            scopedValues.length > 1 &&
            !scopedValue.isArrayItem;

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
