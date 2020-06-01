import * as React from "react";
import { map } from "lodash-es";
import { ScopedPropertyListComponent } from "./ScopedListComponent";
import { ScopedProperty } from "../models";
import { ScopedValuesListComponent } from "./ScopedValuesListComponent";

export interface ScopedPropertyComponentProps {
  property: ScopedProperty;
  autoExpandScopes?: boolean;
}

export class ScopedPropertyComponent extends React.Component<
  ScopedPropertyComponentProps
> {
  render(): React.ReactNode {
    const { property, autoExpandScopes } = this.props;
    return (
      <div className="property" key={property.key}>
        <div className="key">
          ["{property.key}"] {property.isArray ? "(Array)" : ""}
        </div>
        {/* Render the parent property scopes */}
        <ScopedPropertyListComponent
          scopedItems={property.mergedConfigs}
          autoExpandScopes={autoExpandScopes}
        />
        {/* Render the value scopes */}
        <ScopedValuesListComponent
          scopedValues={property.values}
          autoExpandScopes={autoExpandScopes}
        />
        {map(property.children, (childProp, key) => (
          <ScopedPropertyComponent
            key={key}
            property={childProp}
            autoExpandScopes={autoExpandScopes}
          />
        ))}
      </div>
    );
  }
}
