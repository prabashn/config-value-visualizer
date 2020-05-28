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
        <ul>{this.renderScopes(scopedValues.map(value => value.scope))}</ul>
      </div>
    ));
  }

  renderScopes(scopes: Array<Scope | undefined>): React.ReactNode {
    return (
      <ul>
        {scopes.map((scope, index) => (
          <li key={index}>{JSON.stringify(scope || "default")}</li>
        ))}
      </ul>
    );
  }
}
