import * as React from "react";
import { map } from "lodash-es";
import { ScopedPropertyListComponent } from "./ScopedListComponent";
import { ScopedProperty } from "../models";
import { ScopedValuesListComponent } from "./ScopedValuesListComponent";

export interface ScopedPropertyComponentProps {
  property: ScopedProperty;
  autoExpandScopes?: boolean;
  visibilityDepth?: number;
}

export interface ScopedPropertyComponentState {
  visible: boolean;
  prevProps?: ScopedPropertyComponentProps;
  visibilityDepth?: number;
}

export class ScopedPropertyComponent extends React.Component<
  ScopedPropertyComponentProps,
  ScopedPropertyComponentState
> {
  constructor(props: ScopedPropertyComponentProps) {
    super(props);
    this.state = { visible: true };
  }

  static getDerivedStateFromProps(
    props: ScopedPropertyComponentProps,
    state: ScopedPropertyComponentState
  ): ScopedPropertyComponentState | null {
    // if we detect that the new props are different from the previously stored
    // props in state, that means props have been changed by parent, and we're going to re-render.
    // In this case, we want to make sure we use the props value for scope visibility.
    if (props !== state.prevProps) {
      return {
        prevProps: props,
        visible: (props.visibilityDepth || 0) > 0,
        visibilityDepth: props.visibilityDepth || 0
      };
    }

    // otherwise, use the values already in state -- no overrides needed
    return null;
  }

  render(): React.ReactNode {
    const { property, autoExpandScopes } = this.props;
    const { visible, visibilityDepth = 0 } = this.state;

    return (
      <div className="property" key={property.key}>
        <span className="key">
          ["{property.key}"] {property.isArray ? "(Array)" : ""}
          <input
            type="button"
            value={visible ? "-" : "+"}
            onClick={this.toggleVisibility}
          />
          <input
            type="button"
            value="--"
            onClick={this.collapseVisibilityAll}
          />
          <input type="button" value="++" onClick={this.expandVisibilityAll} />
        </span>
        {/* Render the this property's scopes */}
        {visible && (
          <ScopedPropertyListComponent
            scopedItems={property.mergedConfigs}
            autoExpandScopes={autoExpandScopes}
          />
        )}
        {/* Render the this property's value scopes */}
        {visible && (
          <ScopedValuesListComponent
            scopedValues={property.values}
            autoExpandScopes={autoExpandScopes}
          />
        )}
        {/*recursively nested child property component */}
        {visible &&
          map(property.children, (childProp, key) => (
            <ScopedPropertyComponent
              key={key}
              property={childProp}
              visibilityDepth={visibilityDepth - 1}
              autoExpandScopes={autoExpandScopes}
            />
          ))}
      </div>
    );
  }

  toggleVisibility = () => {
    this.setState({
      ...this.state,
      visible: !this.state.visible
    });
  };

  expandVisibilityAll = () => {
    this.setState({
      ...this.state,
      visible: true,
      visibilityDepth: 1000
    });
  };

  collapseVisibilityAll = () => {
    this.setState({
      ...this.state,
      visible: false,
      visibilityDepth: 0
    });
  };
}
