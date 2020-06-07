import * as React from "react";
import { map } from "lodash-es";
import { PropertyScopesListComponent } from "./ScopesListComponent";
import { ScopedProperty } from "../models";
import {
  ScopedValuesListComponent,
  renderSingleValue
} from "./ScopedValuesListComponent";

export interface ScopedPropertyComponentProps {
  property: ScopedProperty;
  autoExpandScopes?: boolean;
  visibilityDepth?: number;
}

export interface ScopedPropertyComponentState {
  childrenVisible: boolean;
  prevProps?: ScopedPropertyComponentProps;
  visibilityDepth?: number;
}

export class ScopedPropertyComponent extends React.Component<
  ScopedPropertyComponentProps,
  ScopedPropertyComponentState
> {
  constructor(props: ScopedPropertyComponentProps) {
    super(props);
    this.state = { childrenVisible: true };
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
        childrenVisible: (props.visibilityDepth || 0) > 0,
        visibilityDepth: props.visibilityDepth || 0
      };
    }

    // otherwise, use the values already in state -- no overrides needed
    return null;
  }

  render(): React.ReactNode {
    const { property, autoExpandScopes } = this.props;
    const { childrenVisible: visible, visibilityDepth = 0 } = this.state;
    const {
      key,
      valueGroups,
      children,
      childrenCount,
      isArray,
      mergedConfigs
    } = property;

    const valueGroupsMap = valueGroups.valueGroupsMap;
    const multiValueMode = valueGroupsMap.size > 1;
    const enableToggle = childrenCount > 0 || multiValueMode;

    return (
      <div className={`property ${isArray ? "array" : ""}`} key={key}>
        {this.renderPropertyContent(enableToggle)}
        {/* only render the visibility toggle buttons if we have any child props or non-single values */}
        {enableToggle && (
          <React.Fragment>
            <input
              type="button"
              value={visible ? "─" : "┿"}
              onClick={this.toggleVisibility}
            />
            <input
              type="button"
              value="─ ─"
              onClick={this.collapseVisibilityAll}
            />
            <input
              type="button"
              value="┿┿"
              onClick={this.expandVisibilityAll}
            />
          </React.Fragment>
        )}
        <PropertyScopesListComponent
          key="childProperties"
          scopedItems={mergedConfigs}
          autoExpandScopes={autoExpandScopes}
        />
        {/* only show nested values list if we haven't inlined due to single value logic */}
        {visible && multiValueMode && (
          <ScopedValuesListComponent
            key="childValues"
            propertyKey={key}
            scopedValueGroups={valueGroups}
            autoExpandScopes={autoExpandScopes}
          />
        )}
        {/* if we're hiding children, do not render the children */}
        {visible &&
          map(children, (childProp, key) => (
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

  renderPropertyContent(enableToggle: boolean): React.ReactNode {
    const { key, isArray } = this.props.property;
    return (
      <React.Fragment>
        <span
          className={`key ${enableToggle ? "toggle" : ""}`}
          onClick={enableToggle ? this.toggleVisibility : undefined}
        >
          ["{key}"]{isArray ? " (Array)" : ""}
        </span>
        {this.tryRenderSingleValue()}
      </React.Fragment>
    );
  }

  tryRenderSingleValue(): React.ReactNode {
    const {
      valueGroups: { valueGroupsMap },
      key
    } = this.props.property;

    if (valueGroupsMap.size !== 1) {
      return null;
    }

    return renderSingleValue(valueGroupsMap.entries().next().value[0], key);
  }

  toggleVisibility = () => {
    this.setState({
      ...this.state,
      childrenVisible: !this.state.childrenVisible
    });
  };

  expandVisibilityAll = () => {
    this.setState({
      ...this.state,
      childrenVisible: true,
      visibilityDepth: 1000
    });
  };

  collapseVisibilityAll = () => {
    this.setState({
      ...this.state,
      childrenVisible: false,
      visibilityDepth: 0
    });
  };
}
