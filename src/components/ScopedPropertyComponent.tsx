import * as React from "react";
import { map } from "lodash-es";
import { ScopedPropertyListComponent } from "./ScopedListComponent";
import { ScopedProperty } from "../models";
import { ScopedValuesListComponent } from "./ScopedValuesListComponent";

export class ScopedPropertyComponent extends React.Component<{
  property: ScopedProperty;
  autoExpandScopes?: boolean;
}> {
  render(): React.ReactNode {
    const { property } = this.props;
    return (
      <div className="property" key={property.key}>
        <div className="key">
          ["{property.key}"] {property.isArray ? "(Array)" : ""}
        </div>
        {/* Render the parent property scopes */}
        <ScopedPropertyListComponent
          scopedItems={property.mergedConfigs}
          autoExpandScopes={this.props.autoExpandScopes}
        />
        {/* Render the value scopes */}
        <ScopedValuesListComponent
          scopedValues={property.values}
          autoExpandScopes={this.props.autoExpandScopes}
        />
        {map(property.children, (childProp, key) => (
          <ScopedPropertyComponent key={key} property={childProp} />
        ))}
      </div>
    );
  }
}
